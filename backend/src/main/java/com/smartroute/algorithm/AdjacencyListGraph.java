package com.smartroute.algorithm;

import com.smartroute.exception.InvalidGraphException;

import java.util.*;

/**
 * In-memory adjacency-list weighted graph representation.
 * Supports directed edges, zero-weight connections, and enforces strict data integrity.
 */
public class AdjacencyListGraph {

    private final Map<UUID, GraphNode> nodes = new LinkedHashMap<>();
    private final Map<UUID, List<GraphEdge>> adjacencyList = new HashMap<>();

    public synchronized void addNode(GraphNode node) {
        Objects.requireNonNull(node, "Node cannot be null");
        nodes.put(node.id(), node);
        adjacencyList.putIfAbsent(node.id(), new ArrayList<>());
    }

    public synchronized void addEdge(GraphEdge edge) {
        Objects.requireNonNull(edge, "Edge cannot be null");

        if (!nodes.containsKey(edge.sourceId())) {
            throw new InvalidGraphException("Source location [" + edge.sourceId() + "] does not exist in graph.");
        }
        if (!nodes.containsKey(edge.destinationId())) {
            throw new InvalidGraphException("Destination location [" + edge.destinationId() + "] does not exist in graph.");
        }

        List<GraphEdge> outgoing = adjacencyList.get(edge.sourceId());

        // Handle duplicate directed edges: retain the edge with the lower distance
        for (int i = 0; i < outgoing.size(); i++) {
            GraphEdge existing = outgoing.get(i);
            if (existing.destinationId().equals(edge.destinationId())) {
                if (edge.distanceKm() < existing.distanceKm()) {
                    outgoing.set(i, edge);
                }
                return;
            }
        }

        outgoing.add(edge);
    }

    public synchronized boolean containsNode(UUID nodeId) {
        return nodes.containsKey(nodeId);
    }

    public synchronized GraphNode getNode(UUID nodeId) {
        return nodes.get(nodeId);
    }

    public synchronized Collection<GraphNode> getAllNodes() {
        return Collections.unmodifiableCollection(nodes.values());
    }

    public synchronized List<GraphEdge> getOutgoingEdges(UUID nodeId) {
        List<GraphEdge> edges = adjacencyList.get(nodeId);
        if (edges == null) {
            return Collections.emptyList();
        }
        return Collections.unmodifiableList(edges);
    }

    public synchronized int getNodeCount() {
        return nodes.size();
    }

    public synchronized int getEdgeCount() {
        return adjacencyList.values().stream().mapToInt(List::size).sum();
    }

    public synchronized void clear() {
        nodes.clear();
        adjacencyList.clear();
    }
}
