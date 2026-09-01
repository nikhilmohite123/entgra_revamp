import React from 'react';

export default function Details() {
  return (
    <div className="glass-card animate-fade-in" style={{ padding: '2rem', textAlign: 'center' }}>
      <h2 style={{ color: 'var(--primary)', marginBottom: '1rem' }}>Detailed Telemetry</h2>
      <p style={{ color: 'var(--text-secondary)' }}>Historic system checksum logs and access profiles are available here.</p>
    </div>
  );
}
