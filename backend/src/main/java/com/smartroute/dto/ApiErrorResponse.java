package com.smartroute.dto;

import java.time.Instant;
import java.util.Map;

public record ApiErrorResponse(
        int status,
        String error,
        String message,
        String path,
        Instant timestamp,
        Map<String, String> validationErrors
) {
    public static ApiErrorResponse of(int status, String error, String message, String path, Map<String, String> validationErrors) {
        return new ApiErrorResponse(status, error, message, path, Instant.now(), validationErrors);
    }

    public static ApiErrorResponse of(int status, String error, String message, String path) {
        return new ApiErrorResponse(status, error, message, path, Instant.now(), null);
    }
}
