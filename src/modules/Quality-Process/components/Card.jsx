import React from 'react';
import styles from '../styles/Card.module.css';

export default function Card({ title, description, icon: Icon, onClick }) {
  return (
    <div 
      className={`glass-card ${styles.card}`} 
      onClick={onClick}
    >
      <div className={styles.header}>
        {Icon && (
          <div className="stat-icon">
            <Icon size={24} />
          </div>
        )}
        <h3 className={`stat-value ${styles.title}`}>{title}</h3>
      </div>
      <p className={`text-secondary ${styles.description}`}>
        {description}
      </p>
    </div>
  );
}
