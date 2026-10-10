package com.smartroute.service;

import com.smartroute.dto.DashboardSummaryDto;
import com.smartroute.dto.LocationDto;
import com.smartroute.dto.RoadDto;
import com.smartroute.dto.RouteHistorySummaryDto;
import com.smartroute.model.RouteHistoryEntity;
import com.smartroute.repository.LocationRepository;
import com.smartroute.repository.RoadRepository;
import com.smartroute.repository.RouteHistoryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class DashboardService {

    private final LocationRepository locationRepository;
    private final RoadRepository roadRepository;
    private final RouteHistoryRepository routeHistoryRepository;
    private final LocationService locationService;
    private final RoadService roadService;
    private final RouteService routeService;

    public DashboardService(LocationRepository locationRepository,
                            RoadRepository roadRepository,
                            RouteHistoryRepository routeHistoryRepository,
                            LocationService locationService,
                            RoadService roadService,
                            RouteService routeService) {
        this.locationRepository = locationRepository;
        this.roadRepository = roadRepository;
        this.routeHistoryRepository = routeHistoryRepository;
        this.locationService = locationService;
        this.roadService = roadService;
        this.routeService = routeService;
    }

    @Transactional(readOnly = true)
    public DashboardSummaryDto getDashboardSummary() {
        long totalLocations = locationRepository.count();
        long totalRoads = roadRepository.count();
        long totalRoutesCalculated = routeHistoryRepository.count();

        Double lastCalculatedRouteDistanceKm = routeHistoryRepository.findTop1ByOrderByCreatedAtDesc()
                .map(RouteHistoryEntity::getTotalDistanceKm)
                .orElse(0.0);

        List<RouteHistorySummaryDto> recentRoutes = routeHistoryRepository.findTop10ByOrderByCreatedAtDesc().stream()
                .map(routeService::toSummaryDto)
                .toList();

        Map<String, Long> algorithmUsageStats = new HashMap<>();
        List<Object[]> rawCounts = routeHistoryRepository.countUsageByAlgorithm();
        for (Object[] row : rawCounts) {
            String algo = (String) row[0];
            Long count = (Long) row[1];
            algorithmUsageStats.put(algo, count);
        }

        List<LocationDto> previewNodes = locationService.getAllLocations();
        List<RoadDto> previewRoads = roadService.getAllRoads();

        return new DashboardSummaryDto(
                totalLocations,
                totalRoads,
                totalRoutesCalculated,
                lastCalculatedRouteDistanceKm,
                recentRoutes,
                algorithmUsageStats,
                previewNodes,
                previewRoads
        );
    }
}
