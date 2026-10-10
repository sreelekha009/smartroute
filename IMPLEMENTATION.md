# SmartRoute — Implementation Progress Tracker

This document tracks the phased development of the **SmartRoute Intelligent Route Planning & Delivery Optimisation System**, designed as a production-grade portfolio application showcasing CS fundamentals, Java OOP, DSA, clean architecture, and modern full-stack development.

---

## Progress Checklist

### Phase 1: Environment Inspection & Scaffolding
- [x] Inspect environment (Java 21, Node v26, npm 11, Docker status)
- [x] Create root `.gitignore` and `IMPLEMENTATION.md`
- [ ] Set up Maven wrapper and `backend/pom.xml` with Spring Boot 3.3.4
- [ ] Scaffold `frontend/` with Vite, React 18/19, TypeScript, Tailwind CSS, Lucide, Recharts, @xyflow/react, Axios
- [ ] Configure `docker-compose.yml` and `.env.example`

### Phase 2: Core Graph Model & Pure Java Algorithms
- [ ] Implement pure Java graph representation (`AdjacencyListGraph`, `GraphNode`, `GraphEdge`)
- [ ] Implement `HaversineDistanceCalculator`
- [ ] Implement `DijkstraAlgorithm` (PriorityQueue, O((V+E) log V), stale entry skipping, path reconstruction)
- [ ] Implement `AStarAlgorithm` (PriorityQueue, admissible Haversine heuristic, gScore/fScore)
- [ ] Implement `BfsAlgorithm` (Queue-based unweighted traversal)
- [ ] Implement `DfsAlgorithm` (Stack-based reachability)
- [ ] Implement `NearestNeighborTspAlgorithm` (Depot, multi-stop greedy sequencing, return-to-depot)
- [ ] Write and run comprehensive JUnit 5 tests covering all algorithm edge cases (negative weights, disconnected, zero weights, duplicate edges, cycle, agreement between Dijkstra & A*)

### Phase 3: Domain, Persistence, REST APIs & Migrations
- [ ] JPA Entities: `LocationEntity`, `RoadEntity`, `RouteHistoryEntity`
- [ ] Repositories with custom queries
- [ ] Flyway SQL migrations (`V1__schema.sql`, `V2__seed_dublin_data.sql`)
- [ ] Dual database profiles: `application-local.yml` (H2 fallback) and `application-postgres.yml` (PostgreSQL)
- [ ] DTOs with validation annotations
- [ ] Services: `LocationService`, `RoadService`, `RouteService`, `DashboardService`, `BenchmarkService`
- [ ] REST Controllers:
  - `GET /api/health`
  - `GET /api/dashboard`
  - `GET/POST/PUT/DELETE /api/locations`
  - `GET/POST/PUT/DELETE /api/roads`
  - `POST /api/routes/shortest`
  - `POST /api/routes/multi-stop`
  - `GET /api/routes/history` and `{id}`
  - `POST /api/benchmarks/run`
- [ ] Springdoc OpenAPI / Swagger documentation configuration
- [ ] Global Exception Handler with structured API error responses
- [ ] Run backend tests and verify build

### Phase 4: Frontend Architecture & Design Foundation
- [ ] Configure Tailwind CSS design system with custom slate/navy, blue, teal accents
- [ ] Create layout: Dark navy sidebar, top navigation, notification toasts, responsive drawer
- [ ] Build shared UI components: MetricCard, Badge, Button, Modal, Table, SkeletonLoader, EmptyState
- [ ] Configure typed Axios API client with error handling
- [ ] Set up React Router with 8 application routes

### Phase 5: Frontend Feature Pages & Graph Visualization
- [ ] Page 1: Overview Dashboard (Live statistics, quick actions, mini graph preview, recent routes)
- [ ] Page 2: Interactive Route Planner (Start/destination selector, algorithm picker, path details, @xyflow/react graph canvas with highlighted path)
- [ ] Page 3: Multi-Stop Delivery Planner (Depot selection, multi-stop chips, return-to-depot toggle, leg breakdown, visual graph)
- [ ] Page 4: Algorithm Comparison (Side-by-side Dijkstra vs A*, Recharts comparative charts, complexity analysis)
- [ ] Page 5: Location Management (CRUD table, search, modal form with coordinate bounds, deletion constraints)
- [ ] Page 6: Road Management (CRUD table, bidirectional toggle, source/target select, distance validation)
- [ ] Page 7: Route History (Table of calculations, algorithm badges, distance, timestamp, inspect details modal)
- [ ] Page 8: About & Algorithms Explained (Educational guide to Dijkstra, A*, BFS, DFS, TSP heuristic, Big-O table)

### Phase 6: Synthetic Benchmarking Suite
- [ ] Backend synthetic graph generator (100, 500, 1000 nodes, deterministic seeds)
- [ ] JVM warmup, median calculation, visited node counts, memory tracking
- [ ] Benchmark REST endpoint with non-blocking execution
- [ ] Frontend benchmark runner with interactive Recharts visualization and JVM caveats

### Phase 7: Automated Tests, CI & Documentation
- [ ] Frontend unit & integration tests with Vitest + React Testing Library
- [ ] GitHub Actions workflow (`.github/workflows/ci.yml`) for backend & frontend
- [ ] Comprehensive `README.md` with architecture diagram, local setup, Docker/H2 instructions
- [ ] In-depth `ARCHITECTURE.md` explaining engineering decisions in beginner-friendly language

### Phase 8: Verification & Run Demo
- [ ] Execute Maven tests (`./mvnw test`) and frontend tests (`npm run test`)
- [ ] Verify frontend build (`npm run build`)
- [ ] Launch backend and frontend, test all 8 pages against live APIs
- [ ] Verify edge cases (disconnected nodes, invalid inputs, duplicate edges)
- [ ] Prepare clean git repository ready for GitHub
