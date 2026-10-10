package com.smartroute.algorithm;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("Shortest Path Algorithms Unit Tests")
class ShortestPathAlgorithmTest {

    private AdjacencyListGraph graph;
    private GraphNode nodeA;
    private GraphNode nodeB;
    private GraphNode nodeC;
    private GraphNode nodeD;
    private GraphNode nodeE;
    private GraphNode disconnectedNode;

    private DijkstraAlgorithm dijkstra;
    private AStarAlgorithm aStar;
    private BfsAlgorithm bfs;
    private DfsAlgorithm dfs;

    @BeforeEach
    void setUp() {
        graph = new AdjacencyListGraph();
        dijkstra = new DijkstraAlgorithm();
        aStar = new AStarAlgorithm();
        bfs = new BfsAlgorithm();
        dfs = new DfsAlgorithm();

        // Realistic coordinates in Dublin area where road distance >= haversine distance
        nodeA = new GraphNode(UUID.randomUUID(), "O'Connell St", 53.3498, -6.2603, "Start");
        nodeB = new GraphNode(UUID.randomUUID(), "Trinity College", 53.3438, -6.2546, "Via 1");
        nodeC = new GraphNode(UUID.randomUUID(), "Grand Canal Dock", 53.3421, -6.2378, "Via 2");
        nodeD = new GraphNode(UUID.randomUUID(), "Ballsbridge", 53.3283, -6.2304, "Destination");
        nodeE = new GraphNode(UUID.randomUUID(), "Direct Highway Bypass", 53.3390, -6.2450, "Bypass");
        disconnectedNode = new GraphNode(UUID.randomUUID(), "Isolated Island", 53.3800, -6.1000, "Unreachable");

        graph.addNode(nodeA);
        graph.addNode(nodeB);
        graph.addNode(nodeC);
        graph.addNode(nodeD);
        graph.addNode(nodeE);
        graph.addNode(disconnectedNode);

        // Path 1 (3 hops, total distance 1.2 + 1.5 + 2.0 = 4.7 km)
        // Ensure distance is >= haversine distance between endpoints
        double haversineAB = HaversineDistanceCalculator.calculateDistanceKm(nodeA.latitude(), nodeA.longitude(), nodeB.latitude(), nodeB.longitude());
        double haversineBC = HaversineDistanceCalculator.calculateDistanceKm(nodeB.latitude(), nodeB.longitude(), nodeC.latitude(), nodeC.longitude());
        double haversineCD = HaversineDistanceCalculator.calculateDistanceKm(nodeC.latitude(), nodeC.longitude(), nodeD.latitude(), nodeD.longitude());

        graph.addEdge(new GraphEdge(UUID.randomUUID(), nodeA.id(), nodeB.id(), Math.max(1.5, haversineAB * 1.2), 5.0));
        graph.addEdge(new GraphEdge(UUID.randomUUID(), nodeB.id(), nodeC.id(), Math.max(1.8, haversineBC * 1.2), 6.0));
        graph.addEdge(new GraphEdge(UUID.randomUUID(), nodeC.id(), nodeD.id(), Math.max(2.2, haversineCD * 1.2), 7.0));

        // Path 2 (2 hops, but heavier distance: 5.0 + 5.0 = 10.0 km)
        // Demonstrates BFS choosing 2 hops over 3 hops despite higher distance!
        graph.addEdge(new GraphEdge(UUID.randomUUID(), nodeA.id(), nodeE.id(), 5.0, 12.0));
        graph.addEdge(new GraphEdge(UUID.randomUUID(), nodeE.id(), nodeD.id(), 5.0, 12.0));
    }

    @Test
    @DisplayName("Dijkstra should find optimal weighted path")
    void testDijkstraFindsPath() {
        AlgorithmResult result = dijkstra.findPath(graph, nodeA.id(), nodeD.id());

        assertTrue(result.pathFound());
        assertEquals(4, result.pathNodeIds().size());
        assertEquals(nodeA.id(), result.pathNodeIds().get(0));
        assertEquals(nodeB.id(), result.pathNodeIds().get(1));
        assertEquals(nodeC.id(), result.pathNodeIds().get(2));
        assertEquals(nodeD.id(), result.pathNodeIds().get(3));
        assertTrue(result.totalDistanceKm() < 10.0, "Dijkstra should pick the 4.7-5.5km route, not the 10km route");
        assertTrue(result.visitedNodeCount() >= 4);
        assertTrue(result.executionTimeNanos() > 0);
    }

    @Test
    @DisplayName("Dijkstra and A* should find identical optimal distance")
    void testDijkstraAndAStarAgreement() {
        AlgorithmResult dijkstraResult = dijkstra.findPath(graph, nodeA.id(), nodeD.id());
        AlgorithmResult aStarResult = aStar.findPath(graph, nodeA.id(), nodeD.id());

        assertTrue(dijkstraResult.pathFound());
        assertTrue(aStarResult.pathFound());
        assertEquals(dijkstraResult.totalDistanceKm(), aStarResult.totalDistanceKm(), 0.0001,
                "A* and Dijkstra must agree on the optimal shortest path cost");
        assertEquals(dijkstraResult.pathNodeIds(), aStarResult.pathNodeIds());
    }

    @Test
    @DisplayName("BFS should find minimum hop path even if weighted distance is larger")
    void testBfsMinimumHops() {
        AlgorithmResult bfsResult = bfs.findPath(graph, nodeA.id(), nodeD.id());

        assertTrue(bfsResult.pathFound());
        // Path through E is 2 hops (3 nodes: A -> E -> D), whereas optimal weighted path is 3 hops (4 nodes)
        assertEquals(3, bfsResult.pathNodeIds().size(), "BFS should prefer 2 hops over 3 hops");
        assertEquals(nodeA.id(), bfsResult.pathNodeIds().get(0));
        assertEquals(nodeE.id(), bfsResult.pathNodeIds().get(1));
        assertEquals(nodeD.id(), bfsResult.pathNodeIds().get(2));
        assertEquals(10.0, bfsResult.totalDistanceKm(), 0.001);
    }

    @Test
    @DisplayName("DFS should discover valid reachable path")
    void testDfsReachability() {
        AlgorithmResult dfsResult = dfs.findPath(graph, nodeA.id(), nodeD.id());

        assertTrue(dfsResult.pathFound());
        assertEquals(nodeA.id(), dfsResult.pathNodeIds().get(0));
        assertEquals(nodeD.id(), dfsResult.pathNodeIds().get(dfsResult.pathNodeIds().size() - 1));
        assertTrue(dfsResult.totalDistanceKm() > 0.0);
    }

    @Test
    @DisplayName("Should return unreachable when destination is disconnected")
    void testDisconnectedGraph() {
        AlgorithmResult dijkstraRes = dijkstra.findPath(graph, nodeA.id(), disconnectedNode.id());
        assertFalse(dijkstraRes.pathFound());
        assertTrue(dijkstraRes.pathNodeIds().isEmpty());

        AlgorithmResult aStarRes = aStar.findPath(graph, nodeA.id(), disconnectedNode.id());
        assertFalse(aStarRes.pathFound());
        assertTrue(aStarRes.pathNodeIds().isEmpty());

        AlgorithmResult bfsRes = bfs.findPath(graph, nodeA.id(), disconnectedNode.id());
        assertFalse(bfsRes.pathFound());

        AlgorithmResult dfsRes = dfs.findPath(graph, nodeA.id(), disconnectedNode.id());
        assertFalse(dfsRes.pathFound());
    }

    @Test
    @DisplayName("Should handle identical start and end node")
    void testIdenticalStartAndTarget() {
        AlgorithmResult result = dijkstra.findPath(graph, nodeA.id(), nodeA.id());
        assertTrue(result.pathFound());
        assertEquals(1, result.pathNodeIds().size());
        assertEquals(nodeA.id(), result.pathNodeIds().get(0));
        assertEquals(0.0, result.totalDistanceKm());
    }

    @Test
    @DisplayName("Should handle cycles and zero-weight edges without infinite loops")
    void testCyclesAndZeroWeights() {
        // Create cycle B -> A and zero-weight edge B -> C
        graph.addEdge(new GraphEdge(UUID.randomUUID(), nodeB.id(), nodeA.id(), 1.0, 2.0));
        graph.addEdge(new GraphEdge(UUID.randomUUID(), nodeB.id(), nodeC.id(), 0.0, 0.0)); // updates BC to 0.0!

        AlgorithmResult result = dijkstra.findPath(graph, nodeA.id(), nodeD.id());
        assertTrue(result.pathFound());
        assertTrue(result.totalDistanceKm() >= 0.0);
    }
}
