package com.smartroute.service;

import com.smartroute.algorithm.AdjacencyListGraph;
import com.smartroute.algorithm.GraphEdge;
import com.smartroute.algorithm.GraphNode;
import com.smartroute.model.LocationEntity;
import com.smartroute.model.RoadEntity;
import com.smartroute.repository.LocationRepository;
import com.smartroute.repository.RoadRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class GraphProviderService {

    private final LocationRepository locationRepository;
    private final RoadRepository roadRepository;

    public GraphProviderService(LocationRepository locationRepository, RoadRepository roadRepository) {
        this.locationRepository = locationRepository;
        this.roadRepository = roadRepository;
    }

    @Transactional(readOnly = true)
    public AdjacencyListGraph buildGraph() {
        AdjacencyListGraph graph = new AdjacencyListGraph();

        List<LocationEntity> locations = locationRepository.findAll();
        for (LocationEntity loc : locations) {
            graph.addNode(new GraphNode(
                    loc.getId(),
                    loc.getName(),
                    loc.getLatitude(),
                    loc.getLongitude(),
                    loc.getDescription()
            ));
        }

        List<RoadEntity> roads = roadRepository.findAll();
        for (RoadEntity road : roads) {
            UUID sourceId = road.getSourceLocation().getId();
            UUID destId = road.getDestinationLocation().getId();

            // Forward edge
            graph.addEdge(new GraphEdge(
                    road.getId(),
                    sourceId,
                    destId,
                    road.getDistanceKm(),
                    road.getDurationMinutes()
            ));

            // If bidirectional, add reverse edge
            if (road.isBidirectional()) {
                graph.addEdge(new GraphEdge(
                        UUID.randomUUID(),
                        destId,
                        sourceId,
                        road.getDistanceKm(),
                        road.getDurationMinutes()
                ));
            }
        }

        return graph;
    }
}
