import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, UploadCloud, Save } from 'lucide-react';
import { useDashboardData } from '../../../hooks/useDashboardData';
import styles from '../../../styles/cni-premium.module.css';

const formSchema = z.object({
  s_struture_name: z.string().min(1, 'Required'),
  s_gsm: z.string().min(1, 'Required'),
  s_thikness: z.string().min(1, 'Required'),
  s_source_name: z.string().min(1, 'Required'),
  s_type: z.string().min(1, 'Required'),
  s_type_doc: z.string().min(1, 'Required'),
  
  s_optics: z.string().optional(),
  txt_apprnce: z.string().optional(),
  s_moisture: z.string().optional(),
  s_oxygen_barrier: z.string().optional(),
  s_sustanable_cert: z.string().optional(),
  s_mfg_status: z.string().optional(),
  n_attach_id: z.string().optional(),
});

export function DashboardForm({ editRecordId, onClose }) {
  const { uploadDocumentMutation, verifyMutation, editFileMutation } = useDashboardData();
  const [file1, setFile1] = useState(null);
  const [file2, setFile2] = useState(null);
  const [file3, setFile3] = useState(null);
  const [showAppearance, setShowAppearance] = useState(false);
  const [showSustFile, setShowSustFile] = useState(false);

  const { register, handleSubmit, reset, setValue, watch, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      s_struture_name: '', s_gsm: '', s_thikness: '', s_source_name: '', s_type: '',
      s_type_doc: '', s_optics: '', txt_apprnce: '', s_moisture: '', s_oxygen_barrier: '',
      s_sustanable_cert: '', s_mfg_status: '', n_attach_id: ''
    }
  });

  const opticsVal = watch('s_optics');
  const sustCertVal = watch('s_sustanable_cert');

  useEffect(() => {
    setShowAppearance(!!opticsVal);
  }, [opticsVal]);

  useEffect(() => {
    setShowSustFile(sustCertVal === 'Yes');
  }, [sustCertVal]);

  useEffect(() => {
    if (editRecordId) {
      editFileMutation.mutate(editRecordId, {
        onSuccess: (data) => {
          if (!data) return;
          setValue('n_attach_id', data.n_reg_attch_id?.toString() || '');
          setValue('s_struture_name', data.s_struture_name || '');
          setValue('s_gsm', data.s_gsm || '');
          setValue('s_thikness', data.s_thikness || '');
          setValue('s_source_name', data.s_source_name || '');
          setValue('s_type', data.s_type || '');
          setValue('s_type_doc', data.s_type_doc || '');
          setValue('s_optics', data.s_optics || '');
          setValue('txt_apprnce', data.s_txt_apprnce || '');
          setValue('s_mfg_status', data.s_mfg_status || '');
          setValue('s_sustanable_cert', data.s_sustanable_cert || '');
          
          const mSign = data.s_moisture_sign ? data.s_moisture_sign + '_' : '';
          const mNum = data.s_moisture || '';
          setValue('s_moisture', mSign + mNum);

          const oSign = data.s_oxygen_barrier_sign ? data.s_oxygen_barrier_sign + '_' : '';
          const oNum = data.s_oxygen_barrier || '';
          setValue('s_oxygen_barrier', oSign + oNum);
        }
      });
    }
  }, [editRecordId]);

  const onSubmit = (data) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      formData.append(key, data[key] || '');
    });
    
    formData.append('s_uid', localStorage.getItem('loginId') || '');

    if (file1) formData.append('s_file_1', file1);
    if (file2) formData.append('s_file_2', file2);
    if (file3) {
      Array.from(file3).forEach(f => {
        formData.append('s_file_3', f);
      });
    }

    uploadDocumentMutation.mutate(formData, {
      onSuccess: (resp) => {
        if (resp && resp.code) {
          alert(resp.result);
        } else {
          alert("Record saved successfully!");
          reset();
          setFile1(null);
          setFile2(null);
          setFile3(null);
          onClose();
        }
        verifyMutation.mutate();
      },
      onError: (err) => {
        alert("Upload failed! " + err.message);
        verifyMutation.mutate();
      }
    });
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>{editRecordId ? 'Edit Record' : 'Add New Record'}</h2>
          <button className={styles.btnAction} onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} encType="multipart/form-data" style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          <div className={styles.modalBody}>
            <div className={styles.gridForm}>
              
              {/* Left Column */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <input type="hidden" {...register('n_attach_id')} />
                
                <div>
                  <label className={styles.formLabel}>Structure Name <span style={{color: 'var(--danger)'}}>*</span></label>
                  <input type="text" className={styles.formControl} placeholder="Enter structure name" {...register('s_struture_name')} />
                  {errors.s_struture_name && <span style={{ color: 'var(--danger)', fontSize: '0.8rem' }}>{errors.s_struture_name.message}</span>}
                </div>

                <div>
                  <label className={styles.formLabel}>GSM <span style={{color: 'var(--danger)'}}>*</span></label>
                  <input type="text" className={styles.formControl} placeholder="e.g. 250" {...register('s_gsm')} />
                  {errors.s_gsm && <span style={{ color: 'var(--danger)', fontSize: '0.8rem' }}>{errors.s_gsm.message}</span>}
                </div>

                <div>
                  <label className={styles.formLabel}>Thickness (µ) <span style={{color: 'var(--danger)'}}>*</span></label>
                  <input type="text" className={styles.formControl} placeholder="Enter thickness" {...register('s_thikness')} />
                  {errors.s_thikness && <span style={{ color: 'var(--danger)', fontSize: '0.8rem' }}>{errors.s_thikness.message}</span>}
                </div>

                <div>
                  <label className={styles.formLabel}>Source Name <span style={{color: 'var(--danger)'}}>*</span></label>
                  <input type="text" className={styles.formControl} placeholder="Enter source" {...register('s_source_name')} />
                  {errors.s_source_name && <span style={{ color: 'var(--danger)', fontSize: '0.8rem' }}>{errors.s_source_name.message}</span>}
                </div>

                <div>
                  <label className={styles.formLabel}>Type <span style={{color: 'var(--danger)'}}>*</span></label>
                  <input type="text" className={styles.formControl} placeholder="e.g. ABL/PBL" {...register('s_type')} />
                  {errors.s_type && <span style={{ color: 'var(--danger)', fontSize: '0.8rem' }}>{errors.s_type.message}</span>}
                </div>

                <div>
                  <label className={styles.formLabel}>Module / Category <span style={{color: 'var(--danger)'}}>*</span></label>
                  <select className={styles.formControl} {...register('s_type_doc')}>
                    <option value="">Select Category</option>
                    <option value="REG">India Commercial Laminates</option>
                    <option value="SPL">Co-Ex tubes Wada</option>
                    <option value="CL">China Laminates</option>
                    <option value="NEL">Non-EPL Laminates</option>
                    <option value="CNI">CNI</option>
                    <option value="POLND">Poland</option>
                    <option value="assam">Assam</option>
                    <option value="Manpura">Co-Ex tubes Manpura</option>
                  </select>
                  {errors.s_type_doc && <span style={{ color: 'var(--danger)', fontSize: '0.8rem' }}>{errors.s_type_doc.message}</span>}
                </div>
              </div>

              {/* Right Column */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                
                <div>
                  <label className={styles.formLabel}>Appearance / Optics</label>
                  <select className={styles.formControl} {...register('s_optics')} style={{ marginBottom: showAppearance ? '0.5rem' : 0 }}>
                    <option value="">Select Optics</option>
                    <option value="White">White</option>
                    <option value="BSNPE">BSNPE</option>
                    <option value="BLACK">BLACK</option>
                    <option value="TRANSPARENT">TRANSPARENT</option>
                    <option value="METTALIC">METTALIC</option>
                  </select>
                  {showAppearance && <textarea className={styles.formControl} placeholder="Additional appearance details" rows={2} {...register('txt_apprnce')} />}
                </div>

                <div>
                  <label className={styles.formLabel}>H₂O barrier (Less than)</label>
                  <input type="text" className={styles.formControl} placeholder="e.g. <_1.3" {...register('s_moisture')} />
                </div>

                <div>
                  <label className={styles.formLabel}>O₂ barrier (Less than)</label>
                  <input type="text" className={styles.formControl} placeholder="e.g. <_1.3" {...register('s_oxygen_barrier')} />
                </div>

                <div>
                  <label className={styles.formLabel}>Sustainable Certification</label>
                  <select className={styles.formControl} {...register('s_sustanable_cert')} style={{ marginBottom: showSustFile ? '0.5rem' : 0 }}>
                    <option value="">Select</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                  {showSustFile && (
                    <div style={{ padding: '0.75rem', background: 'var(--bg-tertiary)', borderRadius: '8px', border: '1px dashed var(--border-glass)' }}>
                      <small style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 600 }}>Upload Certificate</small>
                      <input type="file" style={{ fontSize: '0.8rem' }} multiple onChange={e => setFile3(e.target.files)} />
                    </div>
                  )}
                </div>

                <div>
                  <label className={styles.formLabel}>Manufacturing Status</label>
                  <select className={styles.formControl} {...register('s_mfg_status')}>
                    <option value="">Select Status</option>
                    <option value="Running">Running</option>
                    <option value="On Hold / Revivable">On Hold / Revivable</option>
                    <option value="Blocked">Blocked</option>
                  </select>
                </div>

                {/* File Uploads */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '0.5rem' }}>
                  <div style={{ padding: '0.75rem', background: 'var(--bg-tertiary)', borderRadius: '8px', border: '1px dashed var(--border-glass)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.85rem' }}>
                      <UploadCloud size={16} /> TDS Document
                    </div>
                    <input type="file" style={{ fontSize: '0.75rem', width: '100%' }} accept=".xls,.xlsx,.csv,.pdf,.doc,.docx,.png,.jpeg" onChange={e => setFile1(e.target.files[0])} />
                  </div>
                  
                  <div style={{ padding: '0.75rem', background: 'var(--bg-tertiary)', borderRadius: '8px', border: '1px dashed var(--border-glass)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.85rem' }}>
                      <UploadCloud size={16} /> GHS SDS
                    </div>
                    <input type="file" style={{ fontSize: '0.75rem', width: '100%' }} accept=".xls,.xlsx,.csv,.pdf,.doc,.docx,.png,.jpeg" onChange={e => setFile2(e.target.files[0])} />
                  </div>
                </div>

              </div>
            </div>
          </div>
          
          <div className={styles.modalFooter}>
            <button type="button" className={styles.btnSecondary} onClick={onClose} disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" className={styles.btnPrimary} disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : (
                <><Save size={16} /> Save Record</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
