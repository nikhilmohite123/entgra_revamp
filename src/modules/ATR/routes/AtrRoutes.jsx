import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import AtrDashboardPage from '../pages/AtrDashboardPage';
import AtrFormPage from '../pages/AtrFormPage';
import AtrChartsPage from '../pages/AtrChartsPage';
import AtrUploadCsvPage from '../pages/AtrUploadCsvPage';
import AtrExcelViewPage from '../pages/AtrExcelViewPage';

export default function AtrRoutes() {
  return (
    <Routes>
      <Route index element={<AtrDashboardPage />} />
      <Route path="dashboard" element={<AtrDashboardPage />} />
      <Route path="atr_dashboard" element={<AtrDashboardPage />} />
      <Route path="atrform" element={<AtrFormPage />} />
      <Route path="atr_form" element={<AtrFormPage />} />
      <Route path="form" element={<AtrFormPage />} />
      <Route path="trail" element={<AtrFormPage />} />
      <Route path="charts" element={<AtrChartsPage />} />
      <Route path="chart" element={<AtrChartsPage />} />
      <Route path="uploadCSVfile" element={<AtrUploadCsvPage />} />
      <Route path="uploadcsvfile" element={<AtrUploadCsvPage />} />
      <Route path="upload_csv" element={<AtrUploadCsvPage />} />
      <Route path="excel_view" element={<AtrExcelViewPage />} />
      <Route path="excel_download" element={<AtrExcelViewPage />} />
      <Route path="data_export" element={<AtrExcelViewPage />} />
      <Route path="*" element={<Navigate to="" replace />} />
    </Routes>
  );
}
