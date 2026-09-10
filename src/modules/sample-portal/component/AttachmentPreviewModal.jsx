import React, { useEffect } from 'react';
import { Download } from 'lucide-react';
import styles from '../styles/SampleModals.module.css';
import { ENV } from '../../../config/env';

export default function AttachmentPreviewModal({ isOpen, onClose, filePath }) {
  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !filePath) return null;

  const path = filePath || '';
  const resolvedUrl = path.startsWith('http')
    ? path
    : `${ENV.API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
  const ext = (filePath.split('.').pop() || '').toLowerCase();
  const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'];
  const isImage = imageExts.includes(ext);
  const isPdf = ext === 'pdf';
  const fileName = filePath.split('/').pop() || 'attachment';

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={`${styles.modalContainer} ${styles.attachModal}`} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.modalHeader}>
          <div>
            <div className={styles.modalBadge}>Attachment Preview</div>
            <h2 className={styles.modalTitle}>
              {isImage ? 'Image Preview' : isPdf ? 'PDF Preview' : 'File Attachment'}
            </h2>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <a
              href={resolvedUrl}
              download={fileName}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.btnSave}
              style={{ fontSize: '12px', padding: '6px 14px', textDecoration: 'none' }}
            >
              <Download size={14} />
              <span>Download</span>
            </a>
            <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
              ×
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className={styles.attachBody}>
          {isImage ? (
            <img src={resolvedUrl} alt="Attachment Preview" className={styles.attachImg} />
          ) : isPdf ? (
            <iframe src={resolvedUrl} title="PDF Viewer" className={styles.attachFrame} />
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#475569' }}>
              <p style={{ fontSize: '15px', fontWeight: 600, marginBottom: '10px' }}>
                Preview not available for this file type (.{ext})
              </p>
              <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '20px' }}>
                Click below to download the file directly to your system.
              </p>
              <a
                href={resolvedUrl}
                download={fileName}
                className={styles.btnSave}
                style={{ display: 'inline-flex', textDecoration: 'none' }}
              >
                <Download size={16} />
                <span>Download {fileName}</span>
              </a>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={styles.modalFooter}>
          <button className={styles.btnCancel} onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
