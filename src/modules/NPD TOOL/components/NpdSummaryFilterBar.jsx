import React from 'react';
import styles from '../styles/npdSummary.module.css';

const CATEGORIES = [
  { id: 'ALL', label: 'ALL', value: 'ALL' },
  { id: 'CAP', label: 'CAP', value: 'CAP' },
  { id: 'SHOULDER', label: 'SHOULDER', value: 'SHOULDER' },
  { id: 'SLEEVE', label: 'SLEEVE', value: 'SLEEVE' },
  { id: 'SHOULDERCAP', label: 'SHOULDER & CAP', value: 'SHOULDER & CAP' },
  { id: 'APPLICATORDISPENSER', label: 'APPLICATOR / DISPENSER', value: 'APPLICATOR / DISPENSER' },
  { id: 'PRINTINGDECORATION', label: 'PRINTING & DECORATION', value: 'PRINTING & DECORATION' },
  { id: 'SHOULDERAPPLICATORCAP', label: 'SHOULDER & APPLICATOR & CAP', value: 'SHOULDER & APPLICATOR & CAP' },
];

export default function NpdSummaryFilterBar({ selectedCategory, onSelectCategory }) {
  return (
    <div className="container p-0">
      <div className={styles.buttonWrapper}>
        {CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat.value;
          return (
            <button
              key={cat.id}
              type="button"
              id={cat.id}
              className={`${styles.filterBtn} ${isActive ? styles.filterActive : ''}`}
              onClick={() => onSelectCategory(cat.value)}
            >
              {cat.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
