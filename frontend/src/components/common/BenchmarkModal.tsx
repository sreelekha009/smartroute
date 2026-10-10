import React, { useState } from 'react';
import { ApiClient, extractErrorMessage } from '../../api/client';
import { BenchmarkRunResponse } from '../../api/types';
import { Modal } from './Modal';
import { Button } from './Button';
import { Badge } from './Badge';
import { useToast } from './Toast';
import { Cpu, Play, AlertCircle, Info } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface BenchmarkModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BenchmarkModal: React.FC<BenchmarkModalProps> = ({ isOpen, onClose }) => {
  const [nodeCount, setNodeCount] = useState<number>(100);
  const [iterations, setIterations] = useState<number>(5);
  const [seed, setSeed] = useState<number>(42);
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<BenchmarkRunResponse | null>(null);

  const { success, error: toastError } = useToast();

  const handleRun = async () => {
    setLoading(true);
    try {
      const resp = await ApiClient.runBenchmark({ nodeCount, iterations, seed });
      setResult(resp);
      success(`Benchmark executed across ${resp.nodeCount} nodes and ${resp.edgeCount} edges.`);
    } catch (err) {
      toastError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const chartData = result?.metrics.map((m) => ({
    name: m.algorithm.replace(' (Hop-Based)', '').replace(' (Reachability)', ''),
    'Time (ms)': m.medianTimeMs,
    'Visited Nodes': m.medianVisitedNodes,
  })) || [];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <Cpu className="w-5 h-5 text-brand-600" />
          <span>Algorithms Micro-Benchmark Suite</span>
        </div>
      }
      subtitle="Run in-memory reproducible graph tests with JVM warmup cycles"
      maxWidth="2xl"
    >
      <div className="space-y-6">
        {/* Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
          <div>
            <label className="text-xs font-semibold text-slate-600 uppercase">Graph Size (Nodes)</label>
            <select
              value={nodeCount}
              onChange={(e) => setNodeCount(Number(e.target.value))}
              disabled={loading}
              className="mt-1 w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500"
            >
              <option value={100}>100 Nodes (Small Grid)</option>
              <option value={500}>500 Nodes (Medium Urban)</option>
              <option value={1000}>1000 Nodes (Large Regional)</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 uppercase">Iterations</label>
            <select
              value={iterations}
              onChange={(e) => setIterations(Number(e.target.value))}
              disabled={loading}
              className="mt-1 w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500"
            >
              <option value={3}>3 Iterations</option>
              <option value={5}>5 Iterations (Recommended)</option>
              <option value={10}>10 Iterations</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 uppercase">Random Seed</label>
            <input
              type="number"
              value={seed}
              onChange={(e) => setSeed(Number(e.target.value))}
              disabled={loading}
              className="mt-1 w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <Button
            onClick={handleRun}
            isLoading={loading}
            leftIcon={<Play className="w-4 h-4 fill-white" />}
          >
            Execute Benchmark
          </Button>
        </div>

        {/* Results */}
        {result && (
          <div className="space-y-5 animate-in fade-in">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-xs text-slate-500 font-medium">Nodes</span>
                <p className="text-lg font-bold text-slate-900">{result.nodeCount}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-xs text-slate-500 font-medium">Edges</span>
                <p className="text-lg font-bold text-slate-900">{result.edgeCount}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-xs text-slate-500 font-medium">Iterations</span>
                <p className="text-lg font-bold text-slate-900">{result.iterations}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-xs text-slate-500 font-medium">Seed</span>
                <p className="text-lg font-bold text-slate-900">{result.seed}</p>
              </div>
            </div>

            {/* Recharts Comparison */}
            <div className="h-64 w-full bg-slate-50/50 p-3 rounded-xl border border-slate-200">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis yAxisId="left" tick={{ fontSize: 11 }} label={{ value: 'Time (ms)', angle: -90, position: 'insideLeft', fontSize: 10 }} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} label={{ value: 'Visited Nodes', angle: 90, position: 'insideRight', fontSize: 10 }} />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="Time (ms)" fill="#2563eb" radius={[4, 4, 0, 0]} />
                  <Bar yAxisId="right" dataKey="Visited Nodes" fill="#0d9488" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Table */}
            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="p-2.5">Algorithm</th>
                    <th className="p-2.5">Median Time</th>
                    <th className="p-2.5">Min / Max</th>
                    <th className="p-2.5">Visited Nodes</th>
                    <th className="p-2.5">Path Cost</th>
                    <th className="p-2.5">Complexity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {result.metrics.map((m) => (
                    <tr key={m.algorithm} className="hover:bg-slate-50/80">
                      <td className="p-2.5 font-semibold text-slate-900">{m.algorithm}</td>
                      <td className="p-2.5 font-mono text-brand-600 font-medium">{m.medianTimeMs} ms</td>
                      <td className="p-2.5 font-mono text-slate-500">{m.minTimeMs} / {m.maxTimeMs} ms</td>
                      <td className="p-2.5 font-mono">{m.medianVisitedNodes}</td>
                      <td className="p-2.5 font-mono">{m.pathDistanceKm} km</td>
                      <td className="p-2.5">
                        <Badge variant="slate" size="sm">{m.complexityOrder}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Explanatory notes */}
            <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-900 space-y-1.5">
              <div className="flex items-center gap-1.5 font-semibold">
                <Info className="w-4 h-4 text-blue-600" />
                <span>Methodology & Warmup</span>
              </div>
              <p className="leading-relaxed text-blue-800">{result.methodologyNotes}</p>
            </div>

            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-950 space-y-1.5">
              <div className="flex items-center gap-1.5 font-semibold text-amber-900">
                <AlertCircle className="w-4 h-4 text-amber-700" />
                <span>JVM Micro-Benchmarking Caveats</span>
              </div>
              <p className="leading-relaxed text-amber-900">{result.jvmLimitationsExplanation}</p>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
