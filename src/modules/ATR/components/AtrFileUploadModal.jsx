import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { UploadCloud, X, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import styles from '../styles/atrFileUploadModal.module.css';
import atrToast from './AtrToast';

export default function AtrFileUploadModal({
  isOpen,
  onClose,
  onFileUploaded
}) {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Lock body scroll and handle Escape key
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !uploading) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose, uploading]);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  const handleRemoveFile = (indexToRemove) => {
    setSelectedFiles((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedFiles.length === 0) {
      atrToast.warning('Please choose at least one file to attach.');
      return;
    }

    setUploading(true);
    setTimeout(() => {
      const names = selectedFiles.map((f) => f.name).join(', ');
      onFileUploaded(names, selectedFiles);
      atrToast.success('File(s) attached successfully');
      setUploading(false);
      setSelectedFiles([]);
      onClose();
    }, 400);
  };

  const modalContent = (
    <div
      className={styles.modalOverlay}
      onClick={uploading ? undefined : onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="atr-upload-modal-title"
    >
      <div
        className={styles.modalDialog}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.modalHeader}>
          <div className={styles.modalHeaderLeft}>
            <div className={styles.headerIcon}>
              <UploadCloud size={22} />
            </div>
            <h3 id="atr-upload-modal-title" className={styles.modalTitle}>
              Upload Attachment
            </h3>
          </div>
          <button
            type="button"
            className={styles.modalCloseBtn}
            onClick={onClose}
            disabled={uploading}
            aria-label="Close Upload Modal"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={styles.modalBody}>
            <div
              className={styles.dropzone}
              onClick={() => fileInputRef.current && fileInputRef.current.click()}
            >
              <UploadCloud size={38} className={styles.uploadIcon} />
              <p className={styles.dropzoneText}>
                Click to browse and upload files
              </p>
              <p className={styles.dropzoneHint}>
                Supported formats: PDF, DOCX, XLSX, MSG, EML (Max 25MB)
              </p>
              <input
                ref={fileInputRef}
                type="file"
                name="Atr_file_id"
                id="Atr_file_id"
                className={styles.fileInputHidden}
                accept=".pdf,.docx,.xlsx,.msg,.eml"
                multiple
                onChange={handleFileChange}
              />
            </div>

            {selectedFiles.length > 0 && (
              <div className={styles.selectedList}>
                {selectedFiles.map((file, idx) => (
                  <div key={idx} className={styles.fileItem}>
                    <div className={styles.fileItemLeft}>
                      <FileText size={16} className={styles.fileIcon} />
                      <span>{file.name}</span>
                    </div>
                    <button
                      type="button"
                      className={styles.removeFileBtn}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveFile(idx);
                      }}
                      title="Remove file"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className={styles.modalFooter}>
            <button
              type="button"
              className={styles.btnSecondary}
              onClick={onClose}
              disabled={uploading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={styles.btnSubmit}
              disabled={uploading || selectedFiles.length === 0}
            >
              {uploading ? 'Attaching...' : 'Submit & Attach'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
