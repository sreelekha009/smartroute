import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import App from '../App';

// Mock ResizeObserver for React Flow and Recharts
globalThis.ResizeObserver = class {
  observe() { }
  unobserve() { }
  disconnect() { }
};

describe('App Layout and Navigation', () => {
  it('renders the SmartRoute brand and sidebar navigation items', async () => {
    render(<App />);

    expect(screen.getByText('SmartRoute')).toBeInTheDocument();
    expect(screen.getByText('Delivery Optimization')).toBeInTheDocument();
    expect(screen.getByText('Route Planner')).toBeInTheDocument();
    expect(screen.getByText('Multi-Stop Planner')).toBeInTheDocument();
    expect(screen.getByText('Algorithm Comparison')).toBeInTheDocument();
    expect(screen.getByText('About & DSA Guide')).toBeInTheDocument();
  });
});
