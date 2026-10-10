package com.smartroute.service;

import com.smartroute.dto.CreateLocationRequest;
import com.smartroute.dto.LocationDto;
import com.smartroute.dto.UpdateLocationRequest;
import com.smartroute.exception.InvalidGraphException;
import com.smartroute.exception.ResourceNotFoundException;
import com.smartroute.model.LocationEntity;
import com.smartroute.model.RoadEntity;
import com.smartroute.repository.LocationRepository;
import com.smartroute.repository.RoadRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class LocationService {

    private final LocationRepository locationRepository;
    private final RoadRepository roadRepository;

    public LocationService(LocationRepository locationRepository, RoadRepository roadRepository) {
        this.locationRepository = locationRepository;
        this.roadRepository = roadRepository;
    }

    @Transactional(readOnly = true)
    public List<LocationDto> getAllLocations() {
        return locationRepository.findAll().stream()
                .map(this::toDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public LocationDto getLocationById(UUID id) {
        LocationEntity entity = locationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Location with ID [" + id + "] not found."));
        return toDto(entity);
    }

    @Transactional
    public LocationDto createLocation(CreateLocationRequest request) {
        if (locationRepository.existsByNameIgnoreCase(request.name().trim())) {
            throw new IllegalArgumentException("A location with the name '" + request.name().trim() + "' already exists.");
        }

        LocationEntity entity = new LocationEntity(
                UUID.randomUUID(),
                request.name().trim(),
                request.latitude(),
                request.longitude(),
                request.description() != null ? request.description().trim() : null
        );

        LocationEntity saved = locationRepository.save(entity);
        return toDto(saved);
    }

    @Transactional
    public LocationDto updateLocation(UUID id, UpdateLocationRequest request) {
        LocationEntity entity = locationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Location with ID [" + id + "] not found."));

        locationRepository.findByNameIgnoreCase(request.name().trim())
                .ifPresent(existing -> {
                    if (!existing.getId().equals(id)) {
                        throw new IllegalArgumentException("Another location named '" + request.name().trim() + "' already exists.");
                    }
                });

        entity.setName(request.name().trim());
        entity.setLatitude(request.latitude());
        entity.setLongitude(request.longitude());
        entity.setDescription(request.description() != null ? request.description().trim() : null);

        LocationEntity updated = locationRepository.save(entity);
        return toDto(updated);
    }

    @Transactional
    public void deleteLocation(UUID id) {
        if (!locationRepository.existsById(id)) {
            throw new ResourceNotFoundException("Location with ID [" + id + "] not found.");
        }

        List<RoadEntity> attachedRoads = roadRepository.findBySourceLocation_IdOrDestinationLocation_Id(id, id);
        if (!attachedRoads.isEmpty()) {
            throw new InvalidGraphException("Cannot delete location because " + attachedRoads.size()
                    + " road connection(s) reference it. Please remove connecting roads first.");
        }

        locationRepository.deleteById(id);
    }

    public LocationDto toDto(LocationEntity entity) {
        return new LocationDto(
                entity.getId(),
                entity.getName(),
                entity.getLatitude(),
                entity.getLongitude(),
                entity.getDescription(),
                entity.getCreatedAt()
        );
    }
}
