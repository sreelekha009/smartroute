import React, { useEffect, useState } from 'react';
import { ApiClient, extractErrorMessage } from '../api/client';
import {
  LocationDto,
  RoadDto,
  MultiStopRouteResponse,
} from '../api/types';
import { Card, CardContent, CardHeader } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Select } from '../components/common/Select';
import { useToast } from '../components/common/Toast';
import { NetworkGraphVisualizer } from '../components/graph/NetworkGraphVisualizer';
import {
  Truck,
  Plus,
  Trash2,
  Play,
  RotateCcw,
  CheckCircle2,
  Clock,
  Milestone,
  Timer,
  AlertTriangle,
  Info,
  Warehouse,
} from 'lucide-react';

export const MultiStopPage: React.FC = () => {
  const [locations, setLocations] = useState<LocationDto[]>([]);
  const [roads, setRoads] = useState<RoadDto[]>([]);
  const [depotId, setDepotId] = useState<string>('');
  const [destinationIds, setDestinationIds] = useState<string[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<string>('');
  const [returnToDepot, setReturnToDepot] = useState<boolean>(true);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MultiStopRouteResponse | null>(null);
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

      if (locs.length >= 4) {
        setDepotId(locs[0].id); // Dublin Port
        setDestinationIds([locs[6].id, locs[7].id, locs[18].id]); // Grand Canal Dock, Ballsbridge, Clontarf
        setSelectedCandidate(locs[1].id);
      }
    } catch (err) {
      toastError(extractErrorMessage(err));
    }
  };

  const handleAddDestination = () => {
    if (!selectedCandidate) return;
    if (selectedCandidate === depotId) {
      toastError('Destination cannot be the depot');
      return;
    }
    if (destinationIds.includes(selectedCandidate)) {
      toastError('This destination is already added');
      return;
    }
    setDestinationIds([...destinationIds, selectedCandidate]);
  };

  const handleRemoveDestination = (id: string) => {
    setDestinationIds(destinationIds.filter((d) => d !== id));
  };

  const handleCalculate = async () => {
    if (!depotId) {
      toastError('Please select a depot location');
      return;
    }
    if (destinationIds.length === 0) {
      toastError('Please add at least one destination stop');
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    setResult(null);

    try {
      const resp = await ApiClient.calculateMultiStopRoute({
        depotLocationId: depotId,
        destinationLocationIds: destinationIds,
        returnToDepot,
      });
      setResult(resp);
      success(`Sequenced ${resp.orderedStops.length} stops over ${resp.totalDistanceKm.toFixed(1)} km`);
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
    if (locations.length >= 4) {
      setDepotId(locations[0].id);
      setDestinationIds([locations[6].id, locations[7].id]);
    }
  };

  const locationOptions = locations.map((loc) => ({
    value: loc.id,
    label: loc.name,
  }));

  const candidateOptions = locations
    .filter((loc) => loc.id !== depotId && !destinationIds.includes(loc.id))
    .map((loc) => ({
      value: loc.id,
      label: loc.name,
    }));

  const highlightedNodeIds = result?.fullPathLocations.map((l) => l.id) || [];

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Itinerary Configuration */}
      <Card>
        <CardHeader
          title={
            <div className="flex items-center gap-2">
              <Truck className="w-5 h-5 text-tealAccent-600" />
              <span>Multi-Stop Fleet Dispatch Configurator</span>
            </div>
          }
          subtitle="Sequenced using the Nearest Neighbor TSP greedy approximation heuristic"
        />
        <CardContent className="p-5 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Depot Selection */}
            <div>
              <Select
                label="Central Depot Hub (Origin)"
                value={depotId}
                onChange={(e) => setDepotId(e.target.value)}
                options={locationOptions}
                disabled={loading}
              />
              <p className="text-[11px] text-slate-400 mt-1">
                The distribution center where the delivery vehicle begins its tour.
              </p>
            </div>

            {/* Destination Selection & Adding */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 block mb-1.5">
                Add Delivery Drop-Off Stop
              </label>
              <div className="flex items-center gap-2">
                <select
                  value={selectedCandidate}
                  onChange={(e) => setSelectedCandidate(e.target.value)}
                  disabled={loading || candidateOptions.length === 0}
                  className="flex-1 px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500"
                >
                  <option value="">Select a stop to add...</option>
                  {candidateOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <Button
                  size="md"
                  variant="secondary"
                  onClick={handleAddDestination}
                  disabled={loading || !selectedCandidate}
                  leftIcon={<Plus className="w-4 h-4" />}
                >
                  Add
                </Button>
              </div>
            </div>
          </div>

          {/* Active Destinations Chips */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 block mb-2">
              Selected Stops ({destinationIds.length})
            </label>
            <div className="flex flex-wrap items-center gap-2 min-h-[38px] p-2 bg-slate-50 border border-slate-200 rounded-lg">
              {destinationIds.length === 0 ? (
                <span className="text-xs text-slate-400 italic">No delivery stops added yet.</span>
              ) : (
                destinationIds.map((id) => {
                  const loc = locations.find((l) => l.id === id);
                  return (
                    <span
                      key={id}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-white border border-slate-200 text-slate-800 shadow-2xs"
                    >
                      <span>{loc?.name || id}</span>
                      <button
                        onClick={() => handleRemoveDestination(id)}
                        disabled={loading}
                        className="text-slate-400 hover:text-rose-600 transition-colors p-0.5"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </span>
                  );
                })
              )}
            </div>
          </div>

          {/* Return to Depot & Submit */}
          <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
            <label className="flex items-center gap-2 cursor-pointer select-none text-sm text-slate-700">
              <input
                type="checkbox"
                checked={returnToDepot}
                onChange={(e) => setReturnToDepot(e.target.checked)}
                disabled={loading}
                className="w-4 h-4 text-brand-600 border-slate-300 rounded focus:ring-brand-500"
              />
              <span className="font-medium">Return to Depot upon final delivery (closed tour)</span>
            </label>

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
                variant="teal"
                size="md"
                onClick={handleCalculate}
                isLoading={loading}
                leftIcon={<Play className="w-4 h-4 fill-white" />}
              >
                Optimize Route
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error state */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-950 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold">Dispatch Optimization Error</p>
            <p className="text-xs text-rose-800 mt-0.5 leading-relaxed">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Results Overview */}
      {result && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 animate-in slide-in-from-top-2">
          <Card className="border-teal-200 bg-teal-50/20">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2.5 bg-teal-100 text-tealAccent-700 rounded-lg">
                <Milestone className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-slate-500 uppercase">Total Distance</p>
                <p className="text-xl font-bold text-slate-900">{result.totalDistanceKm.toFixed(1)} km</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-brand-200 bg-brand-50/20">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2.5 bg-brand-100 text-brand-700 rounded-lg">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-slate-500 uppercase">Estimated Time</p>
                <p className="text-xl font-bold text-slate-900">
                  {result.estimatedDurationMinutes ? `${result.estimatedDurationMinutes.toFixed(0)} mins` : 'N/A'}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-indigo-200 bg-indigo-50/20">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2.5 bg-indigo-100 text-indigo-700 rounded-lg">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-slate-500 uppercase">Stops Visited</p>
                <p className="text-xl font-bold text-slate-900">{result.orderedStops.length}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-amber-200 bg-amber-50/20">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2.5 bg-amber-100 text-amber-700 rounded-lg">
                <Timer className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-slate-500 uppercase">Solver Time</p>
                <p className="text-xl font-bold text-slate-900 font-mono">{result.executionTimeMs.toFixed(3)} ms</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Stop Sequence & Per-Leg Breakdown */}
      {result && (
        <Card>
          <CardHeader
            title="Optimized Delivery Itinerary (Leg-by-Leg Breakdown)"
            subtitle="Calculated legs with concatenated road paths"
          />
          <CardContent className="p-5 space-y-4">
            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="p-3">Leg</th>
                    <th className="p-3">Departure Stop</th>
                    <th className="p-3">Arrival Stop</th>
                    <th className="p-3">Leg Distance</th>
                    <th className="p-3">Trajectory</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {result.legs.map((leg) => (
                    <tr key={leg.legIndex} className="hover:bg-slate-50/60">
                      <td className="p-3 font-semibold text-slate-900">Leg #{leg.legIndex}</td>
                      <td className="p-3 flex items-center gap-1.5">
                        <Warehouse className="w-3.5 h-3.5 text-slate-400" />
                        <span>{leg.from.name}</span>
                      </td>
                      <td className="p-3 font-medium text-slate-800">{leg.to.name}</td>
                      <td className="p-3 font-mono text-tealAccent-700 font-bold">{leg.distanceKm.toFixed(1)} km</td>
                      <td className="p-3 text-[11px] text-slate-500">
                        {leg.pathLocations.map((l) => l.name).join(' \u2192 ')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600 flex items-start gap-2">
              <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <p className="leading-relaxed">{result.notes}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Graph Visualizer */}
      <Card>
        <CardHeader
          title="Delivery Tour Visualization"
          subtitle="Full tour path highlighted in real-time"
        />
        <CardContent className="p-4">
          <NetworkGraphVisualizer
            locations={locations}
            roads={roads}
            highlightedPathNodeIds={highlightedNodeIds}
            startNodeId={depotId}
            targetNodeId={returnToDepot ? depotId : destinationIds[destinationIds.length - 1]}
            height={520}
            interactive={true}
          />
        </CardContent>
      </Card>
    </div>
  );
};
