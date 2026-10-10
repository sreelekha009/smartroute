package com.smartroute.algorithm;

import java.util.*;

/**
 * Depth-First Search (DFS) Traversal.
 *
 * Characteristics:
 * - Explores deep along each network branch before backtracking, implemented using an explicit LIFO stack.
 * - Primary Use: Reachability detection, topological analysis, and cycle checking.
 * - Important CS Distinction: DFS DOES NOT guarantee shortest paths (neither by distance nor by hops).
 *   The path returned is simply the first valid branch discovered by the traversal order.
 * - Time Complexity: O(V + E)
 * - Space Complexity: O(V)
 */
public class DfsAlgorithm implements ShortestPathAlgorithm {

    @Override
    public String getName() {
        return "DFS (Reachability)";
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
                    "Origin and destination are identical; 0 km."
            );
        }

        Deque<UUID> stack = new ArrayDeque<>();
        Map<UUID, UUID> predecessors = new HashMap<>();
        Set<UUID> visited = new HashSet<>();

        stack.push(startNodeId);
        visited.add(startNodeId);

        boolean reachedTarget = false;

        while (!stack.isEmpty()) {
            UUID currentId = stack.pop();

            if (currentId.equals(targetNodeId)) {
                reachedTarget = true;
                break;
            }

            for (GraphEdge edge : graph.getOutgoingEdges(currentId)) {
                UUID neighborId = edge.destinationId();
                if (!visited.contains(neighborId)) {
                    visited.add(neighborId);
                    predecessors.put(neighborId, currentId);
                    stack.push(neighborId);
                }
            }
        }

        long duration = System.nanoTime() - startTime;

        if (!reachedTarget) {
            return AlgorithmResult.unreachable(
                    getName(),
                    visited.size(),
                    duration,
                    "Target is unreachable from start location via DFS traversal."
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
                "Discovered path via DFS reachability traversal. Note: DFS does NOT guarantee a shortest path."
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
