import React from 'react';
import styles from '../styles/WccDashboard.module.css';

export default function WccSummaryCards({ counts }) {
  if (!counts) return null;

  return (
    <div className={styles.summaryGrid}>
      <div className={`${styles.summaryCard} ${styles.completed}`}>
        <span className={styles.cardLabel}>Completed</span>
        <span className={styles.cardCount}>{counts.completed || 0}</span>
      </div>

      <div className={`${styles.summaryCard} ${styles.projectHead}`}>
        <span className={styles.cardLabel}>Project Head</span>
        <span className={styles.cardCount}>{counts.projectHead || 0}</span>
      </div>

      <div className={`${styles.summaryCard} ${styles.unitHead}`}>
        <span className={styles.cardLabel}>Unit Head</span>
        <span className={styles.cardCount}>{counts.unitHead || 0}</span>
      </div>

      <div className={`${styles.summaryCard} ${styles.capex}`}>
        <span className={styles.cardLabel}>Capex Controller</span>
        <span className={styles.cardCount}>{counts.capexController || 0}</span>
      </div>
    </div>
  );
}
