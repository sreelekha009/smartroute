package com.smartroute.exception;

/**
 * Thrown when graph construction violates domain integrity constraints
 * (e.g., negative edge weights, invalid coordinates, non-existent endpoints).
 */
public class InvalidGraphException extends RuntimeException {
    public InvalidGraphException(String message) {
        super(message);
    }
}
