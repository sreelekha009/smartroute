package com.smartroute.controller;

import com.smartroute.dto.CreateLocationRequest;
import com.smartroute.dto.LocationDto;
import com.smartroute.dto.UpdateLocationRequest;
import com.smartroute.service.LocationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/locations")
@Tag(name = "Locations", description = "Management of physical network nodes and coordinates")
public class LocationController {

    private final LocationService locationService;

    public LocationController(LocationService locationService) {
        this.locationService = locationService;
    }

    @GetMapping
    @Operation(summary = "Retrieve all registered network locations")
    public ResponseEntity<List<LocationDto>> getAllLocations() {
        return ResponseEntity.ok(locationService.getAllLocations());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a location by its unique UUID")
    public ResponseEntity<LocationDto> getLocationById(@PathVariable UUID id) {
        return ResponseEntity.ok(locationService.getLocationById(id));
    }

    @PostMapping
    @Operation(summary = "Register a new location with valid geographic coordinates")
    public ResponseEntity<LocationDto> createLocation(@Valid @RequestBody CreateLocationRequest request) {
        LocationDto created = locationService.createLocation(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an existing location's metadata or coordinates")
    public ResponseEntity<LocationDto> updateLocation(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateLocationRequest request) {
        return ResponseEntity.ok(locationService.updateLocation(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete an unlinked location from the network")
    public ResponseEntity<Void> deleteLocation(@PathVariable UUID id) {
        locationService.deleteLocation(id);
        return ResponseEntity.noContent().build();
    }
}
