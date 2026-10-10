package com.smartroute.controller;

import com.smartroute.dto.*;
import com.smartroute.service.RouteService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/routes")
@Tag(name = "Routing Engine", description = "Shortest path and multi-stop delivery route optimization")
public class RouteController {

    private final RouteService routeService;

    public RouteController(RouteService routeService) {
        this.routeService = routeService;
    }

    @PostMapping("/shortest")
    @Operation(summary = "Calculate shortest route between two locations using Dijkstra, A*, BFS, or DFS")
    public ResponseEntity<ShortestRouteResponse> calculateShortestRoute(
            @Valid @RequestBody ShortestRouteRequest request) {
        return ResponseEntity.ok(routeService.calculateShortestRoute(request));
    }

    @PostMapping("/multi-stop")
    @Operation(summary = "Optimize multi-stop delivery sequence using the Nearest-Neighbor TSP heuristic")
    public ResponseEntity<MultiStopRouteResponse> calculateMultiStopRoute(
            @Valid @RequestBody MultiStopRouteRequest request) {
        return ResponseEntity.ok(routeService.calculateMultiStopRoute(request));
    }

    @GetMapping("/history")
    @Operation(summary = "Retrieve previously calculated routes with algorithm diagnostics")
    public ResponseEntity<List<RouteHistorySummaryDto>> getRouteHistory(
            @RequestParam(defaultValue = "50") int limit) {
        return ResponseEntity.ok(routeService.getRouteHistory(limit));
    }

    @GetMapping("/history/{id}")
    @Operation(summary = "Retrieve full diagnostic breakdown of a historical route calculation")
    public ResponseEntity<RouteHistoryDetailDto> getRouteHistoryById(@PathVariable UUID id) {
        return ResponseEntity.ok(routeService.getRouteHistoryById(id));
    }
}
