package com.smartroute.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.Map;

@RestController
@RequestMapping("/api/health")
@Tag(name = "Health & Diagnostics", description = "Service health check and telemetry status")
public class HealthController {

    private final Instant startTime = Instant.now();

    @GetMapping
    @Operation(summary = "Check backend service health and uptime")
    public ResponseEntity<Map<String, Object>> getHealth() {
        return ResponseEntity.ok(Map.of(
                "status", "UP",
                "service", "SmartRoute Intelligent Route Planning System",
                "version", "1.0.0",
                "startedAt", startTime,
                "timestamp", Instant.now()
        ));
    }
}
