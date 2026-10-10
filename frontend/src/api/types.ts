// API Types for SmartRoute

export interface LocationDto {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  description?: string | null;
  createdAt?: string;
}

export interface CreateLocationRequest {
  name: string;
  latitude: number;
  longitude: number;
  description?: string;
}

export interface UpdateLocationRequest {
  name: string;
  latitude: number;
  longitude: number;
  description?: string;
}

export interface RoadDto {
  id: string;
  sourceLocationId: string;
  sourceLocationName: string;
  destinationLocationId: string;
  destinationLocationName: string;
  distanceKm: number;
  durationMinutes?: number | null;
  bidirectional: boolean;
  createdAt?: string;
}

export interface CreateRoadRequest {
  sourceLocationId: string;
  destinationLocationId: string;
  distanceKm: number;
  durationMinutes?: number;
  bidirectional: boolean;
}

export interface UpdateRoadRequest {
  distanceKm: number;
  durationMinutes?: number;
  bidirectional: boolean;
}

export type AlgorithmType = 'DIJKSTRA' | 'ASTAR' | 'BFS' | 'DFS';

export interface ShortestRouteRequest {
  startLocationId: string;
  targetLocationId: string;
  algorithm: AlgorithmType;
}

export interface ShortestRouteResponse {
  algorithm: string;
  pathFound: boolean;
  pathLocations: LocationDto[];
  totalDistanceKm: number;
  estimatedDurationMinutes?: number | null;
  visitedNodeCount: number;
  executionTimeMs: number;
  notes: string;
  historyId?: string;
}

export interface MultiStopRouteRequest {
  depotLocationId: string;
  destinationLocationIds: string[];
  returnToDepot: boolean;
}

export interface MultiStopLegDto {
  legIndex: number;
  from: LocationDto;
  to: LocationDto;
  distanceKm: number;
  pathLocations: LocationDto[];
}

export interface MultiStopRouteResponse {
  depot: LocationDto;
  orderedStops: LocationDto[];
  fullPathLocations: LocationDto[];
  totalDistanceKm: number;
  estimatedDurationMinutes?: number | null;
  legs: MultiStopLegDto[];
  totalVisitedNodes: number;
  executionTimeMs: number;
  returnedToDepot: boolean;
  notes: string;
  historyId?: string;
}

export interface RouteHistorySummaryDto {
  id: string;
  algorithm: string;
  sourceName: string;
  destinationName: string;
  totalDistanceKm: number;
  nodeCount: number;
  executionTimeMs: number;
  createdAt: string;
}

export interface RouteHistoryDetailDto {
  id: string;
  algorithm: string;
  sourceName: string;
  destinationName: string;
  totalDistanceKm: number;
  nodeCount: number;
  pathJson: string;
  executionTimeMs: number;
  createdAt: string;
}

export interface DashboardSummaryDto {
  totalLocations: number;
  totalRoads: number;
  totalRoutesCalculated: number;
  lastCalculatedRouteDistanceKm: number;
  recentRoutes: RouteHistorySummaryDto[];
  algorithmUsageStats: Record<string, number>;
  networkPreviewNodes: LocationDto[];
  networkPreviewRoads: RoadDto[];
}

export interface BenchmarkRunRequest {
  nodeCount: number;
  iterations: number;
  seed?: number;
}

export interface AlgorithmMetric {
  algorithm: string;
  medianTimeMs: number;
  minTimeMs: number;
  maxTimeMs: number;
  medianVisitedNodes: number;
  pathDistanceKm: number;
  pathFound: boolean;
  complexityOrder: string;
}

export interface BenchmarkRunResponse {
  nodeCount: number;
  edgeCount: number;
  iterations: number;
  seed: number;
  metrics: AlgorithmMetric[];
  methodologyNotes: string;
  jvmLimitationsExplanation: string;
}

export interface ApiErrorResponse {
  status: number;
  error: string;
  message: string;
  path: string;
  timestamp: string;
  validationErrors?: Record<string, string>;
}
