package com.smartroute.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record ShortestRouteRequest(
        @NotNull(message = "Start location ID is required")
        UUID startLocationId,

        @NotNull(message = "Target location ID is required")
        UUID targetLocationId,

        @NotBlank(message = "Algorithm is required (DIJKSTRA, ASTAR, BFS, DFS)")
        String algorithm
) {}
