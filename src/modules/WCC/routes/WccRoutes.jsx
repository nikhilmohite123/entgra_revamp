import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { WccProvider } from '../context/WccContext';
import WccDashboardPage from '../pages/WccDashboardPage';
import WccAnalyticsDashboardPage from '../pages/WccAnalyticsDashboardPage';
import WccDataExportPage from '../pages/WccDataExportPage';
import WccFormPage from '../pages/WccFormPage';

export default function WccRoutes() {
  return (
    <WccProvider>
      <Routes>
        <Route index element={<WccDashboardPage />} />
        <Route path="list" element={<WccDashboardPage />} />
        <Route path="wcc_dash" element={<WccAnalyticsDashboardPage />} />
        <Route path="analytics" element={<WccAnalyticsDashboardPage />} />
        <Route path="dashboard" element={<WccAnalyticsDashboardPage />} />
        <Route path="wcc_data_export" element={<WccDataExportPage />} />
        <Route path="export" element={<WccDataExportPage />} />
        <Route path="new" element={<WccFormPage />} />
        <Route path="edit/:id" element={<WccFormPage />} />
        <Route path="view/:id" element={<WccFormPage />} />
        <Route path="*" element={<Navigate to="" replace />} />
      </Routes>
    </WccProvider>
  );
}
