package com.smartroute.dto;

import jakarta.validation.constraints.*;
import java.util.UUID;

public record CreateRoadRequest(
        @NotNull(message = "Source location ID is required")
        UUID sourceLocationId,

        @NotNull(message = "Destination location ID is required")
        UUID destinationLocationId,

        @NotNull(message = "Distance in km is required")
        @DecimalMin(value = "0.0", message = "Distance must be non-negative")
        Double distanceKm,

        @DecimalMin(value = "0.0", message = "Duration must be non-negative")
        Double durationMinutes,

        boolean bidirectional
) {}
