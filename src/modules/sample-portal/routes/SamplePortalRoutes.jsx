import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { SamplePortalProvider } from '../context/SamplePortalContext';
import SampleListPage from '../pages/SampleListPage';
import SamplePortalFormPage from '../pages/SamplePortalFormPage';

export default function SamplePortalRoutes() {
  return (
    <SamplePortalProvider>
      <Routes>
        <Route index element={<Navigate to="list" replace />} />
        <Route path="list" element={<SampleListPage />} />
        <Route path="form" element={<SamplePortalFormPage />} />
        <Route path="*" element={<Navigate to="list" replace />} />
      </Routes>
    </SamplePortalProvider>
  );
}
