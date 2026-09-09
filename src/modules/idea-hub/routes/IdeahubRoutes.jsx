import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import LandingPage from '../pages/LandingPage';
import TablePage from '../pages/TablePage';
import FormPage from '../pages/FormPage';

export default function IdeahubRoutes() {
  return (
    <Routes>
      <Route index element={<LandingPage />} />

      <Route path="table/:moduleType" element={<TablePage />} />
      <Route path="form" element={<FormPage />} />
      <Route path="form/:moduleType" element={<FormPage />} />
      <Route path="*" element={<Navigate to="" replace />} />
    </Routes>
  );
}
