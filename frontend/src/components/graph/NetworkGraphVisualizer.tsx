import React, { useMemo } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  MiniMap,
  Node,
  Edge,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { LocationDto, RoadDto } from '../../api/types';
import { MapPin, Navigation, Warehouse, Store } from 'lucide-react';

interface NetworkGraphVisualizerProps {
  locations: LocationDto[];
  roads: RoadDto[];
  highlightedPathNodeIds?: string[];
  startNodeId?: string;
  targetNodeId?: string;
  height?: string | number;
  interactive?: boolean;
}

export const NetworkGraphVisualizer: React.FC<NetworkGraphVisualizerProps> = ({
  locations,
  roads,
  highlightedPathNodeIds = [],
  startNodeId,
  targetNodeId,
  height = 550,
  interactive = true,
}) => {
  // Convert lat/long to 2D canvas coordinates using Mercator-like planar bounding box
  const { nodes, edges } = useMemo(() => {
    if (!locations.length) {
      return { nodes: [], edges: [] };
    }

    let minLat = Infinity,
      maxLat = -Infinity,
      minLon = Infinity,
      maxLon = -Infinity;

    locations.forEach((loc) => {
      if (loc.latitude < minLat) minLat = loc.latitude;
      if (loc.latitude > maxLat) maxLat = loc.latitude;
      if (loc.longitude < minLon) minLon = loc.longitude;
      if (loc.longitude > maxLon) maxLon = loc.longitude;
    });

    const latSpan = Math.max(0.01, maxLat - minLat);
    const lonSpan = Math.max(0.01, maxLon - minLon);

    const canvasWidth = 850;
    const canvasHeight = 520;
    const padding = 70;

    const pathSet = new Set(highlightedPathNodeIds);

    // Build Nodes
    const flowNodes: Node[] = locations.map((loc) => {
      // Invert latitude because higher latitude is further north (top of canvas, y=0)
      const x = padding + ((loc.longitude - minLon) / lonSpan) * (canvasWidth - padding * 2);
      const y = padding + ((maxLat - loc.latitude) / latSpan) * (canvasHeight - padding * 2);

      const isStart = loc.id === startNodeId;
      const isTarget = loc.id === targetNodeId;
      const isPath = pathSet.has(loc.id);

      let borderClass = 'border-slate-300 bg-white text-slate-800 shadow-sm';
      let iconColor = 'text-slate-500';

      if (isStart) {
        borderClass = 'border-emerald-500 bg-emerald-50 text-emerald-950 ring-2 ring-emerald-400 font-bold shadow-md';
        iconColor = 'text-emerald-600';
      } else if (isTarget) {
        borderClass = 'border-rose-500 bg-rose-50 text-rose-950 ring-2 ring-rose-400 font-bold shadow-md';
        iconColor = 'text-rose-600';
      } else if (isPath) {
        borderClass = 'border-brand-500 bg-blue-50 text-brand-950 ring-2 ring-brand-300 font-semibold shadow-sm';
        iconColor = 'text-brand-600';
      }

      return {
        id: loc.id,
        position: { x, y },
        data: {
          label: (
            <div className={`px-2.5 py-1.5 rounded-lg border text-xs flex items-center gap-1.5 transition-all ${borderClass}`}>
              {isStart ? (
                <Warehouse className={`w-3.5 h-3.5 shrink-0 ${iconColor}`} />
              ) : isTarget ? (
                <Navigation className={`w-3.5 h-3.5 shrink-0 ${iconColor}`} />
              ) : isPath ? (
                <MapPin className={`w-3.5 h-3.5 shrink-0 ${iconColor}`} />
              ) : (
                <Store className={`w-3 h-3 shrink-0 ${iconColor}`} />
              )}
              <span className="truncate max-w-[130px]">{loc.name}</span>
            </div>
          ),
        },
        type: 'default',
      };
    });

    // Build Edges
    const flowEdges: Edge[] = [];
    const pathEdgesSet = new Set<string>();

    for (let i = 0; i < highlightedPathNodeIds.length - 1; i++) {
      const u = highlightedPathNodeIds[i];
      const v = highlightedPathNodeIds[i + 1];
      pathEdgesSet.add(`${u}->${v}`);
    }

    roads.forEach((road) => {
      const isForwardInPath = pathEdgesSet.has(`${road.sourceLocationId}->${road.destinationLocationId}`);
      const isReverseInPath = road.bidirectional && pathEdgesSet.has(`${road.destinationLocationId}->${road.sourceLocationId}`);
      const isHighlighted = isForwardInPath || isReverseInPath;

      flowEdges.push({
        id: road.id,
        source: road.sourceLocationId,
        target: road.destinationLocationId,
        label: `${road.distanceKm}km`,
        animated: isHighlighted,
        style: {
          stroke: isHighlighted ? '#2563eb' : '#cbd5e1',
          strokeWidth: isHighlighted ? 3.5 : 1.2,
        },
        labelStyle: {
          fontSize: 9,
          fill: isHighlighted ? '#1e3a8a' : '#64748b',
          fontWeight: isHighlighted ? 700 : 500,
        },
        labelBgStyle: {
          fill: '#ffffff',
          fillOpacity: 0.85,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: isHighlighted ? '#2563eb' : '#94a3b8',
          width: isHighlighted ? 16 : 10,
          height: isHighlighted ? 16 : 10,
        },
      });
    });

    return { nodes: flowNodes, edges: flowEdges };
  }, [locations, roads, highlightedPathNodeIds, startNodeId, targetNodeId]);

  return (
    <div
      style={{ height, width: '100%' }}
      className="rounded-xl border border-slate-200 bg-slate-50/50 overflow-hidden relative shadow-inner"
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        fitView
        nodesDraggable={interactive}
        nodesConnectable={false}
        elementsSelectable={interactive}
        minZoom={0.2}
        maxZoom={2.5}
      >
        <Background color="#cbd5e1" gap={16} size={1} />
        {interactive && <Controls className="bg-white border border-slate-200 rounded-lg shadow-sm" />}
        {interactive && (
          <MiniMap
            nodeColor={(n) => {
              if (n.id === startNodeId) return '#10b981';
              if (n.id === targetNodeId) return '#f43f5e';
              if (highlightedPathNodeIds.includes(n.id)) return '#3b82f6';
              return '#cbd5e1';
            }}
            className="border border-slate-200 rounded-lg bg-white/90"
          />
        )}
      </ReactFlow>

      {/* Legend Badge */}
      <div className="absolute top-3 right-3 z-10 bg-white/95 backdrop-blur-sm border border-slate-200 rounded-lg p-2.5 shadow-sm text-[11px] flex items-center gap-4 text-slate-600">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
          <span>Origin/Depot</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
          <span>Destination</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-1 bg-brand-600 inline-block rounded" />
          <span>Active Path</span>
        </div>
      </div>
    </div>
  );
};
