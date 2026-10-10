package com.smartroute.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

public record BenchmarkRunRequest(
        @Min(value = 10, message = "Node count must be at least 10")
        @Max(value = 2000, message = "Node count cannot exceed 2000 for interactive demo")
        int nodeCount,

        @Min(value = 1, message = "Iterations must be at least 1")
        @Max(value = 20, message = "Iterations cannot exceed 20")
        int iterations,

        Long seed
) {
    public BenchmarkRunRequest {
        if (nodeCount <= 0) nodeCount = 100;
        if (iterations <= 0) iterations = 5;
        if (seed == null) seed = 42L;
    }
}
