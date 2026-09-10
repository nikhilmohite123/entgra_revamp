import React, { useState, useEffect } from 'react';
import styles from '../styles/deleteModal.module.css';
import { BASE_URL } from '../constants/ideaHubConstants';

export default function DeleteModal({ isOpen, targetId, onClose, onSuccess, showToast }) {
  const [loading, setLoading] = useState(false);
  const baseUrl = BASE_URL;
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
    try {
      const res = await fetch(`${baseUrl}/api/innovations/removeData/${targetId}`, {
        method: 'POST'
      });
      const data = await res.json();
      if (data && data.success) {
        if (showToast) showToast('Entry deleted successfully.', 'success');
        onSuccess(targetId);
        onClose();
      } else {
        if (showToast) showToast(data?.message || 'Failed to delete entry.', 'error');
      }
    } catch {
      if (showToast) showToast('Failed to delete entry. Network error.', 'error');
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
