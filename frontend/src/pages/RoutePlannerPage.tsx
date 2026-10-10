import React, { useEffect, useState } from 'react';
import { ApiClient, extractErrorMessage } from '../api/client';
import {
  LocationDto,
  RoadDto,
  ShortestRouteResponse,
  AlgorithmType,
} from '../api/types';
import { Card, CardContent, CardHeader } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Select } from '../components/common/Select';
import { useToast } from '../components/common/Toast';
import { NetworkGraphVisualizer } from '../components/graph/NetworkGraphVisualizer';
import {
  Navigation,
  Play,
  RotateCcw,
  Timer,
  Eye,
  Milestone,
  AlertTriangle,
  Info,
  Clock,
  Sparkles,
} from 'lucide-react';

export const RoutePlannerPage: React.FC = () => {
  const [locations, setLocations] = useState<LocationDto[]>([]);
  const [roads, setRoads] = useState<RoadDto[]>([]);
  const [startId, setStartId] = useState<string>('');
  const [targetId, setTargetId] = useState<string>('');
  const [algorithm, setAlgorithm] = useState<AlgorithmType>('DIJKSTRA');

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ShortestRouteResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { success, error: toastError } = useToast();

  useEffect(() => {
    loadNetwork();
  }, []);

  const loadNetwork = async () => {
    try {
      const [locs, rds] = await Promise.all([
        ApiClient.getLocations(),
        ApiClient.getRoads(),
      ]);
      setLocations(locs);
      setRoads(rds);

      // Pre-select plausible start and target if available
      if (locs.length >= 2) {
        setStartId(locs[0].id);
        setTargetId(locs[1].id);
      }
    } catch (err) {
      toastError(extractErrorMessage(err));
    }
  };

  const handleCalculate = async () => {
    if (!startId || !targetId) {
      toastError('Please select both start and target locations');
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    setResult(null);

    try {
      const resp = await ApiClient.calculateShortestRoute({
        startLocationId: startId,
        targetLocationId: targetId,
        algorithm,
      });
      setResult(resp);
      success(`Calculated route via ${resp.algorithm}: ${resp.totalDistanceKm.toFixed(1)} km`);
    } catch (err) {
      const msg = extractErrorMessage(err);
      setErrorMessage(msg);
      toastError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setErrorMessage(null);
    if (locations.length >= 2) {
      setStartId(locations[0].id);
      setTargetId(locations[1].id);
    }
  };

  const locationOptions = locations.map((loc) => ({
    value: loc.id,
    label: loc.name,
  }));

  const algorithmOptions = [
    { value: 'DIJKSTRA', label: 'Dijkstra (Weighted Shortest Path)' },
    { value: 'ASTAR', label: 'A* Search (Haversine Admissible Heuristic)' },
    { value: 'BFS', label: 'BFS (Minimum Hop Traversal)' },
    { value: 'DFS', label: 'DFS (Reachability / Depth Exploration)' },
  ];

  const highlightedNodeIds = result?.pathLocations.map((l) => l.id) || [];

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Route Configuration Panel */}
      <Card>
        <CardHeader
          title={
            <div className="flex items-center gap-2">
              <Navigation className="w-5 h-5 text-brand-600" />
              <span>Configure Route Parameters</span>
            </div>
          }
          subtitle="Select endpoints and pathfinding algorithm on the synthetic Dublin road network"
        />
        <CardContent className="p-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select
              label="Starting Location (Origin)"
              value={startId}
              onChange={(e) => setStartId(e.target.value)}
              options={locationOptions}
              disabled={loading}
            />

            <Select
              label="Destination (Target)"
              value={targetId}
              onChange={(e) => setTargetId(e.target.value)}
              options={locationOptions}
              disabled={loading}
            />

            <Select
              label="Algorithm"
              value={algorithm}
              onChange={(e) => setAlgorithm(e.target.value as AlgorithmType)}
              options={algorithmOptions}
              disabled={loading}
            />
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Sparkles className="w-4 h-4 text-brand-500" />
              <span>
                Try selecting <strong>Lambay Island Outpost</strong> to observe unreachable network error handling.
              </span>
            </div>

            <div className="flex items-center gap-2.5">
              <Button
                variant="outline"
                size="md"
                onClick={handleReset}
                leftIcon={<RotateCcw className="w-4 h-4" />}
                disabled={loading}
              >
                Reset
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={handleCalculate}
                isLoading={loading}
                leftIcon={<Play className="w-4 h-4 fill-white" />}
              >
                Calculate Route
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error State Banner */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-950 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold">Route Calculation Error</p>
            <p className="text-xs text-rose-800 mt-0.5 leading-relaxed">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Results Diagnostics Cards */}
      {result && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 animate-in slide-in-from-top-2 duration-200">
          <Card className="border-brand-200 bg-brand-50/20">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2.5 bg-brand-100 text-brand-700 rounded-lg">
                <Milestone className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-slate-500 uppercase">Total Distance</p>
                <p className="text-xl font-bold text-slate-900">{result.totalDistanceKm.toFixed(1)} km</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-teal-200 bg-teal-50/20">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2.5 bg-teal-100 text-tealAccent-700 rounded-lg">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-slate-500 uppercase">Estimated Duration</p>
                <p className="text-xl font-bold text-slate-900">
                  {result.estimatedDurationMinutes ? `${result.estimatedDurationMinutes.toFixed(0)} mins` : 'N/A'}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-indigo-200 bg-indigo-50/20">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2.5 bg-indigo-100 text-indigo-700 rounded-lg">
                <Eye className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-slate-500 uppercase">Visited Nodes</p>
                <p className="text-xl font-bold text-slate-900">{result.visitedNodeCount}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-amber-200 bg-amber-50/20">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2.5 bg-amber-100 text-amber-700 rounded-lg">
                <Timer className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-slate-500 uppercase">Execution Time</p>
                <p className="text-xl font-bold text-slate-900 font-mono">{result.executionTimeMs.toFixed(3)} ms</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Ordered Path Sequence Card */}
      {result && result.pathLocations.length > 0 && (
        <Card>
          <CardHeader
            title="Optimal Route Sequence"
            subtitle={`${result.pathLocations.length} stops along itinerary • ${result.algorithm}`}
            action={
              <Badge variant="blue" size="md">
                {result.pathLocations.length - 1} road segments
              </Badge>
            }
          />
          <CardContent className="p-5">
            <div className="flex flex-wrap items-center gap-2">
              {result.pathLocations.map((loc, idx) => (
                <React.Fragment key={loc.id}>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium bg-slate-50 border-slate-200">
                    <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[10px] font-bold">
                      {idx + 1}
                    </span>
                    <span className="text-slate-800">{loc.name}</span>
                  </div>
                  {idx < result.pathLocations.length - 1 && (
                    <span className="text-slate-400 font-bold">&rarr;</span>
                  )}
                </React.Fragment>
              ))}
            </div>

            {result.notes && (
              <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600 flex items-start gap-2">
                <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <p className="leading-relaxed">{result.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Visual Canvas */}
      <Card>
        <CardHeader
          title="Interactive Network Topology"
          subtitle="React Flow graph visualization. Path nodes and edges are highlighted upon calculation."
        />
        <CardContent className="p-4">
          <NetworkGraphVisualizer
            locations={locations}
            roads={roads}
            highlightedPathNodeIds={highlightedNodeIds}
            startNodeId={startId}
            targetNodeId={targetId}
            height={520}
            interactive={true}
          />
        </CardContent>
      </Card>

      {/* Educational Callout */}
      <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl text-xs text-blue-900 space-y-1 leading-relaxed">
        <p className="font-bold flex items-center gap-1.5 text-blue-950">
          <Info className="w-4 h-4 text-blue-600" />
          Weighted Shortest Path vs. Hop-Based Traversal
        </p>
        <p className="text-blue-800">
          Algorithms like <strong>Dijkstra</strong> and <strong>A*</strong> minimize the continuous sum of edge weights (kilometers),
          finding the true physical shortest path. In contrast, <strong>BFS</strong> treats every edge uniformly with a weight of 1,
          guaranteeing the fewest intermediate hops regardless of total kilometers traversed.
          Note: This road network represents synthetic illustrative logistics fixtures for demonstration purposes.
        </p>
      </div>
    </div>
  );
};
