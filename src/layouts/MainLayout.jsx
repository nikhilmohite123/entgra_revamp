import React, { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { 
  Menu, LayoutDashboard, Users, Settings, CreditCard, 
  Activity, BarChart3, Bell, Shield, Database, Cpu, Calendar, Code,
  LogOut, User as UserIcon
} from 'lucide-react';

const MODULES = [
  { id: 1, name: 'Analytics', path: '/module1', icon: LayoutDashboard },
  { id: 2, name: 'User Management', path: '/module2', icon: Users },
  { id: 3, name: 'System Settings', path: '/module3', icon: Settings },
  { id: 4, name: 'Billing', path: '/module4', icon: CreditCard },
  { id: 5, name: 'Activity Log', path: '/module5', icon: Activity },
  { id: 6, name: 'Report Center', path: '/module6', icon: BarChart3 },
  { id: 7, name: 'Notifications', path: '/module7', icon: Bell },
  { id: 8, name: 'Security Control', path: '/module8', icon: Shield },
  { id: 9, name: 'Database Monitor', path: '/module9', icon: Database },
  { id: 10, name: 'Integrations', path: '/module10', icon: Cpu },
  { id: 11, name: 'Task Scheduler', path: '/module11', icon: Calendar },
  { id: 12, name: 'Dev Console', path: '/module12', icon: Code },
];

export default function MainLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  // Find active module name
  const activeModule = MODULES.find(m => location.pathname.startsWith(m.path)) || { name: 'Dashboard' };

  return (
    <div className="layout-wrapper">
      {/* Visual background glows */}
      <div className="glow-bg-circle right"></div>
      <div className="glow-bg-circle left"></div>

      {/* Sidebar navigation */}
      <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <div className="sidebar-logo-icon">
              <Cpu size={18} />
            </div>
            {!collapsed && <span className="sidebar-link-text">ETGRA Console</span>}
          </div>
          <button className="sidebar-toggle" onClick={() => setCollapsed(!collapsed)}>
            <Menu size={18} />
          </button>
        </div>

        <ul className="sidebar-menu">
          <li className="sidebar-menu-title">
            {collapsed ? 'MODs' : 'Modules (1-12)'}
          </li>
          
          {MODULES.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.id} className="sidebar-item">
                <NavLink
                  to={item.path}
                  className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                  title={item.name}
                >
                  <Icon size={18} />
                  <span className="sidebar-link-text">{item.name}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>

        {/* Sidebar Footer */}
        <div className="sidebar-header" style={{ borderTop: '1px solid var(--border-glass)', borderBottom: 'none' }}>
          <NavLink to="/auth/login" className="sidebar-link" style={{ width: '100%' }}>
            <LogOut size={18} style={{ color: 'var(--danger)' }} />
            {!collapsed && <span className="sidebar-link-text" style={{ color: 'var(--danger)' }}>Sign Out</span>}
          </NavLink>
        </div>
      </aside>

      {/* Main viewport */}
      <main className={`main-content ${collapsed ? 'expanded' : ''}`}>
        {/* Top Navbar */}
        <header className="top-nav">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button 
              className="header-toggle-btn" 
              onClick={() => setCollapsed(!collapsed)}
              title="Toggle Sidebar"
            >
              <Menu size={18} />
            </button>
            <h1 className="nav-title">{activeModule.name} Module</h1>
          </div>
          
          <div className="nav-actions">
            <div className="user-profile">
              <div className="user-avatar">AG</div>
              <div className="user-info">
                <span className="user-name">Antigravity User</span>
                <span className="user-role">Administrator</span>
              </div>
            </div>
          </div>
        </header>

        {/* Content Outlet */}
        <div className="page-container animate-fade-in">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
