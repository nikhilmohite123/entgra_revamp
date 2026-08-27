import React from 'react';

export default function Loader({ message = 'Loading system resources...' }) {
  return (
    <div className="loader-container animate-fade-in">
      <div className="loader-spinner" style={{ width: '40px', height: '40px', borderWidth: '3.5px' }} />
      <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
        {message}
      </span>
    </div>
  );
}
