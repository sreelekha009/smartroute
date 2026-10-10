package com.smartroute.algorithm;

import java.util.UUID;

/**
 * Common contract for pathfinding algorithms on an adjacency-list weighted graph.
 */
public interface ShortestPathAlgorithm {

    /**
     * Finds a path from startNodeId to targetNodeId on the specified graph.
     *
     * @param graph The road network graph
     * @param startNodeId The origin location UUID
     * @param targetNodeId The destination location UUID
     * @return Execution result including ordered path, total distance, visited count, and runtime
     */
    AlgorithmResult findPath(AdjacencyListGraph graph, UUID startNodeId, UUID targetNodeId);

    /**
     * Returns the human-readable name of the algorithm.
     */
    String getName();
}
