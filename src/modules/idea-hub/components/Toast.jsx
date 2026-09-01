import React from 'react';
import styles from '../styles/ideaHub.module.css';

export default function Toast({ message, type = 'success' }) {
  if (!message) return null;

  return (
    <div className={`${styles.toast} ${type === 'success' ? styles.toastSuccess : styles.toastError}`}>
      {message}
    </div>
  );
}
