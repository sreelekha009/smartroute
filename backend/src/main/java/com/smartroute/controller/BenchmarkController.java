package com.smartroute.controller;

import com.smartroute.dto.BenchmarkRunRequest;
import com.smartroute.dto.BenchmarkRunResponse;
import com.smartroute.service.BenchmarkService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/benchmarks")
@Tag(name = "Algorithm Benchmarking", description = "Performance measurements on reproducible synthetic networks")
public class BenchmarkController {

    private final BenchmarkService benchmarkService;

    public BenchmarkController(BenchmarkService benchmarkService) {
        this.benchmarkService = benchmarkService;
    }

    @PostMapping("/run")
    @Operation(summary = "Run in-memory benchmarking suite across Dijkstra, A*, BFS, and DFS on synthetic graphs")
    public ResponseEntity<BenchmarkRunResponse> runBenchmark(
            @Valid @RequestBody BenchmarkRunRequest request) {
        return ResponseEntity.ok(benchmarkService.runBenchmark(request));
    }
}
