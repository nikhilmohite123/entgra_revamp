import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';

import MainLayout from '../../layouts/MainLayout';
import AuthLayout from '../../layouts/AuthLayout';
import Login from '../../pages/Login';
import Main from '../../pages/main';

// Import only existing module routes
import { Module1Routes } from '../../modules/module1';
import { IdeahubRoutes } from '../../modules/idea-hub';

// Protected Route checks localStorage validation
function ProtectedRoute() {
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
 
     

        {/* Main Layout Wrapping Modules */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Navigate to="/main" replace />} />
          <Route path="module1/*" element={<Module1Routes />} />
          {/* Future module subroutes can be nested here */}
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
