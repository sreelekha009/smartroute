package com.smartroute.algorithm;

import java.util.Objects;
import java.util.UUID;

/**
 * Represents a directed weighted connection between two locations in the logistics graph.
 */
public record GraphEdge(
        UUID id,
        UUID sourceId,
        UUID destinationId,
        double distanceKm,
        Double durationMinutes
) {
    public GraphEdge {
        Objects.requireNonNull(sourceId, "Edge sourceId cannot be null");
        Objects.requireNonNull(destinationId, "Edge destinationId cannot be null");
        if (Double.isNaN(distanceKm) || Double.isInfinite(distanceKm) || distanceKm < 0.0) {
            throw new IllegalArgumentException("Edge distance must be finite and non-negative. Received: " + distanceKm);
        }
        if (durationMinutes != null && (Double.isNaN(durationMinutes) || Double.isInfinite(durationMinutes) || durationMinutes < 0.0)) {
            throw new IllegalArgumentException("Edge duration must be finite and non-negative. Received: " + durationMinutes);
        }
    }
}
