package com.smartroute.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "roads")
public class RoadEntity {

    @Id
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @NotNull(message = "Source location is required")
    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "source_location_id", nullable = false)
    private LocationEntity sourceLocation;

    @NotNull(message = "Destination location is required")
    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "destination_location_id", nullable = false)
    private LocationEntity destinationLocation;

    @NotNull(message = "Distance in km is required")
    @DecimalMin(value = "0.0", message = "Distance must be non-negative")
    @Column(name = "distance_km", nullable = false)
    private Double distanceKm;

    @DecimalMin(value = "0.0", message = "Duration must be non-negative")
    @Column(name = "duration_minutes")
    private Double durationMinutes;

    @Column(name = "bidirectional", nullable = false)
    private boolean bidirectional = false;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    public RoadEntity() {
    }

    public RoadEntity(UUID id, LocationEntity sourceLocation, LocationEntity destinationLocation,
                      Double distanceKm, Double durationMinutes, boolean bidirectional) {
        this.id = id != null ? id : UUID.randomUUID();
        this.sourceLocation = sourceLocation;
        this.destinationLocation = destinationLocation;
        this.distanceKm = distanceKm;
        this.durationMinutes = durationMinutes;
        this.bidirectional = bidirectional;
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

    public LocationEntity getSourceLocation() {
        return sourceLocation;
    }

    public void setSourceLocation(LocationEntity sourceLocation) {
        this.sourceLocation = sourceLocation;
    }

    public LocationEntity getDestinationLocation() {
        return destinationLocation;
    }

    public void setDestinationLocation(LocationEntity destinationLocation) {
        this.destinationLocation = destinationLocation;
    }

    public Double getDistanceKm() {
        return distanceKm;
    }

    public void setDistanceKm(Double distanceKm) {
        this.distanceKm = distanceKm;
    }

    public Double getDurationMinutes() {
        return durationMinutes;
    }

    public void setDurationMinutes(Double durationMinutes) {
        this.durationMinutes = durationMinutes;
    }

    public boolean isBidirectional() {
        return bidirectional;
    }

    public void setBidirectional(boolean bidirectional) {
        this.bidirectional = bidirectional;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
