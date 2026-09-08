import React, { useState, useEffect } from 'react';
import styles from '../styles/IdeaHubModals.module.css';
import { ENV } from '../../../config/env';

export default function DeleteModal({ isOpen, targetId, onClose, onSuccess, showToast }) {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !loading) onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, loading, onClose]);

  if (!isOpen || !targetId) return null;

  const handleDelete = async () => {
    setLoading(true);
    const uid = localStorage.getItem('uid') || 'anonymous';
    try {
      const response = await fetch(`${ENV.API_BASE_URL}/api/innovations/innovations/${targetId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ uid }),
      });
      const data = await response.json();
      if (response.ok && data && data.success) {
        if (showToast) showToast('Entry deleted successfully.', 'success');
        onSuccess(targetId);
        onClose();
      } else {
        if (showToast) showToast(data?.message || 'Failed to delete entry.', 'error');
      }
    } catch (err) {
      if (showToast) showToast(err.message || 'Failed to delete entry. Network error.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={loading ? undefined : onClose}>
      <div className={styles.confirmModal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalIcon}>🗑</div>
        <h3>Delete Entry</h3>
        <p>Are you sure you want to delete this innovation entry? This action cannot be undone.</p>
        <div className={styles.confirmActions}>
          <button className={styles.btnCancel} onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button className={styles.btnDeleteConfirm} onClick={handleDelete} disabled={loading}>
            {loading ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}
