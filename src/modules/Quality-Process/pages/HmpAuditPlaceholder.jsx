import React from 'react';
import styles from '../styles/qualityProcess.module.css';

export default function HmpAuditPlaceholder() {
  return (
    <div className="page-container">
      <div className={`glass-card ${styles.placeholderCard}`}>
        <h2>HMP Audit Module</h2>
        <p className={`text-secondary ${styles.placeholderText}`}>Coming Soon...</p>
      </div>
    </div>
  );
}
