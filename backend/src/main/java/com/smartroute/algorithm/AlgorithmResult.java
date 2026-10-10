package com.smartroute.algorithm;

import java.util.Collections;
import java.util.List;
import java.util.UUID;

/**
 * Standard output record encapsulating path, metrics, and algorithm runtime diagnostics.
 */
public record AlgorithmResult(
        String algorithmName,
        boolean pathFound,
        List<UUID> pathNodeIds,
        double totalDistanceKm,
        int visitedNodeCount,
        long executionTimeNanos,
        String notes
) {
    public AlgorithmResult {
        if (pathNodeIds == null) {
            pathNodeIds = Collections.emptyList();
        }
    }

    public double executionTimeMs() {
        return executionTimeNanos / 1_000_000.0;
    }

    public static AlgorithmResult unreachable(String algorithmName, int visitedNodeCount, long executionTimeNanos, String notes) {
        return new AlgorithmResult(algorithmName, false, Collections.emptyList(), 0.0, visitedNodeCount, executionTimeNanos, notes);
    }
}
