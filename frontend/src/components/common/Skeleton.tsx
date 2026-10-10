import React from 'react';

export const Skeleton: React.FC<{
  className?: string;
}> = ({ className = 'h-4 w-full' }) => {
  return <div className={`animate-pulse bg-slate-200 rounded ${className}`} />;
};

export const CardSkeleton: React.FC = () => {
  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-3">
      <Skeleton className="h-4 w-28" />
      <Skeleton className="h-8 w-20" />
      <Skeleton className="h-3 w-40" />
    </div>
  );
};
