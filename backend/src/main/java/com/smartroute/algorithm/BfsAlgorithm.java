package com.smartroute.algorithm;

import java.util.*;

/**
 * Breadth-First Search (BFS) Traversal.
 *
 * Characteristics:
 * - Explores the network level-by-level using a FIFO queue.
 * - Guarantees the path with the MINIMUM NUMBER OF HOPS (unweighted shortest path).
 * - Important CS Distinction: BFS does NOT optimize for weighted road distances.
 *   A path with fewer road segments (e.g., 2 long highways totaling 100km) will be chosen
 *   over a path with more segments (e.g., 3 local streets totaling 40km).
 * - Time Complexity: O(V + E)
 * - Space Complexity: O(V)
 */
public class BfsAlgorithm implements ShortestPathAlgorithm {

    @Override
    public String getName() {
        return "BFS (Hop-Based)";
    }

    @Override
    public AlgorithmResult findPath(AdjacencyListGraph graph, UUID startNodeId, UUID targetNodeId) {
        long startTime = System.nanoTime();

        if (graph == null) {
            throw new IllegalArgumentException("Graph cannot be null.");
        }
        if (!graph.containsNode(startNodeId)) {
            throw new IllegalArgumentException("Start node [" + startNodeId + "] not found in graph.");
        }
        if (!graph.containsNode(targetNodeId)) {
            throw new IllegalArgumentException("Target node [" + targetNodeId + "] not found in graph.");
        }

        if (startNodeId.equals(targetNodeId)) {
            long duration = System.nanoTime() - startTime;
            return new AlgorithmResult(
                    getName(),
                    true,
                    List.of(startNodeId),
                    0.0,
                    1,
                    duration,
                    "Origin and destination are identical; 0 hops."
            );
        }

        Queue<UUID> queue = new ArrayDeque<>();
        Map<UUID, UUID> predecessors = new HashMap<>();
        Set<UUID> visited = new HashSet<>();

        queue.add(startNodeId);
        visited.add(startNodeId);

        boolean reachedTarget = false;

        while (!queue.isEmpty()) {
            UUID currentId = queue.poll();

            if (currentId.equals(targetNodeId)) {
                reachedTarget = true;
                break;
            }

            for (GraphEdge edge : graph.getOutgoingEdges(currentId)) {
                UUID neighborId = edge.destinationId();
                if (!visited.contains(neighborId)) {
                    visited.add(neighborId);
                    predecessors.put(neighborId, currentId);
                    queue.add(neighborId);
                }
            }
        }

        long duration = System.nanoTime() - startTime;

        if (!reachedTarget) {
            return AlgorithmResult.unreachable(
                    getName(),
                    visited.size(),
                    duration,
                    "Target is unreachable from start location via BFS traversal."
            );
        }

        List<UUID> path = reconstructPath(predecessors, startNodeId, targetNodeId);
        double totalDistance = computePathDistance(graph, path);

        return new AlgorithmResult(
                getName(),
                true,
                path,
                totalDistance,
                visited.size(),
                duration,
                "Minimum-hop path discovered via BFS. Note: BFS minimizes segment count (hops), not weighted road distance."
        );
    }

    private List<UUID> reconstructPath(Map<UUID, UUID> predecessors, UUID start, UUID target) {
        LinkedList<UUID> path = new LinkedList<>();
        UUID curr = target;
        while (curr != null) {
            path.addFirst(curr);
            if (curr.equals(start)) {
                break;
            }
            curr = predecessors.get(curr);
        }
        return path;
    }

    private double computePathDistance(AdjacencyListGraph graph, List<UUID> path) {
        double dist = 0.0;
        for (int i = 0; i < path.size() - 1; i++) {
            UUID u = path.get(i);
            UUID v = path.get(i + 1);
            double bestEdge = Double.POSITIVE_INFINITY;
            for (GraphEdge edge : graph.getOutgoingEdges(u)) {
                if (edge.destinationId().equals(v)) {
                    bestEdge = Math.min(bestEdge, edge.distanceKm());
                }
            }
            if (bestEdge < Double.POSITIVE_INFINITY) {
                dist += bestEdge;
            }
        }
        return dist;
    }
}
