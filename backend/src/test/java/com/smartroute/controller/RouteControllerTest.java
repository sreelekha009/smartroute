package com.smartroute.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartroute.dto.*;
import com.smartroute.exception.UnreachableDestinationException;
import com.smartroute.service.RouteService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(RouteController.class)
@DisplayName("RouteController WebMvc Slices")
class RouteControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private RouteService routeService;

    @Test
    @DisplayName("POST /api/routes/shortest should return shortest route")
    void testCalculateShortestRoute() throws Exception {
        UUID startId = UUID.randomUUID();
        UUID targetId = UUID.randomUUID();
        ShortestRouteRequest req = new ShortestRouteRequest(startId, targetId, "DIJKSTRA");

        LocationDto loc1 = new LocationDto(startId, "Origin", 53.35, -6.26, null, Instant.now());
        LocationDto loc2 = new LocationDto(targetId, "Dest", 53.34, -6.25, null, Instant.now());

        ShortestRouteResponse resp = new ShortestRouteResponse(
                "Dijkstra",
                true,
                List.of(loc1, loc2),
                2.5,
                3.75,
                2,
                0.45,
                "Success",
                UUID.randomUUID()
        );

        when(routeService.calculateShortestRoute(any())).thenReturn(resp);

        mockMvc.perform(post("/api/routes/shortest")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.algorithm").value("Dijkstra"))
                .andExpect(jsonPath("$.totalDistanceKm").value(2.5))
                .andExpect(jsonPath("$.pathLocations.length()").value(2));
    }

    @Test
    @DisplayName("POST /api/routes/shortest with unreachable destination should return 422 Unprocessable Entity")
    void testCalculateShortestRouteUnreachable() throws Exception {
        UUID startId = UUID.randomUUID();
        UUID targetId = UUID.randomUUID();
        ShortestRouteRequest req = new ShortestRouteRequest(startId, targetId, "DIJKSTRA");

        when(routeService.calculateShortestRoute(any()))
                .thenThrow(new UnreachableDestinationException(startId, targetId));

        mockMvc.perform(post("/api/routes/shortest")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.error").value("Unreachable Destination"));
    }
}
