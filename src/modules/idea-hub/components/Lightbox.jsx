import React, { useEffect } from 'react';
import styles from '../styles/ideaHub.module.css';

export default function Lightbox({ src, onClose }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!src) return null;

  return (
    <div className={styles.lightbox} onClick={onClose}>
      <div className={styles.lightboxInner} onClick={(e) => e.stopPropagation()}>
        <button className={styles.lightboxClose} onClick={onClose} aria-label="Close Lightbox">
          ×
        </button>
        <img src={src} alt="Preview" />
      </div>
    </div>
  );
}
