import axios, { AxiosError } from 'axios';
import {
  LocationDto,
  CreateLocationRequest,
  UpdateLocationRequest,
  RoadDto,
  CreateRoadRequest,
  UpdateRoadRequest,
  ShortestRouteRequest,
  ShortestRouteResponse,
  MultiStopRouteRequest,
  MultiStopRouteResponse,
  RouteHistorySummaryDto,
  RouteHistoryDetailDto,
  DashboardSummaryDto,
  BenchmarkRunRequest,
  BenchmarkRunResponse,
  ApiErrorResponse,
} from './types';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export function extractErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const axiosErr = error as AxiosError<ApiErrorResponse>;
    if (axiosErr.response?.data?.message) {
      if (axiosErr.response.data.validationErrors) {
        const details = Object.entries(axiosErr.response.data.validationErrors)
          .map(([field, msg]) => `${field}: ${msg}`)
          .join(', ');
        return `${axiosErr.response.data.message} (${details})`;
      }
      return axiosErr.response.data.message;
    }
    if (axiosErr.message) {
      return axiosErr.message;
    }
  }
  return error instanceof Error ? error.message : 'An unknown network error occurred';
}

export const ApiClient = {
  // Health
  checkHealth: async () => {
    const res = await api.get('/health');
    return res.data;
  },

  // Dashboard
  getDashboard: async (): Promise<DashboardSummaryDto> => {
    const res = await api.get<DashboardSummaryDto>('/dashboard');
    return res.data;
  },

  // Locations
  getLocations: async (): Promise<LocationDto[]> => {
    const res = await api.get<LocationDto[]>('/locations');
    return res.data;
  },

  getLocationById: async (id: string): Promise<LocationDto> => {
    const res = await api.get<LocationDto>(`/locations/${id}`);
    return res.data;
  },

  createLocation: async (req: CreateLocationRequest): Promise<LocationDto> => {
    const res = await api.post<LocationDto>('/locations', req);
    return res.data;
  },

  updateLocation: async (id: string, req: UpdateLocationRequest): Promise<LocationDto> => {
    const res = await api.put<LocationDto>(`/locations/${id}`, req);
    return res.data;
  },

  deleteLocation: async (id: string): Promise<void> => {
    await api.delete(`/locations/${id}`);
  },

  // Roads
  getRoads: async (): Promise<RoadDto[]> => {
    const res = await api.get<RoadDto[]>('/roads');
    return res.data;
  },

  getRoadById: async (id: string): Promise<RoadDto> => {
    const res = await api.get<RoadDto>(`/roads/${id}`);
    return res.data;
  },

  createRoad: async (req: CreateRoadRequest): Promise<RoadDto> => {
    const res = await api.post<RoadDto>('/roads', req);
    return res.data;
  },

  updateRoad: async (id: string, req: UpdateRoadRequest): Promise<RoadDto> => {
    const res = await api.put<RoadDto>(`/roads/${id}`, req);
    return res.data;
  },

  deleteRoad: async (id: string): Promise<void> => {
    await api.delete(`/roads/${id}`);
  },

  // Routes
  calculateShortestRoute: async (req: ShortestRouteRequest): Promise<ShortestRouteResponse> => {
    const res = await api.post<ShortestRouteResponse>('/routes/shortest', req);
    return res.data;
  },

  calculateMultiStopRoute: async (req: MultiStopRouteRequest): Promise<MultiStopRouteResponse> => {
    const res = await api.post<MultiStopRouteResponse>('/routes/multi-stop', req);
    return res.data;
  },

  getRouteHistory: async (limit = 50): Promise<RouteHistorySummaryDto[]> => {
    const res = await api.get<RouteHistorySummaryDto[]>(`/routes/history?limit=${limit}`);
    return res.data;
  },

  getRouteHistoryById: async (id: string): Promise<RouteHistoryDetailDto> => {
    const res = await api.get<RouteHistoryDetailDto>(`/routes/history/${id}`);
    return res.data;
  },

  // Benchmarking
  runBenchmark: async (req: BenchmarkRunRequest): Promise<BenchmarkRunResponse> => {
    const res = await api.post<BenchmarkRunResponse>('/benchmarks/run', req);
    return res.data;
  },
};
