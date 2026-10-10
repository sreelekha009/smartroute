package com.smartroute.dto;

import java.util.List;

public record BenchmarkRunResponse(
        int nodeCount,
        int edgeCount,
        int iterations,
        long seed,
        List<AlgorithmMetric> metrics,
        String methodologyNotes,
        String jvmLimitationsExplanation
) {
    public record AlgorithmMetric(
            String algorithm,
            double medianTimeMs,
            double minTimeMs,
            double maxTimeMs,
            int medianVisitedNodes,
            double pathDistanceKm,
            boolean pathFound,
            String complexityOrder
    ) {}
}
