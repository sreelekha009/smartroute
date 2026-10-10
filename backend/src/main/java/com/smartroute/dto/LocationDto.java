package com.smartroute.dto;

import java.time.Instant;
import java.util.UUID;

public record LocationDto(
        UUID id,
        String name,
        Double latitude,
        Double longitude,
        String description,
        Instant createdAt
) {}
