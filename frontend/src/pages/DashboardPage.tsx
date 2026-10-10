import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ApiClient, extractErrorMessage } from '../api/client';
import { DashboardSummaryDto } from '../api/types';
import { Card, CardContent, CardHeader } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { CardSkeleton } from '../components/common/Skeleton';
import { useToast } from '../components/common/Toast';
import { NetworkGraphVisualizer } from '../components/graph/NetworkGraphVisualizer';
import {
  MapPin,
  GitFork,
  Route,
  Timer,
  ArrowRight,
  TrendingUp,
  Truck,
  GitCompare,
  Compass,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';

export const DashboardPage: React.FC = () => {
  const [data, setData] = useState<DashboardSummaryDto | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { error: toastError } = useToast();

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const summary = await ApiClient.getDashboard();
      setData(summary);
    } catch (err) {
      toastError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const chartColors = ['#2563eb', '#0d9488', '#f59e0b', '#8b5cf6', '#ec4899'];
  const algoData = data
    ? Object.entries(data.algorithmUsageStats).map(([name, value]) => ({
        name,
        value,
      }))
    : [];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          <>
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </>
        ) : (
          <>
            <Card className="hover:border-blue-200 transition-all">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Total Locations
                  </p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">
                    {data?.totalLocations ?? 0}
                  </p>
                  <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                    <span className="text-emerald-600 font-medium">Mapped Hubs</span> in Network
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-brand-600 flex items-center justify-center">
                  <MapPin className="w-6 h-6" />
                </div>
              </CardContent>
            </Card>

            <Card className="hover:border-teal-200 transition-all">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Total Roads
                  </p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">
                    {data?.totalRoads ?? 0}
                  </p>
                  <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                    <span className="text-tealAccent-600 font-medium">Weighted Edges</span> (Directed/Bi)
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-teal-50 text-tealAccent-600 flex items-center justify-center">
                  <GitFork className="w-6 h-6" />
                </div>
              </CardContent>
            </Card>

            <Card className="hover:border-indigo-200 transition-all">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Calculated Routes
                  </p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">
                    {data?.totalRoutesCalculated ?? 0}
                  </p>
                  <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Audited Dispatches</span>
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Route className="w-6 h-6" />
                </div>
              </CardContent>
            </Card>

            <Card className="hover:border-amber-200 transition-all">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Last Route Distance
                  </p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">
                    {data?.lastCalculatedRouteDistanceKm?.toFixed(1) ?? '0.0'}
                    <span className="text-sm font-normal text-slate-500 ml-1">km</span>
                  </p>
                  <p className="text-xs text-slate-400 mt-1">Latest execution tour</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Timer className="w-6 h-6" />
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Quick Actions Bar */}
      <div className="bg-gradient-to-r from-navy-950 via-navy-900 to-navy-850 p-5 rounded-xl border border-navy-800 text-white flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg shadow-navy-950/10">
        <div>
          <h2 className="text-base font-semibold tracking-tight text-white flex items-center gap-2">
            <Compass className="w-5 h-5 text-tealAccent-500" />
            <span>Ready to Plan Delivery Routes?</span>
          </h2>
          <p className="text-xs text-slate-300 mt-0.5 max-w-xl">
            Choose point-to-point shortest paths, multi-stop fleet sequences, or side-by-side algorithmic comparisons.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <Button
            size="sm"
            variant="primary"
            onClick={() => navigate('/planner')}
            leftIcon={<Route className="w-4 h-4" />}
          >
            Plan Route
          </Button>
          <Button
            size="sm"
            variant="teal"
            onClick={() => navigate('/multi-stop')}
            leftIcon={<Truck className="w-4 h-4" />}
          >
            Multi-Stop Dispatch
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="text-white border-navy-700 hover:bg-navy-800"
            onClick={() => navigate('/comparison')}
            leftIcon={<GitCompare className="w-4 h-4" />}
          >
            Compare Dijkstra vs A*
          </Button>
        </div>
      </div>

      {/* Main Grid: Network Preview and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Network Graph Preview (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader
              title="Logistics Network Topology"
              subtitle="Live interactive preview of Dublin Metropolitan Area hubs and road connections"
              action={
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigate('/planner')}
                  rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                >
                  Interactive Canvas
                </Button>
              }
            />
            <CardContent className="p-4">
              {data && data.networkPreviewNodes.length > 0 ? (
                <NetworkGraphVisualizer
                  locations={data.networkPreviewNodes}
                  roads={data.networkPreviewRoads}
                  height={380}
                  interactive={true}
                />
              ) : (
                <div className="h-64 flex items-center justify-center text-slate-400 text-sm">
                  Loading network topology...
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Algorithm Usage Distribution (1 col) */}
        <div className="space-y-6">
          <Card>
            <CardHeader
              title="Algorithm Distribution"
              subtitle="Frequency of algorithms across recorded route calculations"
            />
            <CardContent className="p-4">
              {algoData.length > 0 ? (
                <div className="h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={algoData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={75}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {algoData.map((_, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={chartColors[index % chartColors.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-44 flex items-center justify-center text-slate-400 text-xs">
                  No routes calculated yet
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Routes List */}
          <Card>
            <CardHeader
              title="Recent Dispatches"
              subtitle="Latest audited itineraries"
              action={
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigate('/history')}
                >
                  View All
                </Button>
              }
            />
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100">
                {data?.recentRoutes?.slice(0, 4).map((r) => (
                  <div key={r.id} className="p-3.5 hover:bg-slate-50 transition-colors flex items-center justify-between text-xs">
                    <div className="min-w-0 pr-2">
                      <div className="font-semibold text-slate-900 truncate">
                        {r.sourceName} &rarr; {r.destinationName}
                      </div>
                      <div className="text-slate-400 flex items-center gap-2 mt-0.5">
                        <Badge
                          variant={
                            r.algorithm.includes('A*')
                              ? 'teal'
                              : r.algorithm.includes('Dijkstra')
                              ? 'blue'
                              : 'slate'
                          }
                          size="sm"
                        >
                          {r.algorithm}
                        </Badge>
                        <span>{r.totalDistanceKm.toFixed(1)} km</span>
                      </div>
                    </div>
                    <span className="text-slate-400 text-[11px] shrink-0 font-mono">
                      {r.executionTimeMs.toFixed(2)} ms
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
