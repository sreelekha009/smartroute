package com.smartroute.model;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "route_history")
public class RouteHistoryEntity {

    @Id
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @Column(name = "algorithm", nullable = false, length = 64)
    private String algorithm;

    @Column(name = "source_name", nullable = false, length = 120)
    private String sourceName;

    @Column(name = "destination_name", nullable = false, length = 120)
    private String destinationName;

    @Column(name = "total_distance_km", nullable = false)
    private Double totalDistanceKm;

    @Column(name = "node_count", nullable = false)
    private Integer nodeCount;

    @Column(name = "path_json", columnDefinition = "TEXT", nullable = false)
    private String pathJson;

    @Column(name = "execution_time_ms", nullable = false)
    private Double executionTimeMs;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    public RouteHistoryEntity() {
    }

    public RouteHistoryEntity(UUID id, String algorithm, String sourceName, String destinationName,
                              Double totalDistanceKm, Integer nodeCount, String pathJson,
                              Double executionTimeMs) {
        this.id = id != null ? id : UUID.randomUUID();
        this.algorithm = algorithm;
        this.sourceName = sourceName;
        this.destinationName = destinationName;
        this.totalDistanceKm = totalDistanceKm;
        this.nodeCount = nodeCount;
        this.pathJson = pathJson;
        this.executionTimeMs = executionTimeMs;
        this.createdAt = Instant.now();
    }

    @PrePersist
    public void prePersist() {
        if (this.id == null) {
            this.id = UUID.randomUUID();
        }
        if (this.createdAt == null) {
            this.createdAt = Instant.now();
        }
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getAlgorithm() {
        return algorithm;
    }

    public void setAlgorithm(String algorithm) {
        this.algorithm = algorithm;
    }

    public String getSourceName() {
        return sourceName;
    }

    public void setSourceName(String sourceName) {
        this.sourceName = sourceName;
    }

    public String getDestinationName() {
        return destinationName;
    }

    public void setDestinationName(String destinationName) {
        this.destinationName = destinationName;
    }

    public Double getTotalDistanceKm() {
        return totalDistanceKm;
    }

    public void setTotalDistanceKm(Double totalDistanceKm) {
        this.totalDistanceKm = totalDistanceKm;
    }

    public Integer getNodeCount() {
        return nodeCount;
    }

    public void setNodeCount(Integer nodeCount) {
        this.nodeCount = nodeCount;
    }

    public String getPathJson() {
        return pathJson;
    }

    public void setPathJson(String pathJson) {
        this.pathJson = pathJson;
    }

    public Double getExecutionTimeMs() {
        return executionTimeMs;
    }

    public void setExecutionTimeMs(Double executionTimeMs) {
        this.executionTimeMs = executionTimeMs;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
