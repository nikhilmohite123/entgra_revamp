import React from 'react';
import { Outlet } from 'react-router-dom';

export default function AuthLayout() {
  return (
    <div className="auth-layout-container animate-fade-in" style={{ minHeight: '100vh', width: '100%', backgroundColor: 'var(--bg-primary)' }}>
      <Outlet />
    </div>
  );
}
