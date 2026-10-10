package com.smartroute.dto;

import java.util.List;
import java.util.Map;

public record DashboardSummaryDto(
        long totalLocations,
        long totalRoads,
        long totalRoutesCalculated,
        Double lastCalculatedRouteDistanceKm,
        List<RouteHistorySummaryDto> recentRoutes,
        Map<String, Long> algorithmUsageStats,
        List<LocationDto> networkPreviewNodes,
        List<RoadDto> networkPreviewRoads
) {}
