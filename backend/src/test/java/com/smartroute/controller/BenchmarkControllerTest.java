package com.smartroute.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartroute.dto.BenchmarkRunRequest;
import com.smartroute.dto.BenchmarkRunResponse;
import com.smartroute.service.BenchmarkService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(BenchmarkController.class)
@DisplayName("BenchmarkController WebMvc Slices")
class BenchmarkControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private BenchmarkService benchmarkService;

    @Test
    @DisplayName("POST /api/benchmarks/run should return benchmark metrics")
    void testRunBenchmark() throws Exception {
        BenchmarkRunRequest req = new BenchmarkRunRequest(50, 3, 42L);

        BenchmarkRunResponse.AlgorithmMetric metric = new BenchmarkRunResponse.AlgorithmMetric(
                "Dijkstra", 0.12, 0.10, 0.15, 45, 12.5, true, "O((V+E) log V)"
        );

        BenchmarkRunResponse resp = new BenchmarkRunResponse(
                50, 150, 3, 42L, List.of(metric), "Methodology note", "JMH note"
        );

        when(benchmarkService.runBenchmark(any())).thenReturn(resp);

        mockMvc.perform(post("/api/benchmarks/run")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nodeCount").value(50))
                .andExpect(jsonPath("$.metrics[0].algorithm").value("Dijkstra"));
    }
}
