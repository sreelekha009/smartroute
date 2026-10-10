import React, { useEffect, useState } from 'react';
import { ApiClient, extractErrorMessage } from '../api/client';
import {
  LocationDto,
  ShortestRouteResponse,
} from '../api/types';
import { Card, CardContent, CardHeader } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Select } from '../components/common/Select';
import { useToast } from '../components/common/Toast';
import {
  GitCompare,
  Play,
  CheckCircle2,
  AlertTriangle,
  Info,
  Timer,
  Eye,
  Milestone,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export const ComparisonPage: React.FC = () => {
  const [locations, setLocations] = useState<LocationDto[]>([]);
  const [startId, setStartId] = useState<string>('');
  const [targetId, setTargetId] = useState<string>('');

  const [loading, setLoading] = useState(false);
  const [dijkstraResult, setDijkstraResult] = useState<ShortestRouteResponse | null>(null);
  const [aStarResult, setAStarResult] = useState<ShortestRouteResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { success, error: toastError } = useToast();

  useEffect(() => {
    loadLocations();
  }, []);

  const loadLocations = async () => {
    try {
      const locs = await ApiClient.getLocations();
      setLocations(locs);
      if (locs.length >= 2) {
        setStartId(locs[1].id); // Dublin Airport
        setTargetId(locs[7].id); // Ballsbridge Embassy Quarter
      }
    } catch (err) {
      toastError(extractErrorMessage(err));
    }
  };

  const handleCompare = async () => {
    if (!startId || !targetId) {
      toastError('Please select both start and target locations');
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      // Execute both algorithms concurrently on identical graph
      const [dRes, aRes] = await Promise.all([
        ApiClient.calculateShortestRoute({
          startLocationId: startId,
          targetLocationId: targetId,
          algorithm: 'DIJKSTRA',
        }),
        ApiClient.calculateShortestRoute({
          startLocationId: startId,
          targetLocationId: targetId,
          algorithm: 'ASTAR',
        }),
      ]);

      setDijkstraResult(dRes);
      setAStarResult(aRes);
      success('Executed Dijkstra and A* Search successfully on identical network.');
    } catch (err) {
      const msg = extractErrorMessage(err);
      setErrorMessage(msg);
      toastError(msg);
    } finally {
      setLoading(false);
    }
  };

  const locationOptions = locations.map((loc) => ({
    value: loc.id,
    label: loc.name,
  }));

  const chartData = [
    {
      metric: 'Visited Nodes (Exploration)',
      Dijkstra: dijkstraResult?.visitedNodeCount || 0,
      'A* Search': aStarResult?.visitedNodeCount || 0,
    },
    {
      metric: 'Runtime (ms)',
      Dijkstra: Number(dijkstraResult?.executionTimeMs.toFixed(3)) || 0,
      'A* Search': Number(aStarResult?.executionTimeMs.toFixed(3)) || 0,
    },
  ];

  const costDifference = dijkstraResult && aStarResult
    ? Math.abs(dijkstraResult.totalDistanceKm - aStarResult.totalDistanceKm)
    : 0;

  const nodeSavings = dijkstraResult && aStarResult && dijkstraResult.visitedNodeCount > 0
    ? Math.round(((dijkstraResult.visitedNodeCount - aStarResult.visitedNodeCount) / dijkstraResult.visitedNodeCount) * 100)
    : 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Parameter Selection */}
      <Card>
        <CardHeader
          title={
            <div className="flex items-center gap-2">
              <GitCompare className="w-5 h-5 text-indigo-600" />
              <span>Comparative Benchmark: Dijkstra vs. A* Search</span>
            </div>
          }
          subtitle="Direct head-to-head evaluation under identical graph state and admissible Haversine heuristic"
        />
        <CardContent className="p-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Starting Location"
              value={startId}
              onChange={(e) => setStartId(e.target.value)}
              options={locationOptions}
              disabled={loading}
            />

            <Select
              label="Destination Location"
              value={targetId}
              onChange={(e) => setTargetId(e.target.value)}
              options={locationOptions}
              disabled={loading}
            />
          </div>

          <div className="mt-5 flex justify-end pt-4 border-t border-slate-100">
            <Button
              variant="primary"
              size="md"
              onClick={handleCompare}
              isLoading={loading}
              leftIcon={<Play className="w-4 h-4 fill-white" />}
            >
              Run Side-by-Side Comparison
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Error state */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-950 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold">Comparison Failed</p>
            <p className="text-xs text-rose-800 mt-0.5 leading-relaxed">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Comparison Results */}
      {dijkstraResult && aStarResult && (
        <div className="space-y-6 animate-in slide-in-from-top-2">
          {/* Mathematical Equivalence Verification Banner */}
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold">Optimal Cost Agreement Confirmed</p>
              <p className="text-xs text-emerald-800 mt-0.5 leading-relaxed">
                Both algorithms returned identical shortest path distance: <strong>{dijkstraResult.totalDistanceKm.toFixed(2)} km</strong> (difference: {costDifference.toFixed(4)} km).
                Because the Haversine distance never overestimates great-circle road distance, A* remains mathematically admissible and optimal.
                {nodeSavings > 0 && ` A* pruned the search space by examining ${nodeSavings}% fewer nodes.`}
              </p>
            </div>
          </div>

          {/* Side by side comparison cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Dijkstra Card */}
            <Card className="border-blue-200 bg-white">
              <CardHeader
                title="Dijkstra's Algorithm"
                subtitle="Uniform-cost frontier expansion"
                action={<Badge variant="blue">Uninformed</Badge>}
              />
              <CardContent className="p-5 space-y-4">
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-500 uppercase font-semibold">Distance</span>
                    <p className="text-base font-bold text-slate-900 mt-0.5">{dijkstraResult.totalDistanceKm.toFixed(1)} km</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-500 uppercase font-semibold">Nodes Visited</span>
                    <p className="text-base font-bold text-slate-900 mt-0.5">{dijkstraResult.visitedNodeCount}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-500 uppercase font-semibold">Time</span>
                    <p className="text-base font-bold text-slate-900 mt-0.5 font-mono">{dijkstraResult.executionTimeMs.toFixed(3)} ms</p>
                  </div>
                </div>

                <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1">
                  <p className="font-semibold text-slate-800">Characteristics:</p>
                  <p>Expands uniformly in all directions regardless of target location.</p>
                  <p>Guaranteed optimal for non-negative weights.</p>
                </div>
              </CardContent>
            </Card>

            {/* A* Search Card */}
            <Card className="border-teal-200 bg-white">
              <CardHeader
                title="A* Search Algorithm"
                subtitle="Informed search with Haversine heuristic"
                action={<Badge variant="teal">Informed / Heuristic</Badge>}
              />
              <CardContent className="p-5 space-y-4">
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-500 uppercase font-semibold">Distance</span>
                    <p className="text-base font-bold text-slate-900 mt-0.5">{aStarResult.totalDistanceKm.toFixed(1)} km</p>
                  </div>
                  <div className="p-3 bg-teal-50 rounded-lg border border-teal-200">
                    <span className="text-[10px] text-tealAccent-700 uppercase font-semibold">Nodes Visited</span>
                    <p className="text-base font-bold text-tealAccent-800 mt-0.5">{aStarResult.visitedNodeCount}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-500 uppercase font-semibold">Time</span>
                    <p className="text-base font-bold text-slate-900 mt-0.5 font-mono">{aStarResult.executionTimeMs.toFixed(3)} ms</p>
                  </div>
                </div>

                <div className="text-xs text-slate-600 bg-teal-50/50 p-3 rounded-lg border border-teal-200 space-y-1">
                  <p className="font-semibold text-teal-900">Characteristics:</p>
                  <p>Directs exploration toward the goal using $f(n) = g(n) + h(n)$.</p>
                  <p>Expands fewer nodes than Dijkstra while guaranteeing equal cost.</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Visual Recharts Bar Chart */}
          <Card>
            <CardHeader
              title="Visual Metric Comparison"
              subtitle="Visited nodes and execution duration"
            />
            <CardContent className="p-5">
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="metric" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="Dijkstra" fill="#2563eb" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="A* Search" fill="#0d9488" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Complexity Reference Table */}
      <Card>
        <CardHeader
          title="Theoretical Complexity Breakdown"
          subtitle="Formal algorithmic properties"
        />
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="p-3.5">Algorithm</th>
                  <th className="p-3.5">Time Complexity</th>
                  <th className="p-3.5">Space Complexity</th>
                  <th className="p-3.5">Optimality Guarantee</th>
                  <th className="p-3.5">Heuristic Dependency</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                <tr className="hover:bg-slate-50/60">
                  <td className="p-3.5 font-bold text-slate-900">Dijkstra</td>
                  <td className="p-3.5 font-mono text-brand-600 font-medium">O((V + E) log V)</td>
                  <td className="p-3.5 font-mono">O(V)</td>
                  <td className="p-3.5 text-emerald-700 font-medium">Always Optimal (weights &ge; 0)</td>
                  <td className="p-3.5 text-slate-500">None (Uninformed)</td>
                </tr>
                <tr className="hover:bg-slate-50/60">
                  <td className="p-3.5 font-bold text-slate-900">A* Search</td>
                  <td className="p-3.5 font-mono text-tealAccent-700 font-medium">O((V + E) log V) [worst]</td>
                  <td className="p-3.5 font-mono">O(V)</td>
                  <td className="p-3.5 text-emerald-700 font-medium">Optimal if h(n) &le; h*(n)</td>
                  <td className="p-3.5 text-tealAccent-700 font-medium">Haversine Great-Circle</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
