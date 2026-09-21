import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useCreateProject } from '../../../../hooks/useCreateProject';
import { useTempFiles } from '../../../../hooks/useTempFiles';
import TempFileUploadModal from './TempFileUploadModal';
import ProjectScopingFields from '../../components/ProjectScopingFields';
import cniStyles from '../../../../styles/cni-premium.module.css';
import { Upload, X, ArrowLeft, Save } from 'lucide-react';

const projectSchema = z.object({
  s_project_name: z.string().min(1, 'Required'),
  s_product_diff: z.string().min(1, 'Required'),
  s_target_market_seg: z.array(z.string()).min(1, 'Required'),
  s_source_of_info: z.string().min(1, 'Required'),
  s_new_mar_exi_product: z.string().min(1, 'Required'),
  s_current_practice: z.string().min(1, 'Required'),
  s_exp_market_vol: z.string().min(1, 'Required'),
  s_competition_analysis: z.string().min(1, 'Required'),
  s_project_speci: z.string().min(1, 'Required'),
  s_region: z.string().min(1, 'Required'),
  s_prodcut_type: z.string().min(1, 'Required'),
  s_year: z.string().min(1, 'Required'),
  s_project_seq: z.string().min(1, 'Required'),
  n_loc_cni_project: z.string().min(1, 'Required'),
});

export default function ProjectForm() {
  const { createProject, isCreating } = useCreateProject();
  const { tempFiles, deleteFile, isDeleting } = useTempFiles();
  const [showModal, setShowModal] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      s_project_name: '',
      s_product_diff: '',
      s_target_market_seg: [],
      s_source_of_info: '',
      s_new_mar_exi_product: '',
      s_current_practice: '',
      s_exp_market_vol: '',
      s_competition_analysis: '',
      s_project_speci: '',
      s_region: '',
      s_prodcut_type: '',
      s_year: '',
      s_project_seq: '',
      n_loc_cni_project: '',
    }
  });

  const uid = localStorage.getItem('loginId') || '';

  const onSubmit = async (data) => {
    try {
      await createProject({ item: data, uid });
    } catch (err) {
      alert("There was a server side error! Please try again.");
    }
  };

  const handleRemoveTempFile = async (id) => {
    if (window.confirm("Do you want to remove this file?")) {
      try {
        await deleteFile(id);
      } catch (err) {
        alert("Error deleting file.");
      }
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className={cniStyles.dashboardCard}>
          <div className={cniStyles.cardHeader}>
            <h3 className={cniStyles.cardTitle}>Product Scoping</h3>
          </div>
          
          <div className={cniStyles.cardBody}>
            <div className={cniStyles.gridForm}>
              <ProjectScopingFields 
                register={register} 
                errors={errors} 
                isReadOnly={false} 
                isVAndE={true} 
              />
            </div>

            <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'var(--bg-tertiary)', borderRadius: '12px', border: '1px solid var(--border-glass)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600 }}>Reference Documents</h4>
                <button 
                  type="button" 
                  className={cniStyles.btnSecondary}
                  onClick={() => setShowModal(true)}
                >
                  <Upload size={16} /> Choose File
                </button>
              </div>

              {tempFiles.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)', fontStyle: 'italic', background: 'var(--bg-primary)', borderRadius: '8px' }}>
                  No reference files attached yet.
                </div>
              ) : (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {tempFiles.map((x, index) => (
                    <li key={x.n_temp_file_id || index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'var(--bg-primary)', borderRadius: '8px', border: '1px solid var(--border-glass)' }}>
                      <a href={`/${x.s_path}/${x.s_new_name}`} style={{ color: 'var(--primary)', fontWeight: 500, textDecoration: 'none' }}>
                        {x.s_ogi_name}
                      </a>
                      <button 
                        type="button"
                        onClick={() => !isDeleting && handleRemoveTempFile(x.n_temp_file_id)}
                        className={cniStyles.btnAction}
                        title="Remove File"
                      >
                        <X size={18} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className={cniStyles.cardFooter} style={{ display: 'flex', justifyContent: 'flex-start', gap: '1rem', padding: '1.5rem 2rem' }}>
            <button 
              type="submit" 
              className={cniStyles.btnPrimary}
              disabled={isCreating}
            >
              <Save size={16} /> {isCreating ? 'Submitting...' : 'Submit Project'}
            </button>
            <button 
              type="button" 
              className={cniStyles.btnSecondary}
              onClick={() => window.history.back()} 
            >
              <ArrowLeft size={16} /> Back
            </button>
          </div>
        </div>
      </form>

      {showModal && (
        <div className={cniStyles.modalOverlay}>
          <TempFileUploadModal onClose={() => setShowModal(false)} />
        </div>
      )}
    </div>
  );
}
