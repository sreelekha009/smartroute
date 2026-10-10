package com.smartroute.service;

import com.smartroute.dto.CreateRoadRequest;
import com.smartroute.dto.RoadDto;
import com.smartroute.dto.UpdateRoadRequest;
import com.smartroute.exception.InvalidGraphException;
import com.smartroute.exception.ResourceNotFoundException;
import com.smartroute.model.LocationEntity;
import com.smartroute.model.RoadEntity;
import com.smartroute.repository.LocationRepository;
import com.smartroute.repository.RoadRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class RoadService {

    private final RoadRepository roadRepository;
    private final LocationRepository locationRepository;

    public RoadService(RoadRepository roadRepository, LocationRepository locationRepository) {
        this.roadRepository = roadRepository;
        this.locationRepository = locationRepository;
    }

    @Transactional(readOnly = true)
    public List<RoadDto> getAllRoads() {
        return roadRepository.findAll().stream()
                .map(this::toDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public RoadDto getRoadById(UUID id) {
        RoadEntity entity = roadRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Road with ID [" + id + "] not found."));
        return toDto(entity);
    }

    @Transactional
    public RoadDto createRoad(CreateRoadRequest request) {
        if (request.sourceLocationId().equals(request.destinationLocationId())) {
            throw new InvalidGraphException("Self-loop road detected: source and destination locations must be distinct.");
        }

        LocationEntity source = locationRepository.findById(request.sourceLocationId())
                .orElseThrow(() -> new ResourceNotFoundException("Source location [" + request.sourceLocationId() + "] not found."));

        LocationEntity destination = locationRepository.findById(request.destinationLocationId())
                .orElseThrow(() -> new ResourceNotFoundException("Destination location [" + request.destinationLocationId() + "] not found."));

        // Check if road between these locations already exists
        Optional<RoadEntity> existing = roadRepository.findBySourceLocation_IdAndDestinationLocation_Id(
                request.sourceLocationId(), request.destinationLocationId());

        RoadEntity entity;
        if (existing.isPresent()) {
            entity = existing.get();
            entity.setDistanceKm(request.distanceKm());
            entity.setDurationMinutes(request.durationMinutes());
            entity.setBidirectional(request.bidirectional());
        } else {
            entity = new RoadEntity(
                    UUID.randomUUID(),
                    source,
                    destination,
                    request.distanceKm(),
                    request.durationMinutes(),
                    request.bidirectional()
            );
        }

        RoadEntity saved = roadRepository.save(entity);
        return toDto(saved);
    }

    @Transactional
    public RoadDto updateRoad(UUID id, UpdateRoadRequest request) {
        RoadEntity entity = roadRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Road with ID [" + id + "] not found."));

        entity.setDistanceKm(request.distanceKm());
        entity.setDurationMinutes(request.durationMinutes());
        entity.setBidirectional(request.bidirectional());

        RoadEntity updated = roadRepository.save(entity);
        return toDto(updated);
    }

    @Transactional
    public void deleteRoad(UUID id) {
        if (!roadRepository.existsById(id)) {
            throw new ResourceNotFoundException("Road with ID [" + id + "] not found.");
        }
        roadRepository.deleteById(id);
    }

    public RoadDto toDto(RoadEntity entity) {
        return new RoadDto(
                entity.getId(),
                entity.getSourceLocation().getId(),
                entity.getSourceLocation().getName(),
                entity.getDestinationLocation().getId(),
                entity.getDestinationLocation().getName(),
                entity.getDistanceKm(),
                entity.getDurationMinutes(),
                entity.isBidirectional(),
                entity.getCreatedAt()
        );
    }
}
