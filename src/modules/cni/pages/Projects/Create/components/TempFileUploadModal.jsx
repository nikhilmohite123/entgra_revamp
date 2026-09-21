import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../../../../services/api';
import { useTempFiles } from '../../../../hooks/useTempFiles';
import { X, UploadCloud } from 'lucide-react';
import styles from '../../../../styles/cni-premium.module.css';

export default function TempFileUploadModal({ 
  onClose, 
  stageId = 'S1', 
  projectId, 
  fileFieldName = 'refrenceFile', 
  endpoint = '/uploadStages_in_temp1',
  onSuccess 
}) {
  const { uploadFile, isUploading } = useTempFiles();
  const queryClient = useQueryClient();
  const [file, setFile] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const uid = localStorage.getItem('loginId') || '';

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!file) {
      alert("Please select a file.");
      return;
    }

    if (file.size > 10000000) {
      alert("Maximum file size should be 10 MB.");
      setFile(null);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('uid', uid);
      formData.append('stageid', stageId);
      if (projectId) {
        formData.append('pid', projectId);
      }
      formData.append(fileFieldName, file);

      await apiClient.post(endpoint, formData, { headers: { 'Content-Type': 'multipart/form-data' } });

      alert('File uploaded successfully');
      
      // Invalidate the query to fetch the updated list
      queryClient.invalidateQueries({ queryKey: ['tempFiles', uid] });
      
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error("Upload error:", err);
      setErrorMsg("An unexpected error occurred. Please try again.");
    }
  };

  return (
    <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
      <div className={styles.modalHeader}>
        <h2 className={styles.modalTitle}>Upload Reference File</h2>
        <button className={styles.btnAction} onClick={onClose}>
          <X size={24} />
        </button>
      </div>

      <form onSubmit={handleSubmit} encType="multipart/form-data" style={{ display: 'flex', flexDirection: 'column' }}>
        <div className={styles.modalBody}>
          {errorMsg && <div style={{ color: 'var(--danger)', marginBottom: '1rem', padding: '0.75rem', background: 'rgba(255,0,0,0.1)', borderRadius: '8px' }}>{errorMsg}</div>}
          
          <div style={{ padding: '2rem', background: 'var(--bg-tertiary)', borderRadius: '12px', border: '2px dashed var(--border-glass)', textAlign: 'center' }}>
            <UploadCloud size={48} style={{ color: 'var(--primary)', marginBottom: '1rem' }} />
            <h4 style={{ margin: '0 0 0.5rem 0' }}>Select file to upload</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>Max file size: 10MB</p>
            <input 
              name={fileFieldName} 
              id="refrnce" 
              type="file"
              required 
              accept=".xls, .xlsx, .csv, .pdf, .doc, .docx, .png, .jpeg" 
              onChange={handleFileChange}
              className={styles.formControl}
            />
          </div>
        </div>
        
        <div className={styles.modalFooter}>
          <button 
            type="button" 
            className={styles.btnSecondary}
            onClick={onClose}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className={styles.btnPrimary} 
            disabled={isUploading}
          >
            {isUploading ? 'Uploading...' : 'Submit File'}
          </button>
        </div>
      </form>
    </div>
  );
}
