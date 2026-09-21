import React from 'react';

export function CniError({ message = "An error occurred in CNI." }) {
  return (
    <div className="cni-error" style={{ color: 'red', padding: '1rem', border: '1px solid red' }}>
      <h4>Error</h4>
      <p>{message}</p>
    </div>
  );
}
