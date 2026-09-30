import React, { useState } from 'react';
import { X, Upload, Paperclip, FileText, CheckCircle2 } from 'lucide-react';
import styles from '../styles/WccModals.module.css';
import { BASE_URL } from '../constants/wccConstants';
import { useWcc } from '../context/useWcc';

export default function WccFileUploadModal({
  isOpen,
  onClose,
  fileType, // e.g. 'work_1_file', 'work_EPCG_file', 'sustainabilityAttachment', 'poAttachment'
  bindId,   // e.g. 'workcompletion_filename1', 'work_EPCG_filename1', etc.
  onUploadSuccess,
}) {
  const { uid, showToast } = useWcc();
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    if (selectedFiles.length === 0) {
      showToast('Please select at least one file to upload', 'error');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('s_uploaded_by', uid);
      formData.append('file_type', fileType || '');
      formData.append('fileid', bindId || '');
      formData.append('savein', 'TEMP');

      selectedFiles.forEach((file) => {
        formData.append('work_file1_s_mbd_file_id', file);
      });

      const response = await fetch(`${BASE_URL}/uploadWorkCompletion_in_temp`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed with status ' + response.status);
      }

      const result = await response.json();

      if (result && (result.message === 'Successfully uploaded' || result.data)) {
        showToast('File successfully uploaded!', 'success');
        if (onUploadSuccess) {
          onUploadSuccess(result.data || [], bindId, fileType);
        }
        onClose();
      } else {
        showToast(result?.mess || 'Error while uploading!', 'error');
      }
    } catch (err) {
      console.error('Error uploading file:', err);
      showToast('Upload error: ' + err.message, 'error');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>
            <Upload size={18} color="#062b67" />
            Upload Attachment
          </h3>
          <button onClick={onClose} className={styles.closeBtn} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleUpload}>
          <div className={styles.modalBody}>
            <label className={styles.uploadZone}>
              <Paperclip size={32} color="#062b67" />
              <div style={{ fontWeight: 600, color: '#062b67' }}>
                Click to browse or drag & drop files
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                Supported formats: .jpeg, .jpg, .png, .pdf, .doc
              </div>
              <input
                type="file"
                multiple
                accept=".jpeg,.jpg,.png,.pdf,.doc"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
            </label>

            {selectedFiles.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569' }}>
                  Selected Files ({selectedFiles.length}):
                </span>
                {selectedFiles.map((f, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '6px 10px',
                      background: '#f8fafc',
                      borderRadius: '6px',
                      border: '1px solid #e2e8f0',
                      fontSize: '0.8rem',
                    }}
                  >
                    <FileText size={14} color="#062b67" />
                    <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {f.name}
                    </span>
                    <span style={{ color: '#94a3b8', fontSize: '0.7rem' }}>
                      {(f.size / 1024).toFixed(1)} KB
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className={styles.modalFooter}>
            <button type="button" className={styles.closeBtn} onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading || selectedFiles.length === 0}
              className="btn btn-success"
              style={{
                backgroundColor: '#16a34a',
                color: '#ffffff',
                border: 'none',
                padding: '8px 18px',
                borderRadius: '6px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              {uploading ? 'Uploading...' : 'Submit Upload'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
