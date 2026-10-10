# SmartRoute — Intelligent Route Planning & Delivery Optimization

A full-stack route-planning application that visualizes road networks, calculates shortest paths, and compares graph-search algorithms through an interactive dashboard.

**Tech Stack:** Java 21 · Spring Boot 3.3 · React · TypeScript · Vite · Tailwind CSS · Spring Data JPA · H2 · PostgreSQL · Flyway · Maven · Vitest · JUnit

## Features

- **Interactive Route Planner:** Select an origin and destination and calculate routes using graph-search algorithms.
- **Graph Algorithms:** Explore Dijkstra, A*, BFS, and DFS, including their different traversal strategies.
- **Multi-Stop Route Planning:** Generate a heuristic delivery route across multiple destinations using nearest-neighbor optimization.
- **Algorithm Comparison:** Compare route distance, explored nodes, and execution time.
- **Network Visualization:** Inspect a synthetic Dublin road network using React Flow.
- **Location and Road Management:** Manage graph nodes and weighted connections.
- **Route History:** Review previously calculated routes.
- **REST API:** Spring Boot endpoints for locations, roads, route calculation, and benchmarking.

## Screenshots

Add screenshots to `docs/screenshots/` and update the image links below.

### Dashboard
![SmartRoute Dashboard](docs/screenshots/dashboard.png)

### Interactive Route Planner
![Route Planner](docs/screenshots/route-planner.png)

### Multi-Stop Planner
![Multi-Stop Planner](docs/screenshots/multi-stop-planner.png)

### Algorithm Comparison
![Algorithm Comparison](docs/screenshots/algorithm-comparison.png)

## Architecture

```text
React + TypeScript + Vite
       |
       | HTTP / REST
       v
Spring Boot Controllers
       |
       v
Services + Graph Algorithms
       |
       v
Spring Data JPA
       |
       v
H2 (local) / PostgreSQL (configured environment)
```

The frontend provides interactive visualizations and controls. The backend models the road network as a weighted graph, processes route requests, and persists application data.

## Algorithms

| Algorithm | Purpose | Key characteristic |
| --- | --- | --- |
| Dijkstra | Shortest path | Finds a minimum-weight path with nonnegative edge weights |
| A* | Heuristic shortest path | Uses a heuristic to guide exploration; optimal with suitable conditions |
| BFS | Unweighted traversal | Finds a path with the fewest edges in an unweighted graph |
| DFS | Graph traversal | Explores depth-first; does not guarantee the shortest path |
| Nearest Neighbor | Multi-stop planning | Greedy heuristic; not guaranteed to find the optimal tour |

## Local Development

### Requirements

- Java 21
- Node.js and npm
- Git
- PostgreSQL and Docker are optional for local development using the H2 profile.

### Backend

```bash
git clone https://github.com/sreelekha009/smartroute.git
cd smartroute/backend
chmod +x mvnw
./mvnw spring-boot:run -Dspring-boot.run.profiles=local
```

Backend: http://localhost:8080

### Frontend

In a separate terminal:

```bash
cd smartroute/frontend
npm install
npm run dev
```

Frontend: http://localhost:5173

## Testing

### Backend

```bash
cd backend
./mvnw test
```

**Verified:** 31 tests passed, 0 failures, 0 errors.

Tests cover graph data structures, shortest-path algorithms, nearest-neighbor optimization, REST controllers, and route-service integration.

### Frontend

```bash
cd frontend
npm run test -- --run
npm run build
```

**Verified:** 4 frontend tests passed in the last reported test run, and the production build completed successfully after TypeScript fixes.

## Project Highlights

- Implemented graph-based route planning with multiple search strategies.
- Built a Java/Spring Boot REST backend and React/TypeScript frontend.
- Added interactive network visualization, route diagnostics, and algorithm comparison.
- Created unit, controller, and integration tests for core functionality.
- Used Flyway migrations and synthetic Dublin location data for local development.

## Limitations and Future Improvements

- The sample Dublin network is synthetic and is not a live navigation service.
- Nearest-neighbor multi-stop planning is heuristic rather than globally optimal.
- Add production deployment, CI/CD, expanded frontend test coverage, and code splitting.
- Evaluate algorithms on larger reproducible graph datasets.

## Author

GitHub: [sreelekha009](https://github.com/sreelekha009)

## License

No license has been declared yet.
