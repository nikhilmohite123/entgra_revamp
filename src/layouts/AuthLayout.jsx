import React from 'react';
import { Outlet } from 'react-router-dom';
import { Cpu } from 'lucide-react';

export default function AuthLayout() {
  return (
    <div className="auth-wrapper">
      {/* Left Banner Info (Visible on Desktop) */}
      <div className="auth-sidebar">
        <div className="auth-sidebar-glow"></div>
        
        <div className="sidebar-logo" style={{ fontSize: '1.75rem' }}>
          <div className="sidebar-logo-icon" style={{ width: '42px', height: '42px' }}>
            <Cpu size={22} />
          </div>
          <span>ETGRA</span>
        </div>

        <div style={{ zIndex: 10, marginTop: '4rem' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 700, lineHeight: 1.2, marginBottom: '1.5rem' }}>
            Secure Enterprise<br />Control Center
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.6, maxWidth: '400px' }}>
            Access all 12 modules, monitor system telemetry in real time, and manage administrative configurations instantly.
          </p>
        </div>

        <div style={{ zIndex: 10, color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          &copy; 2026 Antigravity IDE. All rights reserved.
        </div>
      </div>

      {/* Right Login / Register content */}
      <div className="auth-content">
        <div className="glow-bg-circle right" style={{ opacity: 0.1 }}></div>
        <Outlet />
      </div>
    </div>
  );
}
