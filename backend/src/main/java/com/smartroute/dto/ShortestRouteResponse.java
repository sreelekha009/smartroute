package com.smartroute.dto;

import java.util.List;
import java.util.UUID;

public record ShortestRouteResponse(
        String algorithm,
        boolean pathFound,
        List<LocationDto> pathLocations,
        double totalDistanceKm,
        Double estimatedDurationMinutes,
        int visitedNodeCount,
        double executionTimeMs,
        String notes,
        UUID historyId
) {}
