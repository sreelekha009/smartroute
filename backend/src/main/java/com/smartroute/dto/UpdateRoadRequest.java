package com.smartroute.dto;

import jakarta.validation.constraints.*;

public record UpdateRoadRequest(
        @NotNull(message = "Distance in km is required")
        @DecimalMin(value = "0.0", message = "Distance must be non-negative")
        Double distanceKm,

        @DecimalMin(value = "0.0", message = "Duration must be non-negative")
        Double durationMinutes,

        boolean bidirectional
) {}
