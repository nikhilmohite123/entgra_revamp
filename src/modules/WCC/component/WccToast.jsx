import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import styles from '../styles/WccToast.module.css';

export default function WccToast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle2 size={20} color="#38a169" />;
      case 'error':
        return <AlertCircle size={20} color="#e53e3e" />;
      case 'warning':
        return <AlertCircle size={20} color="#d69e2e" />;
      case 'info':
      default:
        return <Info size={20} color="#3182ce" />;
    }
  };

  return (
    <div className={styles.toastContainer}>
      <div className={`${styles.toast} ${styles[toast.type || 'info']}`}>
        <div className={styles.toastContent}>
          {getIcon()}
          <span>{toast.message}</span>
        </div>
        <button onClick={onClose} className={styles.closeBtn} aria-label="Close notification">
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
