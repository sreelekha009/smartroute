package com.smartroute.algorithm;

import com.smartroute.exception.UnreachableDestinationException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("NearestNeighborTspAlgorithm Unit Tests")
class NearestNeighborTspAlgorithmTest {

    private AdjacencyListGraph graph;
    private GraphNode depot;
    private GraphNode stop1;
    private GraphNode stop2;
    private GraphNode stop3;
    private GraphNode unreachableStop;
    private NearestNeighborTspAlgorithm tsp;

    @BeforeEach
    void setUp() {
        graph = new AdjacencyListGraph();
        tsp = new NearestNeighborTspAlgorithm();

        depot = new GraphNode(UUID.randomUUID(), "Central Depot", 53.3498, -6.2603, "Hub");
        stop1 = new GraphNode(UUID.randomUUID(), "Customer 1 (East)", 53.3480, -6.2400, "1.5km east");
        stop2 = new GraphNode(UUID.randomUUID(), "Customer 2 (Far East)", 53.3450, -6.2200, "3.0km east");
        stop3 = new GraphNode(UUID.randomUUID(), "Customer 3 (South)", 53.3350, -6.2600, "1.6km south");
        unreachableStop = new GraphNode(UUID.randomUUID(), "Island", 53.5000, -6.0000, "No road access");

        graph.addNode(depot);
        graph.addNode(stop1);
        graph.addNode(stop2);
        graph.addNode(stop3);
        graph.addNode(unreachableStop);

        // Bidirectional connections
        addBidirectionalRoad(depot.id(), stop1.id(), 2.0);
        addBidirectionalRoad(stop1.id(), stop2.id(), 2.5);
        addBidirectionalRoad(depot.id(), stop3.id(), 2.2);
        addBidirectionalRoad(stop3.id(), stop2.id(), 3.5);
    }

    private void addBidirectionalRoad(UUID u, UUID v, double dist) {
        graph.addEdge(new GraphEdge(UUID.randomUUID(), u, v, dist, dist * 2));
        graph.addEdge(new GraphEdge(UUID.randomUUID(), v, u, dist, dist * 2));
    }

    @Test
    @DisplayName("Should visit all stops greedily without return to depot")
    void testMultiStopWithoutReturn() {
        List<UUID> destinations = List.of(stop1.id(), stop2.id(), stop3.id());
        MultiStopResult result = tsp.planRoute(graph, depot.id(), destinations, false);

        assertNotNull(result);
        assertEquals(4, result.orderedStopIds().size()); // Depot -> S1 -> S2 -> S3 (or similar)
        assertEquals(depot.id(), result.orderedStopIds().get(0));
        assertEquals(3, result.legs().size());
        assertTrue(result.totalDistanceKm() > 0.0);
        assertFalse(result.returnedToDepot());
        assertEquals(result.orderedStopIds().get(result.orderedStopIds().size() - 1),
                result.fullPathNodeIds().get(result.fullPathNodeIds().size() - 1));
    }

    @Test
    @DisplayName("Should complete loop and return to depot when enabled")
    void testMultiStopWithReturnToDepot() {
        List<UUID> destinations = List.of(stop1.id(), stop2.id());
        MultiStopResult result = tsp.planRoute(graph, depot.id(), destinations, true);

        assertNotNull(result);
        assertTrue(result.returnedToDepot());
        assertEquals(4, result.orderedStopIds().size()); // Depot -> Stop1 -> Stop2 -> Depot
        assertEquals(depot.id(), result.orderedStopIds().get(0));
        assertEquals(depot.id(), result.orderedStopIds().get(result.orderedStopIds().size() - 1));
        assertEquals(3, result.legs().size());
        assertEquals(depot.id(), result.fullPathNodeIds().get(result.fullPathNodeIds().size() - 1));
    }

    @Test
    @DisplayName("Should throw UnreachableDestinationException if a destination is unreachable")
    void testUnreachableDestination() {
        List<UUID> destinations = List.of(stop1.id(), unreachableStop.id());
        assertThrows(UnreachableDestinationException.class, () ->
                tsp.planRoute(graph, depot.id(), destinations, false));
    }

    @Test
    @DisplayName("Should handle empty destination list by throwing IllegalArgumentException")
    void testEmptyDestinations() {
        assertThrows(IllegalArgumentException.class, () ->
                tsp.planRoute(graph, depot.id(), List.of(), false));
    }
}
