package com.smartroute.dto;

import java.time.Instant;
import java.util.UUID;

public record RouteHistorySummaryDto(
        UUID id,
        String algorithm,
        String sourceName,
        String destinationName,
        Double totalDistanceKm,
        Integer nodeCount,
        Double executionTimeMs,
        Instant createdAt
) {}
