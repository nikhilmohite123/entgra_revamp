import React from 'react';

export function CniEmptyState({ message = "No data available." }) {
  return (
    <div className="cni-empty-state" style={{ padding: '2rem', textAlign: 'center', color: 'gray' }}>
      <p>{message}</p>
    </div>
  );
}
