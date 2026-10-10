package com.smartroute.dto;

import java.time.Instant;
import java.util.UUID;

public record RouteHistoryDetailDto(
        UUID id,
        String algorithm,
        String sourceName,
        String destinationName,
        Double totalDistanceKm,
        Integer nodeCount,
        String pathJson,
        Double executionTimeMs,
        Instant createdAt
) {}
