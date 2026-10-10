import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { DashboardPage } from './pages/DashboardPage';
import { RoutePlannerPage } from './pages/RoutePlannerPage';
import { MultiStopPage } from './pages/MultiStopPage';
import { ComparisonPage } from './pages/ComparisonPage';
import { LocationsPage } from './pages/LocationsPage';
import { RoadsPage } from './pages/RoadsPage';
import { HistoryPage } from './pages/HistoryPage';
import { AboutPage } from './pages/AboutPage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="planner" element={<RoutePlannerPage />} />
          <Route path="multi-stop" element={<MultiStopPage />} />
          <Route path="comparison" element={<ComparisonPage />} />
          <Route path="locations" element={<LocationsPage />} />
          <Route path="roads" element={<RoadsPage />} />
          <Route path="history" element={<HistoryPage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
