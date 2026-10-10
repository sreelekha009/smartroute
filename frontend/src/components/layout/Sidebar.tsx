import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Route,
  Truck,
  GitCompare,
  MapPin,
  GitFork,
  History,
  BookOpen,
  Navigation2,
  Cpu,
} from 'lucide-react';

interface SidebarProps {
  onOpenBenchmark?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onOpenBenchmark }) => {
  const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/planner', label: 'Route Planner', icon: Route },
    { to: '/multi-stop', label: 'Multi-Stop Planner', icon: Truck },
    { to: '/comparison', label: 'Algorithm Comparison', icon: GitCompare },
    { to: '/locations', label: 'Locations', icon: MapPin },
    { to: '/roads', label: 'Roads Network', icon: GitFork },
    { to: '/history', label: 'Route History', icon: History },
    { to: '/about', label: 'About & DSA Guide', icon: BookOpen },
  ];

  return (
    <aside className="w-64 bg-navy-950 text-slate-300 flex flex-col shrink-0 border-r border-navy-850 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-navy-900 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-tealAccent-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
          <Navigation2 className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-white tracking-tight text-base">SmartRoute</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title="System Operational" />
          </div>
          <p className="text-[11px] text-slate-400 font-medium">Delivery Optimization</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          Operations
        </div>
        {navItems.slice(0, 4).map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-brand-600 text-white shadow-sm shadow-brand-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-navy-900'
              }`
            }
          >
            <item.icon className="w-4 h-4 shrink-0" />
            <span>{item.label}</span>
          </NavLink>
        ))}

        <div className="px-3 pt-4 pb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          Network Data
        </div>
        {navItems.slice(4).map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-brand-600 text-white shadow-sm shadow-brand-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-navy-900'
              }`
            }
          >
            <item.icon className="w-4 h-4 shrink-0" />
            <span>{item.label}</span>
          </NavLink>
        ))}

        {onOpenBenchmark && (
          <div className="pt-3">
            <button
              onClick={onOpenBenchmark}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-tealAccent-500 bg-tealAccent-500/10 hover:bg-tealAccent-500/20 border border-tealAccent-500/30 transition-all"
            >
              <Cpu className="w-4 h-4 shrink-0" />
              <span>Run Benchmarks Suite</span>
            </button>
          </div>
        )}
      </nav>

      {/* Tech Stack Footer */}
      <div className="p-4 border-t border-navy-900 bg-navy-950/80 text-[11px] text-slate-400 space-y-1">
        <div className="flex items-center justify-between text-slate-300 font-medium">
          <span>Engine Status</span>
          <span className="text-emerald-400">Active</span>
        </div>
        <p className="text-[10px] text-slate-400">Java 21 • Spring Boot 3 • React Flow</p>
      </div>
    </aside>
  );
};
