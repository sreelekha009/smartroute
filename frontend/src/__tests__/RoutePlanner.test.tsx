import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RoutePlannerPage } from '../pages/RoutePlannerPage';
import { ToastProvider } from '../components/common/Toast';
import { ApiClient } from '../api/client';
import '@testing-library/jest-dom/vitest';

// Mock ResizeObserver
globalThis.ResizeObserver = class {
  observe() { }
  unobserve() { }
  disconnect() { }
};

vi.mock('../api/client', () => ({
  ApiClient: {
    getLocations: vi.fn(),
    getRoads: vi.fn(),
    calculateShortestRoute: vi.fn(),
  },
  extractErrorMessage: vi.fn((err: any) => err?.message || 'Error occurred'),
}));

describe('RoutePlannerPage', () => {
  const mockLocations = [
    { id: 'loc-1', name: 'Dublin Port', latitude: 53.35, longitude: -6.20, description: 'Port' },
    { id: 'loc-2', name: 'Airport Cargo', latitude: 53.42, longitude: -6.25, description: 'Airport' },
  ];

  const mockRoads = [
    {
      id: 'road-1',
      sourceLocationId: 'loc-1',
      sourceLocationName: 'Dublin Port',
      destinationLocationId: 'loc-2',
      destinationLocationName: 'Airport Cargo',
      distanceKm: 10.5,
      durationMinutes: 12.0,
      bidirectional: true,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    (ApiClient.getLocations as any).mockResolvedValue(mockLocations);
    (ApiClient.getRoads as any).mockResolvedValue(mockRoads);
  });

  it('renders route configuration controls and loads locations', async () => {
    render(
      <ToastProvider>
        <RoutePlannerPage />
      </ToastProvider>
    );

    expect(screen.getByText('Configure Route Parameters')).toBeInTheDocument();

    await waitFor(() => {
      expect(ApiClient.getLocations).toHaveBeenCalled();
      expect(ApiClient.getRoads).toHaveBeenCalled();
    });
  });

  it('triggers route calculation and displays diagnostics upon success', async () => {
    (ApiClient.calculateShortestRoute as any).mockResolvedValue({
      algorithm: 'Dijkstra',
      pathFound: true,
      pathLocations: mockLocations,
      totalDistanceKm: 10.5,
      estimatedDurationMinutes: 15.0,
      visitedNodeCount: 2,
      executionTimeMs: 0.45,
      notes: 'Optimal path found',
    });

    render(
      <ToastProvider>
        <RoutePlannerPage />
      </ToastProvider>
    );

    const startSelect = (await screen.findByLabelText(/starting location/i)) as HTMLSelectElement;
    const destSelect = (await screen.findByLabelText(/destination/i)) as HTMLSelectElement;

    await waitFor(() => {
      expect(startSelect.value).toBe('loc-1');
      expect(destSelect.value).toBe('loc-2');
    });

    const calcButton = screen.getByRole('button', { name: /calculate route/i });
    fireEvent.click(calcButton);

    expect(await screen.findByText('10.5 km')).toBeInTheDocument();
    expect(await screen.findByText('15 mins')).toBeInTheDocument();
    expect(await screen.findByText('Optimal Route Sequence')).toBeInTheDocument();
  });

  it('displays error banner when destination is unreachable', async () => {
    (ApiClient.calculateShortestRoute as any).mockRejectedValue(
      new Error('No route exists to destination')
    );

    render(
      <ToastProvider>
        <RoutePlannerPage />
      </ToastProvider>
    );

    const startSelect = (await screen.findByLabelText(/starting location/i)) as HTMLSelectElement;
    const destSelect = (await screen.findByLabelText(/destination/i)) as HTMLSelectElement;

    await waitFor(() => {
      expect(startSelect.value).toBe('loc-1');
      expect(destSelect.value).toBe('loc-2');
    });

    const calcButton = screen.getByRole('button', { name: /calculate route/i });
    fireEvent.click(calcButton);

    expect(await screen.findByText('Route Calculation Error')).toBeInTheDocument();
    expect((await screen.findAllByText('No route exists to destination')).length).toBeGreaterThan(0);
  });
});
