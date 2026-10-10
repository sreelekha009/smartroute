package com.smartroute.algorithm;

import com.smartroute.exception.InvalidGraphException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("AdjacencyListGraph Unit Tests")
class AdjacencyListGraphTest {

    private AdjacencyListGraph graph;
    private GraphNode nodeA;
    private GraphNode nodeB;

    @BeforeEach
    void setUp() {
        graph = new AdjacencyListGraph();
        nodeA = new GraphNode(UUID.randomUUID(), "Point A", 53.3498, -6.2603, "Dublin City Centre");
        nodeB = new GraphNode(UUID.randomUUID(), "Point B", 53.3440, -6.2675, "St Stephen's Green");
    }

    @Test
    @DisplayName("Should add and retrieve valid nodes")
    void testAddAndRetrieveNodes() {
        graph.addNode(nodeA);
        graph.addNode(nodeB);

        assertEquals(2, graph.getNodeCount());
        assertTrue(graph.containsNode(nodeA.id()));
        assertTrue(graph.containsNode(nodeB.id()));
        assertEquals("Point A", graph.getNode(nodeA.id()).name());
    }

    @Test
    @DisplayName("Should reject invalid coordinates")
    void testInvalidCoordinates() {
        UUID id = UUID.randomUUID();
        assertThrows(IllegalArgumentException.class, () -> new GraphNode(id, "Invalid Lat", 95.0, 0.0, null));
        assertThrows(IllegalArgumentException.class, () -> new GraphNode(id, "Invalid Lon", 0.0, 185.0, null));
    }

    @Test
    @DisplayName("Should reject edge with non-existent source or target")
    void testEdgeWithNonExistentNodes() {
        graph.addNode(nodeA);
        UUID nonexistent = UUID.randomUUID();

        GraphEdge edgeInvalidSource = new GraphEdge(UUID.randomUUID(), nonexistent, nodeA.id(), 5.0, 10.0);
        assertThrows(InvalidGraphException.class, () -> graph.addEdge(edgeInvalidSource));

        GraphEdge edgeInvalidDest = new GraphEdge(UUID.randomUUID(), nodeA.id(), nonexistent, 5.0, 10.0);
        assertThrows(InvalidGraphException.class, () -> graph.addEdge(edgeInvalidDest));
    }

    @Test
    @DisplayName("Should reject negative and non-finite edge weights")
    void testRejectNegativeOrNonFiniteWeights() {
        assertThrows(IllegalArgumentException.class, () ->
                new GraphEdge(UUID.randomUUID(), nodeA.id(), nodeB.id(), -1.0, 5.0));
        assertThrows(IllegalArgumentException.class, () ->
                new GraphEdge(UUID.randomUUID(), nodeA.id(), nodeB.id(), Double.NaN, 5.0));
        assertThrows(IllegalArgumentException.class, () ->
                new GraphEdge(UUID.randomUUID(), nodeA.id(), nodeB.id(), Double.POSITIVE_INFINITY, 5.0));
    }

    @Test
    @DisplayName("Should allow zero-weight edges")
    void testAllowZeroWeightEdges() {
        graph.addNode(nodeA);
        graph.addNode(nodeB);

        GraphEdge zeroEdge = new GraphEdge(UUID.randomUUID(), nodeA.id(), nodeB.id(), 0.0, 0.0);
        assertDoesNotThrow(() -> graph.addEdge(zeroEdge));
        assertEquals(1, graph.getEdgeCount());
        assertEquals(0.0, graph.getOutgoingEdges(nodeA.id()).get(0).distanceKm());
    }

    @Test
    @DisplayName("Should keep edge with smaller distance on duplicate directed edges")
    void testDuplicateEdgeResolution() {
        graph.addNode(nodeA);
        graph.addNode(nodeB);

        GraphEdge edge1 = new GraphEdge(UUID.randomUUID(), nodeA.id(), nodeB.id(), 10.0, 15.0);
        GraphEdge edge2Longer = new GraphEdge(UUID.randomUUID(), nodeA.id(), nodeB.id(), 15.0, 20.0);
        GraphEdge edge3Shorter = new GraphEdge(UUID.randomUUID(), nodeA.id(), nodeB.id(), 7.5, 12.0);

        graph.addEdge(edge1);
        assertEquals(1, graph.getEdgeCount());
        assertEquals(10.0, graph.getOutgoingEdges(nodeA.id()).get(0).distanceKm());

        // Adding longer duplicate should not replace
        graph.addEdge(edge2Longer);
        assertEquals(1, graph.getEdgeCount());
        assertEquals(10.0, graph.getOutgoingEdges(nodeA.id()).get(0).distanceKm());

        // Adding shorter duplicate should update
        graph.addEdge(edge3Shorter);
        assertEquals(1, graph.getEdgeCount());
        assertEquals(7.5, graph.getOutgoingEdges(nodeA.id()).get(0).distanceKm());
    }
}
