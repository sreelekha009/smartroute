package com.smartroute.service;

import com.smartroute.dto.*;
import com.smartroute.exception.UnreachableDestinationException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("local")
@DisplayName("RouteService Spring Integration Tests")
class RouteServiceIntegrationTest {

    @Autowired
    private RouteService routeService;

    @Autowired
    private LocationService locationService;

    @Autowired
    private DashboardService dashboardService;

    // Fixed UUIDs from V2__seed_dublin_data.sql
    private final UUID airportId = UUID.fromString("11111111-0000-0000-0000-000000000002");
    private final UUID grandCanalDockId = UUID.fromString("11111111-0000-0000-0000-000000000007");
    private final UUID disconnectedId = UUID.fromString("11111111-0000-0000-0000-000000000022");
    private final UUID portId = UUID.fromString("11111111-0000-0000-0000-000000000001");
    private final UUID ballsbridgeId = UUID.fromString("11111111-0000-0000-0000-000000000008");
    private final UUID sandyfordId = UUID.fromString("11111111-0000-0000-0000-000000000020");

    @Test
    @DisplayName("Should verify seed data is populated and dashboard reports metrics")
    void testSeedDataAndDashboard() {
        DashboardSummaryDto summary = dashboardService.getDashboardSummary();
        assertNotNull(summary);
        assertTrue(summary.totalLocations() >= 22, "At least 22 seeded locations expected");
        assertTrue(summary.totalRoads() >= 38, "At least 38 seeded roads expected");
        assertTrue(summary.totalRoutesCalculated() >= 3, "Initial seed routes expected");
        assertFalse(summary.recentRoutes().isEmpty());
    }

    @Test
    @DisplayName("Should calculate shortest route between Dublin Airport and Grand Canal Dock via Dijkstra")
    void testCalculateShortestRouteDijkstra() {
        ShortestRouteRequest req = new ShortestRouteRequest(airportId, grandCanalDockId, "DIJKSTRA");
        ShortestRouteResponse resp = routeService.calculateShortestRoute(req);

        assertNotNull(resp);
        assertTrue(resp.pathFound());
        assertEquals("Dijkstra", resp.algorithm());
        assertFalse(resp.pathLocations().isEmpty());
        assertEquals("Dublin Airport Cargo Hub", resp.pathLocations().get(0).name());
        assertEquals("Grand Canal Dock Silicon Docks", resp.pathLocations().get(resp.pathLocations().size() - 1).name());
        assertTrue(resp.totalDistanceKm() > 5.0);
        assertNotNull(resp.historyId());
    }

    @Test
    @DisplayName("A* and Dijkstra should find equal optimal cost on Dublin network")
    void testDijkstraAndAStarCostAgreement() {
        ShortestRouteResponse dijkstraResp = routeService.calculateShortestRoute(
                new ShortestRouteRequest(airportId, grandCanalDockId, "DIJKSTRA"));
        ShortestRouteResponse aStarResp = routeService.calculateShortestRoute(
                new ShortestRouteRequest(airportId, grandCanalDockId, "ASTAR"));

        assertTrue(dijkstraResp.pathFound());
        assertTrue(aStarResp.pathFound());
        assertEquals(dijkstraResp.totalDistanceKm(), aStarResp.totalDistanceKm(), 0.001,
                "Dijkstra and A* must return identical optimal distance");
    }

    @Test
    @DisplayName("Should throw UnreachableDestinationException for disconnected fixture")
    void testDisconnectedRouteThrows() {
        ShortestRouteRequest req = new ShortestRouteRequest(airportId, disconnectedId, "DIJKSTRA");
        assertThrows(UnreachableDestinationException.class, () -> routeService.calculateShortestRoute(req));
    }

    @Test
    @DisplayName("Should calculate multi-stop route with return to depot")
    void testMultiStopWithReturnToDepot() {
        MultiStopRouteRequest req = new MultiStopRouteRequest(
                portId,
                List.of(ballsbridgeId, sandyfordId),
                true
        );

        MultiStopRouteResponse resp = routeService.calculateMultiStopRoute(req);

        assertNotNull(resp);
        assertTrue(resp.returnedToDepot());
        assertEquals(3, resp.legs().size());
        assertEquals("Dublin Port Freight Terminal", resp.depot().name());
        assertEquals("Dublin Port Freight Terminal", resp.orderedStops().get(0).name());
        assertEquals("Dublin Port Freight Terminal", resp.orderedStops().get(resp.orderedStops().size() - 1).name());
        assertTrue(resp.totalDistanceKm() > 0.0);
    }
}
