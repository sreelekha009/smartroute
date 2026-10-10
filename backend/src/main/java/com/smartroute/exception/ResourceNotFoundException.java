package com.smartroute.exception;

/**
 * Thrown when an entity (Location, Road, Route history) is not found by ID.
 */
public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message) {
        super(message);
    }
}
