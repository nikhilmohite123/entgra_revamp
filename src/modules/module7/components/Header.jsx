import React from 'react';

export default function Header() {
  return (
    <div className="glass-card animate-fade-in" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--text-primary)' }}>Notifications Management</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.25rem' }}>Overview, live monitoring logs, and resource tables.</p>
      </div>
      <span className="badge badge-success">System Online</span>
    </div>
  );
}
