import React, { useEffect } from 'react';
import { FileText, Database } from 'lucide-react';
import { useForm as useRHForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useLabOSMutations } from '../../../hooks/useLabOS';
import cniStyles from '../../../styles/cni-premium.module.css';

const headerSchema = z.object({
  categories: z.string().min(1, 'Category is required'),
  s_sample_type: z.string().min(1, 'Required').max(40, 'Max 40 characters'),
  s_mat_code: z.string().min(1, 'Required').max(20, 'Max 20 characters'),
  s_comm_mat_code: z.string().optional(),
  s_sample_desc: z.string().min(1, 'Required').max(400, 'Max 400 characters'),
});



export function LabOSMasterForm({ isExisting, defaultValues, matId }) {
  const { saveMatHeaderMutation, updateSampleDescMutation } = useLabOSMutations();

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset, watch } = useRHForm({
    resolver: zodResolver(headerSchema),
    defaultValues: defaultValues || {
      categories: '1',
      s_sample_type: '',
      s_mat_code: '',
      s_comm_mat_code: '',
      s_sample_desc: '-',
    }
  });

  useEffect(() => {
    if (defaultValues) {
      reset(defaultValues);
    }
  }, [defaultValues, reset]);

  const onSubmit = async (data) => {
    if (isExisting) {
      // Update logic: Only updating description is allowed per legacy UI
      if (window.confirm("Do you want to update Sample Description?")) {
        try {
          await updateSampleDescMutation.mutateAsync({
            s_sample_desc: data.s_sample_desc,
            s_mat_code: data.s_mat_code,
            n_mat_id: matId
          });
          alert("Material details updated successfully.");
        } catch (error) {
          alert("Failed to update material details.");
        }
      }
    } else {
      // Create logic
      if (window.confirm("Do you want to save and proceed ? ")) {
        try {
          const payload = {
            s_sample_type: data.s_sample_type,
            s_mat_code: data.s_mat_code,
            s_sample_desc: data.s_sample_desc,
            s_comm_mat_code: data.s_comm_mat_code,
            s_categ: data.categories,
            s_created_by: localStorage.getItem('loginId') || localStorage.getItem('uid') || '',
          };
          
          const result = await saveMatHeaderMutation.mutateAsync(payload);
          
          if (result?.data?.res === "DUPLICATE") {
            alert(`${data.s_mat_code} Material code Already in System.`);
          } else if (result?.data?.s_mat_code) {
            // Redirect using the exact legacy URL parameter contract
            window.location.href = `/cni/labos/form?id=${result.data.s_mat_code}&status=${result.data.n_status}&cat=${result.data.s_categories}`;
          }
        } catch (error) {
          alert("Failed to save master record.");
        }
      }
    }
  };

  const selectedCategory = watch('categories');
  const showCniMatCode = ['2', '4', '5'].includes(selectedCategory);

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
          {isExisting ? <Database size={24} color="white" /> : <FileText size={24} color="white" />}
        </div>
        <div>
          <h3 className={cniStyles.cardTitle} style={{ color: 'white', fontSize: '1.4rem', marginBottom: '0.2rem' }}>
            {isExisting ? 'Master Material Record' : 'Create New Material Form'}
          </h3>
          <p style={{ margin: 0, color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>
            {isExisting ? 'Update existing material properties and descriptions.' : 'Configure a new material test form to generate a Lab Sample ID.'}
          </p>
        </div>
      </div>
      <div className={cniStyles.cardBody} style={{ padding: '2rem' }}>
        <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'grid', gap: '1.5rem', maxWidth: '700px' }}>
          
          <div>
            <label className={cniStyles.formLabel} style={{ display: 'block', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--text-secondary)' }}>Categories</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
              {[
                { id: '1', label: 'Development Laminate' },
                { id: '2', label: 'Production/Quality Issue' },
                { id: '3', label: 'Alternate Material' },
                { id: '4', label: 'RAW Material' },
                { id: '5', label: 'Benchmark' },
              ].map(cat => (
                <label key={cat.id} style={{ display: 'inline-flex', cursor: 'pointer', margin: 0 }}>
                  <input 
                    type="radio" 
                    value={cat.id} 
                    {...register('categories')} 
                    disabled={isExisting} 
                    className={cniStyles.radioCardInput}
                    style={{ display: 'none' }}
                  />
                  <div className={cniStyles.radioCard}>
                    {cat.label}
                  </div>
                </label>
              ))}
            </div>
            {errors.categories && <span style={{ color: 'var(--danger)', fontSize: '0.85rem' }}>{errors.categories.message}</span>}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label className={cniStyles.formLabel} style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Sample Form</label>
              <input type="text" className={cniStyles.formControl} placeholder="Sample type" {...register('s_sample_type')} disabled={isExisting} />
              {errors.s_sample_type && <span style={{ color: 'var(--danger)', fontSize: '0.85rem' }}>{errors.s_sample_type.message}</span>}
            </div>

            <div>
              <label className={cniStyles.formLabel} style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Material Code</label>
              <input type="text" className={cniStyles.formControl} placeholder="Material Code" {...register('s_mat_code')} disabled={isExisting} />
              {errors.s_mat_code && <span style={{ color: 'var(--danger)', fontSize: '0.85rem' }}>{errors.s_mat_code.message}</span>}
            </div>
          </div>

          {showCniMatCode && (
            <div>
              <label className={cniStyles.formLabel} style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>CNI Material Code</label>
              <input type="text" className={cniStyles.formControl} placeholder="Material Code" {...register('s_comm_mat_code')} disabled={isExisting} />
            </div>
          )}

          <div>
            <label className={cniStyles.formLabel} style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Sample Description</label>
            <textarea className={cniStyles.formControl} rows="3" placeholder="Remark" {...register('s_sample_desc')} disabled={isExisting && defaultValues?.isTestingStarted && !defaultValues?.isEditable}></textarea>
            {errors.s_sample_desc && <span style={{ color: 'var(--danger)', fontSize: '0.85rem' }}>{errors.s_sample_desc.message}</span>}
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            {(!isExisting || (isExisting && (!defaultValues?.isTestingStarted || defaultValues?.isEditable))) && (
              <button type="submit" className={cniStyles.btnPrimary} disabled={isSubmitting}>
                {isSubmitting ? 'Processing...' : (isExisting ? 'Update Material Details' : 'Save & proceed')}
              </button>
            )}
            {!isExisting && (
              <button type="button" className={cniStyles.btnSecondary} onClick={() => window.history.back()}>
                Back
              </button>
            )}
          </div>

        </form>
      </div>
    </div>
  );
}
