package com.smartroute.algorithm;

import com.smartroute.exception.UnreachableDestinationException;

import java.util.*;

/**
 * Multi-Stop Delivery Optimization using the Nearest Neighbor Heuristic.
 *
 * Characteristics:
 * - Solves the Travelling Salesperson Problem (TSP) / Vehicle Routing Problem (VRP) leg-by-leg.
 * - Because TSP is NP-Hard (O(N!) brute force), exact optimization is computationally intractable for
 *   interactive systems with large stop counts.
 * - Nearest Neighbor is an O(K * Dijkstra) greedy polynomial-time approximation heuristic:
 *   Starting from the depot, it selects the closest unvisited stop by true network shortest path,
 *   repeats until all stops are visited, and optionally routes back to the depot.
 * - Concatenates exact underlying road segments for each leg.
 * - Detects unreachable stops and reports explicit routing errors.
 */
public class NearestNeighborTspAlgorithm {

    private final DijkstraAlgorithm dijkstra = new DijkstraAlgorithm();

    public MultiStopResult planRoute(
            AdjacencyListGraph graph,
            UUID depotId,
            List<UUID> destinationIds,
            boolean returnToDepot
    ) {
        long startTime = System.nanoTime();

        if (graph == null) {
            throw new IllegalArgumentException("Graph cannot be null.");
        }
        if (depotId == null || !graph.containsNode(depotId)) {
            throw new IllegalArgumentException("Depot location [" + depotId + "] not found in graph.");
        }
        if (destinationIds == null || destinationIds.isEmpty()) {
            throw new IllegalArgumentException("At least one delivery destination must be specified.");
        }

        // Deduplicate and filter out depot from destination stops
        Set<UUID> remainingUnvisited = new LinkedHashSet<>();
        for (UUID dest : destinationIds) {
            if (dest == null || !graph.containsNode(dest)) {
                throw new IllegalArgumentException("Destination location [" + dest + "] not found in graph.");
            }
            if (!dest.equals(depotId)) {
                remainingUnvisited.add(dest);
            }
        }

        if (remainingUnvisited.isEmpty()) {
            long duration = System.nanoTime() - startTime;
            return new MultiStopResult(
                    depotId,
                    List.of(depotId),
                    List.of(depotId),
                    0.0,
                    Collections.emptyList(),
                    1,
                    duration,
                    returnToDepot,
                    "No additional delivery stops requested beyond the depot."
            );
        }

        List<UUID> orderedStops = new ArrayList<>();
        orderedStops.add(depotId);

        List<MultiStopResult.LegResult> legs = new ArrayList<>();
        List<UUID> fullPath = new ArrayList<>();
        fullPath.add(depotId);

        double totalDistance = 0.0;
        int totalVisitedNodes = 0;
        UUID currentStop = depotId;
        int legIndex = 1;

        while (!remainingUnvisited.isEmpty()) {
            UUID nearestTarget = null;
            double shortestDistance = Double.POSITIVE_INFINITY;
            AlgorithmResult bestResult = null;

            for (UUID candidate : remainingUnvisited) {
                AlgorithmResult result = dijkstra.findPath(graph, currentStop, candidate);
                totalVisitedNodes += result.visitedNodeCount();

                if (result.pathFound() && result.totalDistanceKm() < shortestDistance) {
                    shortestDistance = result.totalDistanceKm();
                    nearestTarget = candidate;
                    bestResult = result;
                }
            }

            if (nearestTarget == null || bestResult == null) {
                // One or more stops cannot be reached from current location
                UUID unreachableStop = remainingUnvisited.iterator().next();
                throw new UnreachableDestinationException(
                        "Cannot reach destination [" + unreachableStop + "] from current position [" + currentStop + "]."
                );
            }

            // Append leg result
            legs.add(new MultiStopResult.LegResult(
                    legIndex++,
                    currentStop,
                    nearestTarget,
                    bestResult.totalDistanceKm(),
                    bestResult.pathNodeIds()
            ));

            totalDistance += bestResult.totalDistanceKm();
            orderedStops.add(nearestTarget);

            // Append path nodes, skipping the first node as it matches the last of previous leg
            List<UUID> legNodes = bestResult.pathNodeIds();
            for (int i = 1; i < legNodes.size(); i++) {
                fullPath.add(legNodes.get(i));
            }

            remainingUnvisited.remove(nearestTarget);
            currentStop = nearestTarget;
        }

        // Return to depot if requested
        if (returnToDepot) {
            AlgorithmResult returnResult = dijkstra.findPath(graph, currentStop, depotId);
            totalVisitedNodes += returnResult.visitedNodeCount();

            if (!returnResult.pathFound()) {
                throw new UnreachableDestinationException(
                        "Cannot return to depot [" + depotId + "] from final stop [" + currentStop + "]."
                );
            }

            legs.add(new MultiStopResult.LegResult(
                    legIndex,
                    currentStop,
                    depotId,
                    returnResult.totalDistanceKm(),
                    returnResult.pathNodeIds()
            ));

            totalDistance += returnResult.totalDistanceKm();
            orderedStops.add(depotId);

            List<UUID> legNodes = returnResult.pathNodeIds();
            for (int i = 1; i < legNodes.size(); i++) {
                fullPath.add(legNodes.get(i));
            }
        }

        long duration = System.nanoTime() - startTime;

        return new MultiStopResult(
                depotId,
                orderedStops,
                fullPath,
                totalDistance,
                legs,
                totalVisitedNodes,
                duration,
                returnToDepot,
                "Multi-stop route sequenced using Nearest Neighbor heuristic and Dijkstra path segments. (Note: Heuristic TSP does not guarantee global optimality)."
        );
    }
}
