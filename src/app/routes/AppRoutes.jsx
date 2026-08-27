import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '../../layouts/MainLayout';
import AuthLayout from '../../layouts/AuthLayout';
import Login from '../../pages/Login';

// Import all module routes
import { Module1Routes } from '../../modules/module1';
import { Module2Routes } from '../../modules/module2';
import { Module3Routes } from '../../modules/module3';
import { Module4Routes } from '../../modules/module4';
import { Module5Routes } from '../../modules/module5';
import { Module6Routes } from '../../modules/module6';
import { Module7Routes } from '../../modules/module7';
import { Module8Routes } from '../../modules/module8';
import { Module9Routes } from '../../modules/module9';
import { Module10Routes } from '../../modules/module10';
import { Module11Routes } from '../../modules/module11';
import { Module12Routes } from '../../modules/module12';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Redirect root to module 1 dashboard */}
      <Route path="/" element={<Navigate to="/module1" replace />} />

      {/* Main Layout and Module Subviews */}
      <Route path="/" element={<MainLayout />}>
        <Route path="module1/*" element={<Module1Routes />} />
        <Route path="module2/*" element={<Module2Routes />} />
        <Route path="module3/*" element={<Module3Routes />} />
        <Route path="module4/*" element={<Module4Routes />} />
        <Route path="module5/*" element={<Module5Routes />} />
        <Route path="module6/*" element={<Module6Routes />} />
        <Route path="module7/*" element={<Module7Routes />} />
        <Route path="module8/*" element={<Module8Routes />} />
        <Route path="module9/*" element={<Module9Routes />} />
        <Route path="module10/*" element={<Module10Routes />} />
        <Route path="module11/*" element={<Module11Routes />} />
        <Route path="module12/*" element={<Module12Routes />} />
      </Route>

      {/* Authentication Layout Subviews */}
      <Route path="/auth" element={<AuthLayout />}>
        <Route index element={<Navigate to="/auth/login" replace />} />
        <Route path="login" element={<Login />} />
      </Route>

      {/* Fallback routing */}
      <Route path="*" element={<Navigate to="/module1" replace />} />
    </Routes>
  );
}
