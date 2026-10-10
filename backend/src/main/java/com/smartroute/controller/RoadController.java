package com.smartroute.controller;

import com.smartroute.dto.CreateRoadRequest;
import com.smartroute.dto.RoadDto;
import com.smartroute.dto.UpdateRoadRequest;
import com.smartroute.service.RoadService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/roads")
@Tag(name = "Roads", description = "Management of directed and bidirectional road network edges")
public class RoadController {

    private final RoadService roadService;

    public RoadController(RoadService roadService) {
        this.roadService = roadService;
    }

    @GetMapping
    @Operation(summary = "Retrieve all road connections in the network")
    public ResponseEntity<List<RoadDto>> getAllRoads() {
        return ResponseEntity.ok(roadService.getAllRoads());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a road connection by its UUID")
    public ResponseEntity<RoadDto> getRoadById(@PathVariable UUID id) {
        return ResponseEntity.ok(roadService.getRoadById(id));
    }

    @PostMapping
    @Operation(summary = "Create a directed or bidirectional road connection")
    public ResponseEntity<RoadDto> createRoad(@Valid @RequestBody CreateRoadRequest request) {
        RoadDto created = roadService.createRoad(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update road distance, duration, or bidirectional status")
    public ResponseEntity<RoadDto> updateRoad(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateRoadRequest request) {
        return ResponseEntity.ok(roadService.updateRoad(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a road connection from the network")
    public ResponseEntity<Void> deleteRoad(@PathVariable UUID id) {
        roadService.deleteRoad(id);
        return ResponseEntity.noContent().build();
    }
}
