package com.smartroute.service;

import com.smartroute.algorithm.*;
import com.smartroute.dto.BenchmarkRunRequest;
import com.smartroute.dto.BenchmarkRunResponse;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class BenchmarkService {

    private final DijkstraAlgorithm dijkstra = new DijkstraAlgorithm();
    private final AStarAlgorithm aStar = new AStarAlgorithm();
    private final BfsAlgorithm bfs = new BfsAlgorithm();
    private final DfsAlgorithm dfs = new DfsAlgorithm();

    public BenchmarkRunResponse runBenchmark(BenchmarkRunRequest request) {
        int nodeCount = request.nodeCount();
        int iterations = request.iterations();
        long seed = request.seed();

        // 1. Generate deterministic synthetic planar graph
        SyntheticGraphContainer synthetic = generateSyntheticGraph(nodeCount, seed);
        AdjacencyListGraph graph = synthetic.graph();
        UUID startId = synthetic.startId();
        UUID targetId = synthetic.targetId();

        // 2. JVM Warmup: Execute each algorithm several times to trigger JIT compilation
        for (int i = 0; i < 3; i++) {
            dijkstra.findPath(graph, startId, targetId);
            aStar.findPath(graph, startId, targetId);
            bfs.findPath(graph, startId, targetId);
            dfs.findPath(graph, startId, targetId);
        }

        // 3. Timed Iterations for each algorithm
        BenchmarkRunResponse.AlgorithmMetric dijkstraMetric = measureAlgorithm(dijkstra, graph, startId, targetId, iterations, "O((V + E) log V)");
        BenchmarkRunResponse.AlgorithmMetric aStarMetric = measureAlgorithm(aStar, graph, startId, targetId, iterations, "O((V + E) log V) with heuristic pruning");
        BenchmarkRunResponse.AlgorithmMetric bfsMetric = measureAlgorithm(bfs, graph, startId, targetId, iterations, "O(V + E) [unweighted]");
        BenchmarkRunResponse.AlgorithmMetric dfsMetric = measureAlgorithm(dfs, graph, startId, targetId, iterations, "O(V + E) [unweighted]");

        String methodology = "Benchmarking executed in-memory on a reproducible synthetic graph ("
                + nodeCount + " nodes, " + graph.getEdgeCount() + " directed edges, seed=" + seed + "). "
                + "Warmup phase (3 cycles) executed prior to recording to allow JVM JIT compilation. "
                + "Recorded metrics represent the median of " + iterations + " independent iterations.";

        String jvmLimitations = "JVM Benchmarking Limitations Note: Micro-benchmarking inside an active Spring application "
                + "is subject to JVM JIT tiering (C1/C2), garbage collection (GC) safepoints, and CPU cache state. "
                + "For publication-grade algorithmic micro-benchmarks with nanosecond precision, the Java Microbenchmark Harness (JMH) "
                + "is the industry standard, as it provides isolated fork processes, dead-code elimination safeguards, and steady-state thermal stabilization.";

        return new BenchmarkRunResponse(
                nodeCount,
                graph.getEdgeCount(),
                iterations,
                seed,
                List.of(dijkstraMetric, aStarMetric, bfsMetric, dfsMetric),
                methodology,
                jvmLimitations
        );
    }

    private BenchmarkRunResponse.AlgorithmMetric measureAlgorithm(
            ShortestPathAlgorithm algorithm,
            AdjacencyListGraph graph,
            UUID startId,
            UUID targetId,
            int iterations,
            String complexityOrder
    ) {
        List<Double> executionTimesMs = new ArrayList<>(iterations);
        List<Integer> visitedNodesList = new ArrayList<>(iterations);
        double pathDistance = 0.0;
        boolean found = false;

        for (int i = 0; i < iterations; i++) {
            AlgorithmResult result = algorithm.findPath(graph, startId, targetId);
            executionTimesMs.add(result.executionTimeMs());
            visitedNodesList.add(result.visitedNodeCount());
            pathDistance = result.totalDistanceKm();
            found = result.pathFound();
        }

        Collections.sort(executionTimesMs);
        Collections.sort(visitedNodesList);

        double medianTime = executionTimesMs.get(iterations / 2);
        double minTime = executionTimesMs.get(0);
        double maxTime = executionTimesMs.get(iterations - 1);
        int medianVisited = visitedNodesList.get(iterations / 2);

        return new BenchmarkRunResponse.AlgorithmMetric(
                algorithm.getName(),
                round(medianTime, 4),
                round(minTime, 4),
                round(maxTime, 4),
                medianVisited,
                round(pathDistance, 2),
                found,
                complexityOrder
        );
    }

    private double round(double value, int places) {
        double scale = Math.pow(10, places);
        return Math.round(value * scale) / scale;
    }

    private record SyntheticGraphContainer(AdjacencyListGraph graph, UUID startId, UUID targetId) {}

    private SyntheticGraphContainer generateSyntheticGraph(int nodeCount, long seed) {
        Random random = new Random(seed);
        AdjacencyListGraph graph = new AdjacencyListGraph();

        List<GraphNode> nodes = new ArrayList<>(nodeCount);

        // Center on Dublin area (lat ~53.34, lon ~-6.26) with a bounding box of ~0.25 degrees (~25km)
        double baseLat = 53.30;
        double baseLon = -6.35;

        for (int i = 0; i < nodeCount; i++) {
            UUID id = UUID.nameUUIDFromBytes(("node-" + seed + "-" + i).getBytes());
            double lat = baseLat + random.nextDouble() * 0.20;
            double lon = baseLon + random.nextDouble() * 0.20;
            GraphNode node = new GraphNode(id, "Synthetic Node #" + (i + 1), lat, lon, "Synthetic node in benchmark grid");
            graph.addNode(node);
            nodes.add(node);
        }

        // Connect each node to its 3 to 5 nearest neighbors geographically
        for (int i = 0; i < nodes.size(); i++) {
            GraphNode u = nodes.get(i);

            // Sort other nodes by geographic distance
            List<GraphNode> candidates = new ArrayList<>(nodes);
            candidates.sort(Comparator.comparingDouble(v ->
                    HaversineDistanceCalculator.calculateDistanceKm(u.latitude(), u.longitude(), v.latitude(), v.longitude())));

            int degree = 3 + random.nextInt(3); // 3 to 5 connections
            for (int k = 1; k <= degree && k < candidates.size(); k++) {
                GraphNode v = candidates.get(k);
                double haversine = HaversineDistanceCalculator.calculateDistanceKm(u.latitude(), u.longitude(), v.latitude(), v.longitude());
                // Road distance is 1.1x to 1.3x haversine distance to ensure strict admissibility for A*
                double roadDistance = Math.max(0.2, haversine * (1.1 + random.nextDouble() * 0.2));

                graph.addEdge(new GraphEdge(UUID.randomUUID(), u.id(), v.id(), roadDistance, roadDistance * 1.5));
                // Add reverse edge to create a rich strongly-connected network
                graph.addEdge(new GraphEdge(UUID.randomUUID(), v.id(), u.id(), roadDistance, roadDistance * 1.5));
            }
        }

        // Pick start at one corner and target at opposing corner to stress-test pathfinding
        UUID startId = nodes.get(0).id();
        UUID targetId = nodes.get(nodes.size() - 1).id();

        return new SyntheticGraphContainer(graph, startId, targetId);
    }
}
