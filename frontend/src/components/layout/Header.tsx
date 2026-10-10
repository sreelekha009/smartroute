import React from 'react';
import { Cpu, ShieldCheck, ExternalLink } from 'lucide-react';
import { Button } from '../common/Button';

interface HeaderProps {
  title: string;
  subtitle?: string;
  onOpenBenchmark?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ title, subtitle, onOpenBenchmark }) => {
  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0">
      <div>
        <h1 className="text-lg font-bold text-slate-900 tracking-tight">{title}</h1>
        {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs text-slate-600 font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Dublin Metro Grid (Synthetic)</span>
        </div>

        <a
          href="/swagger-ui.html"
          target="_blank"
          rel="noreferrer"
          className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors"
        >
          <span>Swagger API</span>
          <ExternalLink className="w-3 h-3 text-slate-400" />
        </a>

        {onOpenBenchmark && (
          <Button
            size="sm"
            variant="outline"
            leftIcon={<Cpu className="w-3.5 h-3.5 text-brand-600" />}
            onClick={onOpenBenchmark}
          >
            Benchmarks
          </Button>
        )}
      </div>
    </header>
  );
};
