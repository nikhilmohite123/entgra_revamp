import React from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import styles from '../styles/Toast.module.css';

export default function Toast({ message, type = 'success' }) {
  if (!message) return null;

  return (
    <div className={styles.toastContainer}>
      <div
        className={`${styles.toast} ${
          type === 'error' ? styles.toastError : styles.toastSuccess
        }`}
      >
        {type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
        <span>{message}</span>
      </div>
    </div>
  );
}
