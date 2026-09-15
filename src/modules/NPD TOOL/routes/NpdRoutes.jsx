import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import NpdGalleryPage from '../pages/NpdGalleryPage';
import NpdTrackPage from '../pages/NpdTrackPage';
import NpdSummaryPage from '../pages/NpdSummaryPage';
import NpdDashboardPage from '../pages/NpdDashboardPage';
import NpdMbrPage from '../pages/NpdMbrPage';
import NpdSettingPage from '../pages/NpdSettingPage';
import NpdSingleProjectPage from '../pages/NpdSingleProjectPage';
import NpdFormPage from '../pages/NpdFormPage';
import NpdRegionalAdminPage from '../pages/NpdRegionalAdminPage';

export default function NpdRoutes() {
  return (
    <Routes>
      <Route index element={<NpdGalleryPage />} />
      <Route path="gallery" element={<NpdGalleryPage />} />
      <Route path="npdtrack" element={<NpdTrackPage />} />
      <Route path="npdtrack_landing_page" element={<NpdGalleryPage />} />
      <Route path="npd_summary" element={<NpdSummaryPage />} />
      <Route path="npd_dashboard" element={<NpdDashboardPage />} />
      <Route path="mbr_dashboard" element={<NpdMbrPage />} />
      <Route path="npdtrack_setting" element={<NpdSettingPage />} />
      <Route path="npd_setting" element={<NpdSettingPage />} />
      <Route path="npd_regional_admin" element={<NpdRegionalAdminPage />} />
      <Route path="npd_reginal_admin_option" element={<NpdRegionalAdminPage />} />
      <Route path="regional_admin" element={<NpdRegionalAdminPage />} />
      <Route path="npdtrack_setting_regional" element={<NpdRegionalAdminPage />} />
      <Route path="npdsinglepageprojectview" element={<NpdSingleProjectPage />} />
      <Route path="single_project" element={<NpdSingleProjectPage />} />
      <Route path="add_npd_program" element={<NpdFormPage />} />
      <Route path="npd_form" element={<NpdFormPage />} />
      <Route path="*" element={<Navigate to="" replace />} />
    </Routes>
  );
}

