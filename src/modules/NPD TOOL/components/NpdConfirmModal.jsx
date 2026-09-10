import React, { useEffect } from 'react';
import { AlertTriangle, Trash2, HelpCircle } from 'lucide-react';
import styles from '../styles/npdConfirmModal.module.css';

export default function NpdConfirmModal({
  isOpen,
  title = 'Confirmation',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'primary', // 'primary' | 'danger' | 'warning'
  onConfirm,
  onCancel,
  loading = false,
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !loading && isOpen) {
        onCancel();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, loading, onCancel]);

  if (!isOpen) return null;

  const renderIcon = () => {
    if (variant === 'danger') {
      return (
        <div className={`${styles.iconWrap} ${styles.iconDanger}`}>
          <Trash2 size={22} />
        </div>
      );
    }
    if (variant === 'warning') {
      return (
        <div className={`${styles.iconWrap} ${styles.iconWarning}`}>
          <AlertTriangle size={22} />
        </div>
      );
    }
    return (
      <div className={`${styles.iconWrap} ${styles.iconPrimary}`}>
        <HelpCircle size={22} />
      </div>
    );
  };

  const getConfirmBtnClass = () => {
    if (variant === 'danger') return styles.btnConfirmDanger;
    if (variant === 'warning') return styles.btnConfirmWarning;
    return styles.btnConfirmPrimary;
  };

  return (
    <div
      className={styles.modalOverlay}
      onClick={loading ? undefined : onCancel}
      role="dialog"
      aria-modal="true"
    >
      <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          {renderIcon()}
          <div className={styles.titleArea}>
            <h3 className={styles.modalTitle}>{title}</h3>
            <p className={styles.modalMessage}>{message}</p>
          </div>
        </div>
        <div className={styles.modalFooter}>
          <button
            type="button"
            className={styles.btnCancel}
            onClick={onCancel}
            disabled={loading}
          >
            {cancelText}
          </button>
          <button
            type="button"
            className={`${styles.btnConfirm} ${getConfirmBtnClass()}`}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Processing...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
