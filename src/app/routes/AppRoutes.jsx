import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';

import MainLayout from '../../layouts/MainLayout';
import AuthLayout from '../../layouts/AuthLayout';
import Login from '../../pages/Login';
import Main from '../../pages/main';

// Import module routes
import { IdeahubRoutes } from '../../modules/idea-hub';
import {
  SamplePortalRoutes,
  SamplePortalProvider,
  SampleListPage,
  SamplePortalFormPage,
} from '../../modules/sample-portal';

// Protected Route checks localStorage validation
function  ProtectedRoute() {
  const uid = localStorage.getItem('uid');
  const authUser = localStorage.getItem('auth_user');

  if (!uid && !authUser) {
    return <Navigate to="/auth/login" replace />;
  }

  return <Outlet />;
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* Protected Routes Wrapper */}
      <Route element={<ProtectedRoute />}>
        {/* Main Grid Portal */}
        <Route path="/main" element={<Main />} />

        {/* Idea Hub Standalone Portal Routes */}
        <Route path="/idea_hub/*" element={<IdeahubRoutes />} />
       

        {/* Sample Portal Standalone Routes */}
        <Route
          path="/sample_list"
          element={
            <SamplePortalProvider>
              <SampleListPage />
            </SamplePortalProvider>
          }
        />
   
        <Route
          path="/sample_portal"
          element={
            <SamplePortalProvider>
              <SamplePortalFormPage />
            </SamplePortalProvider>
          }
        />
 
        <Route path="/sample-portal/*" element={<SamplePortalRoutes />} />

        {/* Main Layout Wrapping Modules */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Navigate to="/main" replace />} />
          <Route path="idea_hub/*" element={<IdeahubRoutes />} />
        </Route>
      </Route>

      {/* Authentication Layout Subviews */}
      <Route path="/auth" element={<AuthLayout />}>
        <Route index element={<Navigate to="/auth/login" replace />} />
        <Route path="login" element={<Login />} />
      </Route>

      {/* Fallback routing */}
      <Route path="*" element={<Navigate to="/main" replace />} />
    </Routes>
  );
}
