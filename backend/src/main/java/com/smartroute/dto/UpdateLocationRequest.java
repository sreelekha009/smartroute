package com.smartroute.dto;

import jakarta.validation.constraints.*;

public record UpdateLocationRequest(
        @NotBlank(message = "Location name is required")
        @Size(max = 120, message = "Location name cannot exceed 120 characters")
        String name,

        @NotNull(message = "Latitude is required")
        @DecimalMin(value = "-90.0", message = "Latitude must be >= -90.0")
        @DecimalMax(value = "90.0", message = "Latitude must be <= 90.0")
        Double latitude,

        @NotNull(message = "Longitude is required")
        @DecimalMin(value = "-180.0", message = "Longitude must be >= -180.0")
        @DecimalMax(value = "180.0", message = "Longitude must be <= 180.0")
        Double longitude,

        @Size(max = 255, message = "Description cannot exceed 255 characters")
        String description
) {}
