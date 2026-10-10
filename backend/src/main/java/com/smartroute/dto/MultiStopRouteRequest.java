package com.smartroute.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.List;
import java.util.UUID;

public record MultiStopRouteRequest(
        @NotNull(message = "Depot location ID is required")
        UUID depotLocationId,

        @NotEmpty(message = "At least one destination location ID must be specified")
        List<UUID> destinationLocationIds,

        boolean returnToDepot
) {}
