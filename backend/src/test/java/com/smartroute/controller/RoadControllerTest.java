package com.smartroute.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartroute.dto.CreateRoadRequest;
import com.smartroute.dto.RoadDto;
import com.smartroute.service.RoadService;
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

@WebMvcTest(RoadController.class)
@DisplayName("RoadController WebMvc Slices")
class RoadControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private RoadService roadService;

    @Test
    @DisplayName("GET /api/roads should return road list")
    void testGetAllRoads() throws Exception {
        UUID id = UUID.randomUUID();
        UUID src = UUID.randomUUID();
        UUID dst = UUID.randomUUID();

        when(roadService.getAllRoads()).thenReturn(List.of(
                new RoadDto(id, src, "Source City", dst, "Dest City", 4.5, 8.0, true, Instant.now())
        ));

        mockMvc.perform(get("/api/roads"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].sourceLocationName").value("Source City"))
                .andExpect(jsonPath("$[0].distanceKm").value(4.5));
    }

    @Test
    @DisplayName("POST /api/roads with valid payload should return 201 Created")
    void testCreateRoad() throws Exception {
        UUID id = UUID.randomUUID();
        UUID src = UUID.randomUUID();
        UUID dst = UUID.randomUUID();

        CreateRoadRequest req = new CreateRoadRequest(src, dst, 4.5, 8.0, true);
        RoadDto dto = new RoadDto(id, src, "Source City", dst, "Dest City", 4.5, 8.0, true, Instant.now());

        when(roadService.createRoad(any())).thenReturn(dto);

        mockMvc.perform(post("/api/roads")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.distanceKm").value(4.5));
    }
}
