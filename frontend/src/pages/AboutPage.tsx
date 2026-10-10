import React from 'react';
import { Card, CardContent, CardHeader } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import {
  BookOpen,
  Route,
  Compass,
  GitFork,
  Cpu,
  Layers,
  ShieldCheck,
  Zap,
} from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="space-y-8 animate-in fade-in duration-150">
      {/* Hero Overview */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-navy-950 via-navy-900 to-navy-850 text-white border border-navy-800 shadow-xl shadow-navy-950/10">
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-semibold uppercase tracking-wider">
            <Zap className="w-3.5 h-3.5" />
            <span>Computer Science Portfolio Project</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            SmartRoute — Intelligent Route Planning & Delivery Optimisation System
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            SmartRoute was built to showcase rigorous computer science fundamentals, Java object-oriented design,
            pure algorithmic implementation from scratch, real-time telemetry, and modern full-stack software architecture
            for Microsoft Software Engineering internship evaluations.
          </p>
        </div>
      </div>

      {/* Algorithms Deep Dive Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Dijkstra */}
        <Card className="hover:border-blue-200 transition-all">
          <CardHeader
            title={
              <div className="flex items-center gap-2 text-slate-900">
                <Route className="w-5 h-5 text-brand-600" />
                <span>1. Dijkstra's Shortest Path Algorithm</span>
              </div>
            }
            action={<Badge variant="blue">O((V + E) log V)</Badge>}
          />
          <CardContent className="p-5 text-xs text-slate-600 space-y-3 leading-relaxed">
            <p>
              Dijkstra’s algorithm is a greedy graph search algorithm that finds the single-source shortest path
              on weighted graphs with non-negative edge weights.
            </p>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1">
              <p className="font-semibold text-slate-800">Implementation Details:</p>
              <ul className="list-disc pl-4 space-y-1">
                <li>Binary min-heap (<code className="text-brand-600">PriorityQueue</code>) for frontier expansion.</li>
                <li><code className="text-brand-600">HashMap&lt;UUID, Double&gt;</code> storing confirmed shortest distances.</li>
                <li><strong>Stale entry skipping</strong>: Discards out-of-date heap entries without expensive linear heap updates.</li>
                <li>Predecessor back-tracking to reconstruct the exact node sequence.</li>
              </ul>
            </div>
            <p>
              <strong>Constraint:</strong> Edge weights must be non-negative (<code className="text-slate-800">d &ge; 0</code>).
              Negative edges violate the greedy choice property and are strictly rejected.
            </p>
          </CardContent>
        </Card>

        {/* A* Search */}
        <Card className="hover:border-teal-200 transition-all">
          <CardHeader
            title={
              <div className="flex items-center gap-2 text-slate-900">
                <Compass className="w-5 h-5 text-tealAccent-600" />
                <span>2. A* Search & Admissible Heuristic</span>
              </div>
            }
            action={<Badge variant="teal">O((V + E) log V)</Badge>}
          />
          <CardContent className="p-5 text-xs text-slate-600 space-y-3 leading-relaxed">
            <p>
              A* enhances Dijkstra by incorporating a heuristic function <code className="text-tealAccent-700 font-bold">h(n)</code>
              to estimate the remaining cost to the goal, prioritizing nodes by <code className="text-slate-900 font-bold">f(n) = g(n) + h(n)</code>.
            </p>
            <div className="bg-teal-50/50 p-3 rounded-lg border border-teal-200 space-y-1 text-teal-950">
              <p className="font-semibold text-teal-900">Mathematical Admissibility Proof:</p>
              <p>
                An admissible heuristic never overestimates the actual cost: <code className="font-bold">h(n) &le; h*(n)</code>.
                In geographical networks, the great-circle Haversine distance is the physical geodesic lower bound between two points.
                Since any physical road trajectory satisfies <code className="font-bold">road_distance &ge; haversine_distance</code>,
                the Haversine heuristic is mathematically guaranteed to be admissible and consistent!
              </p>
            </div>
            <p>
              <strong>Outcome:</strong> A* visits substantially fewer nodes than Dijkstra while returning an identically optimal route.
            </p>
          </CardContent>
        </Card>

        {/* BFS */}
        <Card className="hover:border-indigo-200 transition-all">
          <CardHeader
            title={
              <div className="flex items-center gap-2 text-slate-900">
                <Layers className="w-5 h-5 text-indigo-600" />
                <span>3. Breadth-First Search (BFS) vs. Road Distance</span>
              </div>
            }
            action={<Badge variant="indigo">O(V + E)</Badge>}
          />
          <CardContent className="p-5 text-xs text-slate-600 space-y-3 leading-relaxed">
            <p>
              BFS explores the network level-by-level using a FIFO queue, discovering the path with the
              <strong> fewest hops (edges)</strong>.
            </p>
            <div className="bg-indigo-50/40 p-3 rounded-lg border border-indigo-200 space-y-1 text-indigo-950">
              <p className="font-semibold text-indigo-900">Important CS Distinction:</p>
              <p>
                BFS interprets all edges as unweighted (weight = 1). In road networks, a path of 2 highway segments
                totaling 100 km will be chosen by BFS over a path of 3 city streets totaling 30 km.
                Therefore, BFS minimizes turn-count/hops, not physical kilometers!
              </p>
            </div>
          </CardContent>
        </Card>

        {/* TSP Nearest Neighbor */}
        <Card className="hover:border-amber-200 transition-all">
          <CardHeader
            title={
              <div className="flex items-center gap-2 text-slate-900">
                <GitFork className="w-5 h-5 text-amber-600" />
                <span>4. Multi-Stop TSP Nearest-Neighbor Heuristic</span>
              </div>
            }
            action={<Badge variant="amber">O(K &times; Dijkstra)</Badge>}
          />
          <CardContent className="p-5 text-xs text-slate-600 space-y-3 leading-relaxed">
            <p>
              Finding the globally optimal route across multiple delivery stops is the <strong>Travelling Salesperson Problem (TSP)</strong>,
              which is notoriously <strong>NP-Hard</strong> with an exact brute-force search space of <code className="text-slate-900 font-bold">O(N!)</code>.
            </p>
            <div className="bg-amber-50/50 p-3 rounded-lg border border-amber-200 space-y-1 text-amber-950">
              <p className="font-semibold text-amber-900">Greedy Nearest Neighbor Strategy:</p>
              <p>
                Rather than evaluating factorial permutations, our algorithm runs Dijkstra from the current vehicle location to
                all remaining unvisited drop-offs, greedily visits the nearest stop, and repeats until all stops are fulfilled.
                While polynomial in execution time (<code className="font-mono">O(K &times; Dijkstra)</code>), it is an approximation heuristic
                and may yield suboptimal global tours compared to 2-opt or integer linear programming.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Big-O Complexity Comparison Table */}
      <Card>
        <CardHeader
          title="Formal Big-O Complexity Matrix"
          subtitle="Theoretical time and space bounds across all implemented graph algorithms"
        />
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="p-3.5">Algorithm</th>
                  <th className="p-3.5">Time Complexity</th>
                  <th className="p-3.5">Space Complexity</th>
                  <th className="p-3.5">Data Structures Used</th>
                  <th className="p-3.5">Optimality Guarantee</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                <tr className="hover:bg-slate-50/60">
                  <td className="p-3.5 font-bold text-slate-900">Dijkstra</td>
                  <td className="p-3.5 font-mono text-brand-600 font-semibold">O((V + E) log V)</td>
                  <td className="p-3.5 font-mono">O(V)</td>
                  <td className="p-3.5">Binary Heap (PriorityQueue), HashMap</td>
                  <td className="p-3.5 text-emerald-700 font-medium">Guaranteed shortest distance</td>
                </tr>
                <tr className="hover:bg-slate-50/60">
                  <td className="p-3.5 font-bold text-slate-900">A* Search</td>
                  <td className="p-3.5 font-mono text-tealAccent-700 font-semibold">O((V + E) log V) [worst-case]</td>
                  <td className="p-3.5 font-mono">O(V)</td>
                  <td className="p-3.5">Min-Heap, HashMap, Haversine Heuristic</td>
                  <td className="p-3.5 text-emerald-700 font-medium">Guaranteed optimal with admissible h(n)</td>
                </tr>
                <tr className="hover:bg-slate-50/60">
                  <td className="p-3.5 font-bold text-slate-900">Breadth-First Search (BFS)</td>
                  <td className="p-3.5 font-mono text-indigo-600 font-semibold">O(V + E)</td>
                  <td className="p-3.5 font-mono">O(V)</td>
                  <td className="p-3.5">FIFO Queue (ArrayDeque), HashSet</td>
                  <td className="p-3.5 text-amber-700 font-medium">Guaranteed minimum hops (unweighted)</td>
                </tr>
                <tr className="hover:bg-slate-50/60">
                  <td className="p-3.5 font-bold text-slate-900">Depth-First Search (DFS)</td>
                  <td className="p-3.5 font-mono text-slate-600 font-semibold">O(V + E)</td>
                  <td className="p-3.5 font-mono">O(V)</td>
                  <td className="p-3.5">LIFO Stack (ArrayDeque), HashSet</td>
                  <td className="p-3.5 text-rose-700 font-medium">No shortest-path guarantee (reachability only)</td>
                </tr>
                <tr className="hover:bg-slate-50/60">
                  <td className="p-3.5 font-bold text-slate-900">Nearest Neighbor TSP</td>
                  <td className="p-3.5 font-mono text-amber-600 font-semibold">O(K &times; ((V + E) log V))</td>
                  <td className="p-3.5 font-mono">O(V + K)</td>
                  <td className="p-3.5">Dijkstra Heap, LinkedHashSet, Leg Accumulator</td>
                  <td className="p-3.5 text-amber-700 font-medium">Greedy approximation heuristic</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Architecture and Engineering Design */}
      <Card>
        <CardHeader
          title="Engineering Architecture & Software Design"
          subtitle="Clean modular layering across backend services and reactive frontend"
        />
        <CardContent className="p-5 text-xs text-slate-600 space-y-4 leading-relaxed">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Cpu className="w-4 h-4 text-brand-600" />
                Backend Clean Architecture
              </h4>
              <ul className="list-disc pl-4 space-y-1">
                <li>Java 21 LTS with immutable records and pattern matching.</li>
                <li>Spring Boot 3.3.4 with Spring Data JPA.</li>
                <li>Pure algorithmic separation: Algorithms have 0 external library dependencies.</li>
                <li>Flyway schema migrations & dual profile support (Postgres + H2).</li>
              </ul>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Layers className="w-4 h-4 text-tealAccent-600" />
                Frontend Reactive Interface
              </h4>
              <ul className="list-disc pl-4 space-y-1">
                <li>React 19 with TypeScript and Vite.</li>
                <li>Tailwind CSS design system with custom navy/slate theme.</li>
                <li>Interactive graph canvas powered by @xyflow/react.</li>
                <li>Recharts comparative analytical charting.</li>
              </ul>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Quality Assurance & Testing
              </h4>
              <ul className="list-disc pl-4 space-y-1">
                <li>JUnit 5 & Mockito integration suites (31 passing tests).</li>
                <li>Edge cases verified: cycles, zero weights, disconnected nodes.</li>
                <li>Vitest & React Testing Library frontend suites.</li>
                <li>GitHub Actions CI pipeline for automated build validation.</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
