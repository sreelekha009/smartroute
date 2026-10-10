package com.smartroute.exception;

import java.util.UUID;

/**
 * Thrown when no path exists between requested origin and destination nodes,
 * or when a destination in a multi-stop itinerary cannot be reached.
 */
public class UnreachableDestinationException extends RuntimeException {
    private final UUID sourceId;
    private final UUID destinationId;

    public UnreachableDestinationException(UUID sourceId, UUID destinationId) {
        super("No route exists from location [" + sourceId + "] to location [" + destinationId + "].");
        this.sourceId = sourceId;
        this.destinationId = destinationId;
    }

    public UnreachableDestinationException(String message) {
        super(message);
        this.sourceId = null;
        this.destinationId = null;
    }

    public UUID getSourceId() {
        return sourceId;
    }

    public UUID getDestinationId() {
        return destinationId;
    }
}
