package com.smartroute.dto;

import java.time.Instant;
import java.util.UUID;

public record RoadDto(
        UUID id,
        UUID sourceLocationId,
        String sourceLocationName,
        UUID destinationLocationId,
        String destinationLocationName,
        Double distanceKm,
        Double durationMinutes,
        boolean bidirectional,
        Instant createdAt
) {}
