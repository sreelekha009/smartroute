package com.smartroute.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartroute.dto.CreateLocationRequest;
import com.smartroute.dto.LocationDto;
import com.smartroute.exception.ResourceNotFoundException;
import com.smartroute.service.LocationService;
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

@WebMvcTest(LocationController.class)
@DisplayName("LocationController WebMvc Slices")
class LocationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private LocationService locationService;

    @Test
    @DisplayName("GET /api/locations should return list of locations")
    void testGetAllLocations() throws Exception {
        UUID id = UUID.randomUUID();
        when(locationService.getAllLocations()).thenReturn(List.of(
                new LocationDto(id, "Depot A", 53.3498, -6.2603, "Main Hub", Instant.now())
        ));

        mockMvc.perform(get("/api/locations"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("Depot A"))
                .andExpect(jsonPath("$[0].latitude").value(53.3498));
    }

    @Test
    @DisplayName("POST /api/locations with valid body should return 201 Created")
    void testCreateLocationSuccess() throws Exception {
        UUID id = UUID.randomUUID();
        CreateLocationRequest req = new CreateLocationRequest("New Hub", 53.35, -6.25, "New facility");
        LocationDto dto = new LocationDto(id, "New Hub", 53.35, -6.25, "New facility", Instant.now());

        when(locationService.createLocation(any())).thenReturn(dto);

        mockMvc.perform(post("/api/locations")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("New Hub"))
                .andExpect(jsonPath("$.id").value(id.toString()));
    }

    @Test
    @DisplayName("POST /api/locations with invalid latitude should return 400 Bad Request")
    void testCreateLocationInvalidCoordinates() throws Exception {
        CreateLocationRequest req = new CreateLocationRequest("Invalid Lat", 95.0, -6.25, "Invalid");

        mockMvc.perform(post("/api/locations")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Validation Failed"))
                .andExpect(jsonPath("$.validationErrors.latitude").exists());
    }

    @Test
    @DisplayName("GET /api/locations/{id} with unknown ID should return 404 Not Found")
    void testGetLocationNotFound() throws Exception {
        UUID id = UUID.randomUUID();
        when(locationService.getLocationById(id)).thenThrow(new ResourceNotFoundException("Not found"));

        mockMvc.perform(get("/api/locations/" + id))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").value("Not Found"));
    }
}
