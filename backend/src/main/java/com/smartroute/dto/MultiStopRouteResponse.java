package com.smartroute.dto;

import java.util.List;
import java.util.UUID;

public record MultiStopRouteResponse(
        LocationDto depot,
        List<LocationDto> orderedStops,
        List<LocationDto> fullPathLocations,
        double totalDistanceKm,
        Double estimatedDurationMinutes,
        List<LegDto> legs,
        int totalVisitedNodes,
        double executionTimeMs,
        boolean returnedToDepot,
        String notes,
        UUID historyId
) {
    public record LegDto(
            int legIndex,
            LocationDto from,
            LocationDto to,
            double distanceKm,
            List<LocationDto> pathLocations
    ) {}
}
