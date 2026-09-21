import React from 'react';

// Wrapper for the shared Loader if specific CNI styles/behavior is needed
export function CniLoader() {
  return (
    <div className="cni-loader-wrapper" style={{ padding: '2rem', textAlign: 'center' }}>
      Loading CNI Data...
    </div>
  );
}
