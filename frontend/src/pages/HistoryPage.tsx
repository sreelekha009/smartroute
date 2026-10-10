import React, { useEffect, useState } from 'react';
import { ApiClient, extractErrorMessage } from '../api/client';
import { RouteHistorySummaryDto, RouteHistoryDetailDto } from '../api/types';
import { Card, CardContent, CardHeader } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { useToast } from '../components/common/Toast';
import { EmptyState } from '../components/common/EmptyState';
import {
  History,
  Eye,
  Calendar,
  Milestone,
  Timer,
  RefreshCw,
  Search,
} from 'lucide-react';

export const HistoryPage: React.FC = () => {
  const [history, setHistory] = useState<RouteHistorySummaryDto[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<RouteHistoryDetailDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  const { error: toastError } = useToast();

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const data = await ApiClient.getRouteHistory(100);
      setHistory(data);
    } catch (err) {
      toastError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleInspect = async (id: string) => {
    try {
      const detail = await ApiClient.getRouteHistoryById(id);
      setSelectedRoute(detail);
    } catch (err) {
      toastError(extractErrorMessage(err));
    }
  };

  const parsePath = (pathJson: string): string[] => {
    try {
      return JSON.parse(pathJson);
    } catch {
      return pathJson.split(' -> ');
    }
  };

  const filtered = history.filter(
    (h) =>
      h.sourceName.toLowerCase().includes(search.toLowerCase()) ||
      h.destinationName.toLowerCase().includes(search.toLowerCase()) ||
      h.algorithm.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      <Card>
        <CardHeader
          title="Audited Route Execution History"
          subtitle="Persistent telemetry tracking all calculated shortest paths and multi-stop itineraries"
          action={
            <Button
              variant="outline"
              size="sm"
              onClick={fetchHistory}
              isLoading={loading}
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
            >
              Refresh
            </Button>
          }
        />
        <CardContent className="p-5 space-y-4">
          {/* Search Filter */}
          <div className="relative max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Filter by origin, destination, or algorithm..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          {loading ? (
            <div className="p-8 text-center text-xs text-slate-400">Loading route history...</div>
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={History}
              title="No historical route logs found"
              description="Routes calculated in the Route Planner or Multi-Stop Planner will appear here automatically."
            />
          ) : (
            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="p-3">Algorithm</th>
                    <th className="p-3">Origin Hub</th>
                    <th className="p-3">Destination / Route</th>
                    <th className="p-3">Distance (km)</th>
                    <th className="p-3">Stops</th>
                    <th className="p-3">Solver Time</th>
                    <th className="p-3">Timestamp</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filtered.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-3">
                        <Badge
                          variant={
                            item.algorithm.includes('A*')
                              ? 'teal'
                              : item.algorithm.includes('Dijkstra')
                              ? 'blue'
                              : item.algorithm.includes('TSP')
                              ? 'emerald'
                              : 'slate'
                          }
                          size="sm"
                        >
                          {item.algorithm}
                        </Badge>
                      </td>
                      <td className="p-3 font-medium text-slate-900">{item.sourceName}</td>
                      <td className="p-3 text-slate-800">{item.destinationName}</td>
                      <td className="p-3 font-mono font-bold text-brand-600">{item.totalDistanceKm.toFixed(1)} km</td>
                      <td className="p-3 font-mono">{item.nodeCount}</td>
                      <td className="p-3 font-mono text-slate-500">{item.executionTimeMs.toFixed(3)} ms</td>
                      <td className="p-3 text-[11px] text-slate-400">
                        {new Date(item.createdAt).toLocaleString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="p-3 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleInspect(item.id)}
                          leftIcon={<Eye className="w-3 h-3" />}
                        >
                          Inspect
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Inspection Modal */}
      <Modal
        isOpen={!!selectedRoute}
        onClose={() => setSelectedRoute(null)}
        title={
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-brand-600" />
            <span>Audited Route Trajectory</span>
          </div>
        }
        subtitle={selectedRoute?.algorithm}
        maxWidth="lg"
      >
        {selectedRoute && (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Total Distance</span>
                <p className="text-base font-bold text-slate-900 mt-0.5">{selectedRoute.totalDistanceKm.toFixed(1)} km</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Total Stops</span>
                <p className="text-base font-bold text-slate-900 mt-0.5">{selectedRoute.nodeCount}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Execution</span>
                <p className="text-base font-bold text-slate-900 mt-0.5 font-mono">{selectedRoute.executionTimeMs.toFixed(3)} ms</p>
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-2">Waypoint Navigation Sequence:</label>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                {parsePath(selectedRoute.pathJson).map((stopName, idx, arr) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[10px] font-bold shrink-0">
                      {idx + 1}
                    </span>
                    <span className="text-slate-800 font-medium">{stopName}</span>
                    {idx === 0 && <Badge variant="emerald" size="sm">Origin</Badge>}
                    {idx === arr.length - 1 && <Badge variant="rose" size="sm">Terminus</Badge>}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                variant="primary"
                size="sm"
                onClick={() => setSelectedRoute(null)}
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
