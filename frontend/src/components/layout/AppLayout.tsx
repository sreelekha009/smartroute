import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { ToastProvider } from '../common/Toast';
import { BenchmarkModal } from '../common/BenchmarkModal';

export const AppLayout: React.FC = () => {
  const [isBenchmarkOpen, setIsBenchmarkOpen] = useState(false);
  const location = useLocation();

  const getPageMeta = (pathname: string) => {
    switch (pathname) {
      case '/':
        return { title: 'Overview Dashboard', subtitle: 'Live logistics graph metrics and network activity' };
      case '/planner':
        return { title: 'Interactive Route Planner', subtitle: 'Point-to-point pathfinding across Dijkstra, A*, BFS, and DFS' };
      case '/multi-stop':
        return { title: 'Multi-Stop Delivery Planner', subtitle: 'Greedy Nearest-Neighbor TSP delivery itinerary optimization' };
      case '/comparison':
        return { title: 'Algorithm Comparison', subtitle: 'Side-by-side performance analysis between Dijkstra and A* Search' };
      case '/locations':
        return { title: 'Network Locations', subtitle: 'Management of distribution centers, hubs, and customer drop-offs' };
      case '/roads':
        return { title: 'Roads & Connections', subtitle: 'Directed and bidirectional road segments with distance weights' };
      case '/history':
        return { title: 'Route History', subtitle: 'Audited log of computed routes and execution diagnostics' };
      case '/about':
        return { title: 'About & DSA Guide', subtitle: 'In-depth CS analysis of graph algorithms, heuristics, and Big-O complexity' };
      default:
        return { title: 'SmartRoute Logistics', subtitle: 'Intelligent Route Planning & Delivery Optimisation' };
    }
  };

  const meta = getPageMeta(location.pathname);

  return (
    <ToastProvider>
      <div className="flex h-screen w-screen overflow-hidden bg-slate-50 font-sans">
        <Sidebar onOpenBenchmark={() => setIsBenchmarkOpen(true)} />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <Header
            title={meta.title}
            subtitle={meta.subtitle}
            onOpenBenchmark={() => setIsBenchmarkOpen(true)}
          />
          <main className="flex-1 overflow-y-auto p-6 bg-slate-50/80">
            <div className="max-w-7xl mx-auto">
              <Outlet />
            </div>
          </main>
        </div>

        <BenchmarkModal
          isOpen={isBenchmarkOpen}
          onClose={() => setIsBenchmarkOpen(false)}
        />
      </div>
    </ToastProvider>
  );
};
