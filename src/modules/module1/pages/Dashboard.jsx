import React from 'react';

export default function Dashboard() {
  return (
    <div className="glass-card animate-fade-in" style={{ padding: '2rem', textAlign: 'center' }}>
      <h2 style={{ color: 'var(--primary)', marginBottom: '1rem' }}>Analytics Dashboard</h2>
      <p style={{ color: 'var(--text-secondary)' }}>Welcome to the Analytics console. Telemetry records will load here.</p>
    </div>
  );
}
