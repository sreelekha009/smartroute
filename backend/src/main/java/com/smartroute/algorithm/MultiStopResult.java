package com.smartroute.algorithm;

import java.util.Collections;
import java.util.List;
import java.util.UUID;

/**
 * Result of a multi-stop delivery route optimization.
 */
public record MultiStopResult(
        UUID depotId,
        List<UUID> orderedStopIds,
        List<UUID> fullPathNodeIds,
        double totalDistanceKm,
        List<LegResult> legs,
        int totalVisitedNodes,
        long executionTimeNanos,
        boolean returnedToDepot,
        String notes
) {
    public MultiStopResult {
        if (orderedStopIds == null) orderedStopIds = Collections.emptyList();
        if (fullPathNodeIds == null) fullPathNodeIds = Collections.emptyList();
        if (legs == null) legs = Collections.emptyList();
    }

    public double executionTimeMs() {
        return executionTimeNanos / 1_000_000.0;
    }

    public record LegResult(
            int legIndex,
            UUID fromNodeId,
            UUID toNodeId,
            double distanceKm,
            List<UUID> legPathNodeIds
    ) {}
}
