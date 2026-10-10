package com.smartroute.algorithm;

import java.util.Objects;
import java.util.UUID;

/**
 * Represents a node in the graph network (e.g., a distribution center, warehouse, or customer drop-off).
 */
public record GraphNode(
        UUID id,
        String name,
        double latitude,
        double longitude,
        String description
) {
    public GraphNode {
        Objects.requireNonNull(id, "Node id cannot be null");
        Objects.requireNonNull(name, "Node name cannot be null");
        if (latitude < -90.0 || latitude > 90.0) {
            throw new IllegalArgumentException("Latitude must be between -90 and 90 degrees. Received: " + latitude);
        }
        if (longitude < -180.0 || longitude > 180.0) {
            throw new IllegalArgumentException("Longitude must be between -180 and 180 degrees. Received: " + longitude);
        }
    }
}
