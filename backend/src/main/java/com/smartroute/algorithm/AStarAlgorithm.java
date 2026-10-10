package com.smartroute.algorithm;

import com.smartroute.exception.InvalidGraphException;

import java.util.*;

/**
 * A* Search Shortest Path Algorithm.
 *
 * Characteristics:
 * - Uses a heuristic function h(n) combined with exact path cost g(n) to evaluate f(n) = g(n) + h(n).
 * - Heuristic: Haversine great-circle distance to target node.
 * - Admissibility: Because great-circle distance is the geometric lower bound of any physical path
 *   on the Earth's surface, h(n) <= h*(n). When all road distances >= haversine distance,
 *   A* is guaranteed to return an optimal shortest path while expanding fewer nodes than Dijkstra.
 * - Fallback: If heuristic evaluates to non-positive or coordinates are uncalibrated,
 *   the algorithm gracefully clamps to 0.0, safely devolving to Dijkstra's guarantee.
 */
public class AStarAlgorithm implements ShortestPathAlgorithm {

    @Override
    public String getName() {
        return "A* Search";
    }

    private record AStarEntry(UUID nodeId, double fScore, double gScore) implements Comparable<AStarEntry> {
        @Override
        public int compareTo(AStarEntry other) {
            return Double.compare(this.fScore, other.fScore);
        }
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
                    "Origin and destination are identical; distance is 0 km."
            );
        }

        GraphNode targetNode = graph.getNode(targetNodeId);

        Map<UUID, Double> gScore = new HashMap<>();
        Map<UUID, UUID> predecessors = new HashMap<>();
        Set<UUID> visited = new HashSet<>();
        PriorityQueue<AStarEntry> openSet = new PriorityQueue<>();

        gScore.put(startNodeId, 0.0);
        double initialH = calculateHeuristic(graph.getNode(startNodeId), targetNode);
        openSet.add(new AStarEntry(startNodeId, initialH, 0.0));

        boolean reachedTarget = false;

        while (!openSet.isEmpty()) {
            AStarEntry current = openSet.poll();
            UUID currentId = current.nodeId();
            double currentG = current.gScore();

            // Stale entry skipping: skip if a cheaper path to current node was already discovered
            Double bestG = gScore.get(currentId);
            if (bestG != null && currentG > bestG) {
                continue;
            }

            visited.add(currentId);

            if (currentId.equals(targetNodeId)) {
                reachedTarget = true;
                break;
            }

            for (GraphEdge edge : graph.getOutgoingEdges(currentId)) {
                if (edge.distanceKm() < 0.0) {
                    throw new InvalidGraphException("A* does not support negative edge weights: " + edge.distanceKm());
                }

                UUID neighborId = edge.destinationId();
                double tentativeG = currentG + edge.distanceKm();

                if (tentativeG < gScore.getOrDefault(neighborId, Double.POSITIVE_INFINITY)) {
                    gScore.put(neighborId, tentativeG);
                    predecessors.put(neighborId, currentId);

                    double h = calculateHeuristic(graph.getNode(neighborId), targetNode);
                    double f = tentativeG + h;
                    openSet.add(new AStarEntry(neighborId, f, tentativeG));
                }
            }
        }

        long duration = System.nanoTime() - startTime;

        if (!reachedTarget) {
            return AlgorithmResult.unreachable(
                    getName(),
                    visited.size(),
                    duration,
                    "Target is unreachable from start location in the directed network."
            );
        }

        List<UUID> path = reconstructPath(predecessors, startNodeId, targetNodeId);
        double totalDistance = gScore.get(targetNodeId);

        return new AlgorithmResult(
                getName(),
                true,
                path,
                totalDistance,
                visited.size(),
                duration,
                "Optimal weighted shortest path calculated via A* search with Haversine heuristic."
        );
    }

    private double calculateHeuristic(GraphNode current, GraphNode target) {
        if (current == null || target == null) {
            return 0.0;
        }
        double h = HaversineDistanceCalculator.calculateDistanceKm(
                current.latitude(),
                current.longitude(),
                target.latitude(),
                target.longitude()
        );
        return Math.max(0.0, h);
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
}
