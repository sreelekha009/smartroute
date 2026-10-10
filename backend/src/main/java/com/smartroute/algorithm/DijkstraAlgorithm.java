package com.smartroute.algorithm;

import com.smartroute.exception.InvalidGraphException;

import java.util.*;

/**
 * Dijkstra's Shortest Path Algorithm.
 *
 * Characteristics:
 * - Uses a min-priority queue (binary heap) to greedily expand the frontier.
 * - Guarantees optimal shortest paths on graphs with non-negative edge weights.
 * - Time Complexity: O((V + E) log V) with binary heap.
 * - Space Complexity: O(V) for distance table, predecessor map, and priority queue.
 * - Implements stale entry skipping (lazy deletion) for efficiency in standard Java PriorityQueue.
 */
public class DijkstraAlgorithm implements ShortestPathAlgorithm {

    @Override
    public String getName() {
        return "Dijkstra";
    }

    private record QueueEntry(UUID nodeId, double distance) implements Comparable<QueueEntry> {
        @Override
        public int compareTo(QueueEntry other) {
            return Double.compare(this.distance, other.distance);
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

        // Trivial case: origin equals destination
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

        Map<UUID, Double> distances = new HashMap<>();
        Map<UUID, UUID> predecessors = new HashMap<>();
        Set<UUID> visited = new HashSet<>();
        PriorityQueue<QueueEntry> pq = new PriorityQueue<>();

        distances.put(startNodeId, 0.0);
        pq.add(new QueueEntry(startNodeId, 0.0));

        boolean reachedTarget = false;

        while (!pq.isEmpty()) {
            QueueEntry current = pq.poll();
            UUID currentId = current.nodeId();
            double currentDist = current.distance();

            // Stale entry check: Skip if a shorter path to this node was already processed
            Double bestDist = distances.get(currentId);
            if (bestDist != null && currentDist > bestDist) {
                continue;
            }

            visited.add(currentId);

            // Early exit once the target node is extracted from the min-heap
            if (currentId.equals(targetNodeId)) {
                reachedTarget = true;
                break;
            }

            for (GraphEdge edge : graph.getOutgoingEdges(currentId)) {
                if (edge.distanceKm() < 0.0) {
                    throw new InvalidGraphException("Dijkstra does not support negative edge weights: " + edge.distanceKm());
                }

                UUID neighborId = edge.destinationId();
                double newDist = currentDist + edge.distanceKm();

                if (newDist < distances.getOrDefault(neighborId, Double.POSITIVE_INFINITY)) {
                    distances.put(neighborId, newDist);
                    predecessors.put(neighborId, currentId);
                    pq.add(new QueueEntry(neighborId, newDist));
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
        double totalDistance = distances.get(targetNodeId);

        return new AlgorithmResult(
                getName(),
                true,
                path,
                totalDistance,
                visited.size(),
                duration,
                "Optimal weighted shortest path calculated via Dijkstra's algorithm."
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
}
