import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useLabOSApprovers, useLabOSMutations } from '../../../hooks/useLabOS';
import cniStyles from '../../../styles/cni-premium.module.css';

const childSchema = z.object({
  s_lab_sample_id: z.string().min(1, 'Required').max(50, 'Max 50 characters'),
  d_dop: z.string().min(1, 'Required').max(10, 'Max 10 characters'),
  s_sample_desc_lab_sample: z.string().min(1, 'Required').max(400, 'Max 400 characters'),
  approver: z.string().min(1, 'Required'),
});

import { FlaskConical, Edit3 } from 'lucide-react';

export function LabOSChildForm({ matId, lpId, matCode, defaultValues, onCancelEdit }) {
  const { saveMatChildMutation, updateMatChildMutation } = useLabOSMutations();
  const { data: approversResp, isLoading: approversLoading } = useLabOSApprovers();
  
  const isEditing = !!lpId;

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm({
    resolver: zodResolver(childSchema),
    defaultValues: defaultValues || {
      s_lab_sample_id: '',
      d_dop: '',
      s_sample_desc_lab_sample: '',
      approver: '',
    }
  });

  useEffect(() => {
    if (defaultValues) {
      reset(defaultValues);
    }
  }, [defaultValues, reset]);

  const onSubmit = async (data) => {
    if (!window.confirm(`Do you want to ${isEditing ? 'Update' : 'Add'} ? `)) {
      return;
    }

    const payload = {
      n_lp_id: isEditing ? lpId : '',
      s_lab_sample_id: data.s_lab_sample_id,
      d_dop: data.d_dop,
      s_sample_desc_lab_sample: data.s_sample_desc_lab_sample,
      s_mat_code: matId, // Legacy mapping uses matId here for save_mat_child
      approver: data.approver,
      s_created_by: localStorage.getItem('loginId') || localStorage.getItem('uid') || '',
    };

    try {
      if (isEditing) {
        await updateMatChildMutation.mutateAsync(payload);
        alert("Record updated Successfully.");
        if (onCancelEdit) onCancelEdit();
      } else {
        const result = await saveMatChildMutation.mutateAsync(payload);
        if (result?.data?.res === "DUPLICATE") {
          alert(`${data.s_lab_sample_id} Duplicate Lab id.`);
        } else {
          alert(`${data.s_lab_sample_id} : Inserted.`);
          reset({
            ...data,
            s_lab_sample_id: '',
            d_dop: '',
            s_sample_desc_lab_sample: '',
          });
        }
      }
    } catch (error) {
      alert("An error occurred while saving.");
    }
  };

  const onReset = () => {
    reset();
    if (isEditing && onCancelEdit) {
      onCancelEdit();
    }
  };

  return (
    <div className={cniStyles.dashboardCard} style={{ marginBottom: '2rem', border: 'none', boxShadow: '0 8px 30px rgba(6, 43, 103, 0.08)' }}>
      <div 
        className={cniStyles.cardHeader} 
        style={{ 
          background: 'linear-gradient(135deg, var(--primary) 0%, #0a3a8a 100%)', 
          color: 'white', 
          borderRadius: '12px 12px 0 0',
          padding: '1.5rem 2rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          borderBottom: 'none'
        }}
      >
        <div style={{ background: 'rgba(255,255,255,0.1)', padding: '0.75rem', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {isEditing ? <Edit3 size={24} color="white" /> : <FlaskConical size={24} color="white" />}
        </div>
        <div>
          <h3 className={cniStyles.cardTitle} style={{ color: 'white', fontSize: '1.4rem', marginBottom: '0.2rem' }}>
            {isEditing ? 'Edit Lab Report' : 'New Lab Report (Sample)'}
          </h3>
          <p style={{ margin: 0, color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>
            {isEditing ? 'Modify the details of this existing Lab Sample.' : 'Add a Lab Sample ID to start the Testing process.'}
          </p>
        </div>
      </div>
      <div className={cniStyles.cardBody} style={{ padding: '2rem' }}>
        
        <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'grid', gap: '1.5rem', maxWidth: '700px' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label className={cniStyles.formLabel}>Lab Sample ID</label>
              <input type="text" className={cniStyles.formControl} placeholder="Identification Number" {...register('s_lab_sample_id')} />
              {errors.s_lab_sample_id && <span style={{ color: 'var(--danger)', fontSize: '0.85rem' }}>{errors.s_lab_sample_id.message}</span>}
            </div>

            <div>
              <label className={cniStyles.formLabel}>DOP (Date of Procurement)</label>
              <input type="date" className={cniStyles.formControl} {...register('d_dop')} />
              {errors.d_dop && <span style={{ color: 'var(--danger)', fontSize: '0.85rem' }}>{errors.d_dop.message}</span>}
            </div>
          </div>

          <div>
            <label className={cniStyles.formLabel}>Description</label>
            <textarea className={cniStyles.formControl} rows="3" placeholder="Enter detailed description" {...register('s_sample_desc_lab_sample')}></textarea>
            {errors.s_sample_desc_lab_sample && <span style={{ color: 'var(--danger)', fontSize: '0.85rem' }}>{errors.s_sample_desc_lab_sample.message}</span>}
          </div>

          <div>
            <label className={cniStyles.formLabel}>Approver Name</label>
            <select className={cniStyles.formControl} {...register('approver')} disabled={approversLoading}>
              <option value="">Select Approver</option>
              {approversResp?.data?.map((user) => (
                <option key={user.s_login_id} value={user.s_login_id}>{user.s_login_id}</option>
              ))}
            </select>
            {errors.approver && <span style={{ color: 'var(--danger)', fontSize: '0.85rem' }}>{errors.approver.message}</span>}
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
            <button type="submit" className={cniStyles.btnPrimary} disabled={isSubmitting}>
              {isSubmitting ? 'Processing...' : (isEditing ? 'Update Report' : 'Add Report')}
            </button>
            <button type="button" className={cniStyles.btnSecondary} onClick={onReset}>
              {isEditing ? 'Cancel Edit' : 'Reset Form'}
            </button>
            <button type="button" className={cniStyles.btnSecondary} onClick={() => window.location.href = '/cni/labos/projects'} style={{ marginLeft: 'auto', border: '1px solid var(--border-glass)' }}>
              Back to Project List
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
