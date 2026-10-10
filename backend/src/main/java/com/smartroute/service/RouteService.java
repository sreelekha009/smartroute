package com.smartroute.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartroute.algorithm.*;
import com.smartroute.dto.*;
import com.smartroute.exception.ResourceNotFoundException;
import com.smartroute.exception.UnreachableDestinationException;
import com.smartroute.model.LocationEntity;
import com.smartroute.model.RouteHistoryEntity;
import com.smartroute.repository.LocationRepository;
import com.smartroute.repository.RouteHistoryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
public class RouteService {

    private final GraphProviderService graphProviderService;
    private final LocationRepository locationRepository;
    private final RouteHistoryRepository routeHistoryRepository;
    private final LocationService locationService;
    private final ObjectMapper objectMapper;

    private final DijkstraAlgorithm dijkstra = new DijkstraAlgorithm();
    private final AStarAlgorithm aStar = new AStarAlgorithm();
    private final BfsAlgorithm bfs = new BfsAlgorithm();
    private final DfsAlgorithm dfs = new DfsAlgorithm();
    private final NearestNeighborTspAlgorithm tsp = new NearestNeighborTspAlgorithm();

    public RouteService(GraphProviderService graphProviderService,
                        LocationRepository locationRepository,
                        RouteHistoryRepository routeHistoryRepository,
                        LocationService locationService,
                        ObjectMapper objectMapper) {
        this.graphProviderService = graphProviderService;
        this.locationRepository = locationRepository;
        this.routeHistoryRepository = routeHistoryRepository;
        this.locationService = locationService;
        this.objectMapper = objectMapper;
    }

    @Transactional
    public ShortestRouteResponse calculateShortestRoute(ShortestRouteRequest request) {
        LocationEntity startEntity = locationRepository.findById(request.startLocationId())
                .orElseThrow(() -> new ResourceNotFoundException("Start location [" + request.startLocationId() + "] not found."));

        LocationEntity targetEntity = locationRepository.findById(request.targetLocationId())
                .orElseThrow(() -> new ResourceNotFoundException("Target location [" + request.targetLocationId() + "] not found."));

        AdjacencyListGraph graph = graphProviderService.buildGraph();

        ShortestPathAlgorithm algorithm = selectAlgorithm(request.algorithm());
        AlgorithmResult result = algorithm.findPath(graph, request.startLocationId(), request.targetLocationId());

        if (!result.pathFound()) {
            throw new UnreachableDestinationException(request.startLocationId(), request.targetLocationId());
        }

        List<LocationDto> pathLocations = new ArrayList<>();
        Map<UUID, LocationEntity> locationMap = new HashMap<>();
        locationRepository.findAllById(result.pathNodeIds()).forEach(loc -> locationMap.put(loc.getId(), loc));

        for (UUID nodeId : result.pathNodeIds()) {
            LocationEntity entity = locationMap.get(nodeId);
            if (entity != null) {
                pathLocations.add(locationService.toDto(entity));
            }
        }

        // Estimate duration assuming 40 km/h average urban speed if road duration is not specified
        double estimatedDurationMinutes = (result.totalDistanceKm() / 40.0) * 60.0;

        // Persist history
        UUID historyId = saveRouteHistory(
                algorithm.getName(),
                startEntity.getName(),
                targetEntity.getName(),
                result.totalDistanceKm(),
                pathLocations.size(),
                pathLocations.stream().map(LocationDto::name).toList(),
                result.executionTimeMs()
        );

        return new ShortestRouteResponse(
                algorithm.getName(),
                true,
                pathLocations,
                result.totalDistanceKm(),
                estimatedDurationMinutes,
                result.visitedNodeCount(),
                result.executionTimeMs(),
                result.notes(),
                historyId
        );
    }

    @Transactional
    public MultiStopRouteResponse calculateMultiStopRoute(MultiStopRouteRequest request) {
        LocationEntity depotEntity = locationRepository.findById(request.depotLocationId())
                .orElseThrow(() -> new ResourceNotFoundException("Depot location [" + request.depotLocationId() + "] not found."));

        for (UUID destId : request.destinationLocationIds()) {
            if (!locationRepository.existsById(destId)) {
                throw new ResourceNotFoundException("Destination location [" + destId + "] not found.");
            }
        }

        AdjacencyListGraph graph = graphProviderService.buildGraph();

        MultiStopResult result = tsp.planRoute(
                graph,
                request.depotLocationId(),
                request.destinationLocationIds(),
                request.returnToDepot()
        );

        // Fetch location entities to assemble full DTO representations
        Set<UUID> allReferencedIds = new HashSet<>(result.fullPathNodeIds());
        allReferencedIds.addAll(result.orderedStopIds());
        allReferencedIds.add(request.depotLocationId());

        Map<UUID, LocationEntity> entityMap = new HashMap<>();
        locationRepository.findAllById(allReferencedIds).forEach(loc -> entityMap.put(loc.getId(), loc));

        LocationDto depotDto = locationService.toDto(depotEntity);

        List<LocationDto> orderedStops = result.orderedStopIds().stream()
                .map(entityMap::get)
                .filter(Objects::nonNull)
                .map(locationService::toDto)
                .toList();

        List<LocationDto> fullPathLocations = result.fullPathNodeIds().stream()
                .map(entityMap::get)
                .filter(Objects::nonNull)
                .map(locationService::toDto)
                .toList();

        List<MultiStopRouteResponse.LegDto> legs = new ArrayList<>();
        for (MultiStopResult.LegResult leg : result.legs()) {
            LocationDto fromLoc = locationService.toDto(entityMap.get(leg.fromNodeId()));
            LocationDto toLoc = locationService.toDto(entityMap.get(leg.toNodeId()));
            List<LocationDto> legPath = leg.legPathNodeIds().stream()
                    .map(entityMap::get)
                    .filter(Objects::nonNull)
                    .map(locationService::toDto)
                    .toList();

            legs.add(new MultiStopRouteResponse.LegDto(
                    leg.legIndex(),
                    fromLoc,
                    toLoc,
                    leg.distanceKm(),
                    legPath
            ));
        }

        double estimatedDurationMinutes = (result.totalDistanceKm() / 40.0) * 60.0;

        String destinationSummary = "Multi-Stop (" + request.destinationLocationIds().size() + " stops"
                + (request.returnToDepot() ? " + return to depot" : "") + ")";

        UUID historyId = saveRouteHistory(
                "TSP Nearest Neighbor",
                depotEntity.getName(),
                destinationSummary,
                result.totalDistanceKm(),
                orderedStops.size(),
                orderedStops.stream().map(LocationDto::name).toList(),
                result.executionTimeMs()
        );

        return new MultiStopRouteResponse(
                depotDto,
                orderedStops,
                fullPathLocations,
                result.totalDistanceKm(),
                estimatedDurationMinutes,
                legs,
                result.totalVisitedNodes(),
                result.executionTimeMs(),
                result.returnedToDepot(),
                result.notes(),
                historyId
        );
    }

    @Transactional(readOnly = true)
    public List<RouteHistorySummaryDto> getRouteHistory(int limit) {
        return routeHistoryRepository.findAllByOrderByCreatedAtDesc().stream()
                .limit(limit > 0 ? limit : 50)
                .map(this::toSummaryDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public RouteHistoryDetailDto getRouteHistoryById(UUID id) {
        RouteHistoryEntity entity = routeHistoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Route history record [" + id + "] not found."));
        return new RouteHistoryDetailDto(
                entity.getId(),
                entity.getAlgorithm(),
                entity.getSourceName(),
                entity.getDestinationName(),
                entity.getTotalDistanceKm(),
                entity.getNodeCount(),
                entity.getPathJson(),
                entity.getExecutionTimeMs(),
                entity.getCreatedAt()
        );
    }

    private ShortestPathAlgorithm selectAlgorithm(String algo) {
        if (algo == null) {
            return dijkstra;
        }
        return switch (algo.toUpperCase().trim()) {
            case "ASTAR", "A*", "A_STAR" -> aStar;
            case "BFS" -> bfs;
            case "DFS" -> dfs;
            case "DIJKSTRA" -> dijkstra;
            default -> throw new IllegalArgumentException("Unknown algorithm '" + algo + "'. Supported: DIJKSTRA, ASTAR, BFS, DFS");
        };
    }

    private UUID saveRouteHistory(String algorithm, String sourceName, String destinationName,
                                  double distance, int nodeCount, List<String> pathNames, double executionTimeMs) {
        String pathJson;
        try {
            pathJson = objectMapper.writeValueAsString(pathNames);
        } catch (JsonProcessingException e) {
            pathJson = String.join(" -> ", pathNames);
        }

        RouteHistoryEntity history = new RouteHistoryEntity(
                UUID.randomUUID(),
                algorithm,
                sourceName,
                destinationName,
                distance,
                nodeCount,
                pathJson,
                executionTimeMs
        );

        return routeHistoryRepository.save(history).getId();
    }

    public RouteHistorySummaryDto toSummaryDto(RouteHistoryEntity entity) {
        return new RouteHistorySummaryDto(
                entity.getId(),
                entity.getAlgorithm(),
                entity.getSourceName(),
                entity.getDestinationName(),
                entity.getTotalDistanceKm(),
                entity.getNodeCount(),
                entity.getExecutionTimeMs(),
                entity.getCreatedAt()
        );
    }
}
