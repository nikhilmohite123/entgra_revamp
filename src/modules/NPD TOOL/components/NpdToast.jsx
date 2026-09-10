import React, { useState, useEffect, useCallback, useRef } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import styles from '../styles/npdToast.module.css';

// Global toast subscriber mechanism
let listeners = [];

function emitToast(toast) {
  listeners.forEach((listener) => listener(toast));
}

export const npdToast = {
  success: (message, options = {}) => {
    const opts = typeof options === 'number' ? { duration: options } : options;
    emitToast({
      id: Date.now() + Math.random().toString(36).substring(2, 7),
      type: 'success',
      title: opts.title || 'Success',
      message: String(message || ''),
      duration: opts.duration !== undefined ? opts.duration : 3500,
    });
  },
  error: (message, options = {}) => {
    const opts = typeof options === 'number' ? { duration: options } : options;
    emitToast({
      id: Date.now() + Math.random().toString(36).substring(2, 7),
      type: 'error',
      title: opts.title || 'Error',
      message: String(message || ''),
      duration: opts.duration !== undefined ? opts.duration : 4000,
    });
  },
  warning: (message, options = {}) => {
    const opts = typeof options === 'number' ? { duration: options } : options;
    emitToast({
      id: Date.now() + Math.random().toString(36).substring(2, 7),
      type: 'warning',
      title: opts.title || 'Notice',
      message: String(message || ''),
      duration: opts.duration !== undefined ? opts.duration : 3800,
    });
  },
  info: (message, options = {}) => {
    const opts = typeof options === 'number' ? { duration: options } : options;
    emitToast({
      id: Date.now() + Math.random().toString(36).substring(2, 7),
      type: 'info',
      title: opts.title || 'Info',
      message: String(message || ''),
      duration: opts.duration !== undefined ? opts.duration : 3500,
    });
  },
};

export function useNpdToast() {
  return npdToast;
}

function ToastItem({ toast, onDismiss }) {
  const [isClosing, setIsClosing] = useState(false);
  const timerRef = useRef(null);
  const remainingTimeRef = useRef(toast.duration);
  const startTimeRef = useRef(Date.now());

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      onDismiss(toast.id);
    }, 250);
  }, [onDismiss, toast.id]);

  const startTimer = useCallback(() => {
    if (toast.duration <= 0) return;
    startTimeRef.current = Date.now();
    timerRef.current = setTimeout(handleClose, remainingTimeRef.current);
  }, [handleClose, toast.duration]);

  const pauseTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
      const elapsed = Date.now() - startTimeRef.current;
      remainingTimeRef.current = Math.max(500, remainingTimeRef.current - elapsed);
    }
  }, []);

  useEffect(() => {
    startTimer();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [startTimer]);

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle2 size={18} strokeWidth={2.4} />;
      case 'error':
        return <AlertCircle size={18} strokeWidth={2.4} />;
      case 'warning':
        return <AlertTriangle size={18} strokeWidth={2.4} />;
      case 'info':
      default:
        return <Info size={18} strokeWidth={2.4} />;
    }
  };

  const getTypeClass = () => {
    switch (toast.type) {
      case 'success':
        return styles.toastSuccess;
      case 'error':
        return styles.toastError;
      case 'warning':
        return styles.toastWarning;
      case 'info':
      default:
        return styles.toastInfo;
    }
  };

  return (
    <div
      className={`${styles.toastItem} ${getTypeClass()} ${isClosing ? styles.closing : ''}`}
      onMouseEnter={pauseTimer}
      onMouseLeave={startTimer}
      role="alert"
    >
      <div className={styles.iconWrap}>{getIcon()}</div>
      <div className={styles.contentWrap}>
        {toast.title && <div className={styles.toastTitle}>{toast.title}</div>}
        <div className={styles.toastMessage}>{toast.message}</div>
      </div>
      <button
        className={styles.closeButton}
        onClick={handleClose}
        aria-label="Dismiss notification"
        type="button"
      >
        <X size={15} />
      </button>
    </div>
  );
}

export function NpdToastContainer() {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((newToast) => {
    setToasts((prev) => {
      // Deduplicate: avoid multiple identical toasts active simultaneously
      const isDuplicate = prev.some(
        (t) => t.message === newToast.message && t.type === newToast.type
      );
      if (isDuplicate) return prev;
      return [...prev, newToast];
    });
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    listeners.push(addToast);
    return () => {
      listeners = listeners.filter((l) => l !== addToast);
    };
  }, [addToast]);

  if (toasts.length === 0) return null;

  return (
    <div className={styles.toastContainer} aria-live="polite">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={removeToast} />
      ))}
    </div>
  );
}

export default npdToast;
