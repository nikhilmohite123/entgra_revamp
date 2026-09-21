import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Download, Plus, Trash2, Check, X, ArrowLeft, Send } from 'lucide-react';
import { useStage1 } from '../../../hooks/useStage1';
import ProjectScopingFields from '../components/ProjectScopingFields';
import cniStyles from '../../../styles/cni-premium.module.css';

export default function Stage1Page() {
  const { projectId } = useParams();
  const { 
    item, attachments, approvals, 
    isLoading, isError, 
    saveProject, isSaving,
    goAhead, isGoingAhead,
    scrapProject, isScrapping 
  } = useStage1(projectId);

  const [pteam, setPteam] = useState([]);
  const [newTeamMember, setNewTeamMember] = useState({ s_project_team: '', s_dept: '' });
  
  // Create dynamic schema based on approvals length
  const schema = z.object({
    s_project_name: z.string().min(1, 'Required'),
    s_product_diff: z.string().min(1, 'Required'),
    s_target_market_seg: z.array(z.string()).min(1, 'Required').or(z.string().min(1, 'Required')),
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
    // Conditionally required fields based on approvals.length
    s_remarks: z.string().min(1, 'Remark should be Required!!'),
    n_pov: approvals.length > 0 ? z.string().min(1, 'Your Point Of View should be Required!!') : z.string().optional(),
    n_project_type: approvals.length === 0 ? z.string().optional() : z.string().optional(), // Legacy required but commented out in HTML
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {}
  });

  useEffect(() => {
    if (item) {
      let segment = item.s_target_market_seg || '';
      if (item.s_action_perform === 'V&E' && typeof segment === 'string') {
        segment = segment.split(',').filter(Boolean);
      }
      reset({
        ...item,
        s_target_market_seg: segment,
        n_pov: item.n_pov ? String(item.n_pov) : '1', // default 1 based on legacy ng-init
        s_remarks: item.s_remarks || ''
      });
    }
  }, [item, reset]);

  if (isLoading) return <div>Loading Stage 1...</div>;
  if (isError || !item) return <div>Error loading project.</div>;

  const isVAndE = item.s_action_perform === 'V&E';
  const showGoAheadScrap = approvals.length === 0 && item.s_action_perform !== 'View';
  const showSubmit = approvals.length > 0 && item.n_status !== 1;
  const isViewOnly = item.s_action_perform === 'View';
  const uid = localStorage.getItem('loginId') || '';

  const onSubmitSave = async (data) => {
    try {
      await saveProject({ item: data, uid, id: projectId });
    } catch (err) {
      alert("There was a server side error!");
    }
  };

  const onGoAhead = async (data) => {
    try {
      await goAhead({ item: data, proTeam: pteam });
    } catch (err) {
      alert("There was a server side error!");
    }
  };

  const onScrap = async (data) => {
    try {
      await scrapProject({ item: data, uid, id: projectId });
    } catch (err) {
      alert("There was a server side error!");
    }
  };

  const handleAddTeam = (e) => {
    e.preventDefault();
    if (!newTeamMember.s_project_team || !newTeamMember.s_dept) {
      alert("You missed Something!!");
      return;
    }
    if (pteam.length <= 3) {
      setPteam([...pteam, newTeamMember]);
      setNewTeamMember({ s_project_team: '', s_dept: '' });
    } else {
      alert("Limited Approval are allowed!");
    }
  };

  const handleRemoveTeam = (index) => {
    const newTeam = [...pteam];
    newTeam.splice(index, 1);
    setPteam(newTeam);
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      
      {/* Navigation Breadcrumb/Pills */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem' }}>
        <button className={cniStyles.btnPrimary} style={{ padding: '0.5rem 1.5rem', borderRadius: '50px' }}>Stage 1</button>
        <Link to={`/cni/projects/${projectId}/gate/A`} style={{ textDecoration: 'none' }}>
          <button className={cniStyles.btnSecondary} style={{ padding: '0.5rem 1.5rem', borderRadius: '50px' }} disabled={isViewOnly && !isVAndE}>Gate A</button>
        </Link>
      </div>

      <form onSubmit={(e) => e.preventDefault()}>
        <div className={cniStyles.dashboardCard}>
          <div className={cniStyles.cardHeader} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h3 className={cniStyles.cardTitle}>Product Scoping</h3>
            
            {/* Metadata Info Bar */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', fontSize: '0.9rem' }}>
              <div><span style={{ color: 'var(--text-secondary)' }}>EP/DOC/NO:</span> <br/><b>{item.s_code}</b></div>
              <div><span style={{ color: 'var(--text-secondary)' }}>Issue Date:</span> <br/><b>{item.s_issue_date}</b></div>
              <div><span style={{ color: 'var(--text-secondary)' }}>Revision no:</span> <br/><b>{item.s_doc_id}</b></div>
              <div><span style={{ color: 'var(--text-secondary)' }}>Revision Date:</span> <br/><b>{item.s_revision_date}</b></div>
              <div><span style={{ color: 'var(--text-secondary)' }}>Initiator:</span> <br/><b>{item.s_initiator}</b></div>
            </div>
          </div>

          <div className={cniStyles.cardBody}>
            <div className={cniStyles.gridForm}>
              <ProjectScopingFields 
                register={register} 
                errors={errors} 
                isReadOnly={isViewOnly} 
                isVAndE={isVAndE}
                legacyTargetSegment={typeof item.s_target_market_seg === 'string' ? item.s_target_market_seg : ''}
              />
            </div>

            {/* Reference Attachments */}
            {attachments && attachments.length > 0 && attachments.some(x => x.s_attach_type === 'S1') && (
              <div style={{ marginTop: '2.5rem' }}>
                <h4 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', fontWeight: 600 }}>Reference Documents</h4>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {attachments.map((x, i) => x.s_attach_type === 'S1' && (
                    <li key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'var(--bg-tertiary)', borderRadius: '8px', border: '1px solid var(--border-glass)' }}>
                      <span style={{ fontWeight: 500 }}>{x.s_ogi_name}</span>
                      <a href={`/${x.s_path}/${x.s_new_name}`} className={cniStyles.btnAction} style={{ textDecoration: 'none' }} title="Download">
                        <Download size={18} />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Audit Trail */}
            {approvals.length > 0 && (
              <div style={{ marginTop: '2.5rem' }}>
                <h4 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', fontWeight: 600 }}>Audit Trail</h4>
                <div style={{ overflowX: 'auto', borderRadius: '8px', border: '1px solid var(--border-glass)' }}>
                  <table className={cniStyles.cniTable}>
                    <thead>
                      <tr>
                        <th className={cniStyles.cniTh}>Name</th>
                        <th className={cniStyles.cniTh}>Remark</th>
                        <th className={cniStyles.cniTh}>POV</th>
                      </tr>
                    </thead>
                    <tbody>
                      {approvals.map((app, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid var(--border-glass)' }}>
                          <td className={cniStyles.cniTd} style={{ fontWeight: 500, color: 'var(--primary)' }}>{app.s_employee_id}</td>
                          <td className={cniStyles.cniTd}>{app.s_remarks ? app.s_remarks : <span style={{color: 'var(--text-secondary)', fontStyle: 'italic'}}>Remark is pending...</span>}</td>
                          <td className={cniStyles.cniTd}>
                            <span style={{ padding: '4px 12px', borderRadius: '50px', fontSize: '0.8rem', fontWeight: 600, background: app.pov === 'Agree' ? 'rgba(99, 181, 47, 0.15)' : 'var(--bg-tertiary)', color: app.pov === 'Agree' ? 'var(--secondary)' : 'var(--text-primary)' }}>
                              {app.pov}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Submit Actions Area */}
            {showSubmit && (
              <div style={{ marginTop: '2.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', padding: '1.5rem', background: 'var(--bg-tertiary)', borderRadius: '12px' }}>
                <div>
                  <label className={cniStyles.formLabel}>Approval Remark <span style={{color: 'var(--danger)'}}>*</span></label>
                  <textarea 
                    className={cniStyles.formControl} 
                    placeholder="Enter your approval remark..." 
                    rows={4}
                    {...register('s_remarks')}
                    maxLength="5000"
                  ></textarea>
                  {errors.s_remarks && <span style={{color: 'var(--danger)', fontSize: '0.8rem'}}>{errors.s_remarks.message}</span>}
                </div>
                <div>
                  <label className={cniStyles.formLabel}>Point of View (POV) <span style={{color: 'var(--danger)'}}>*</span></label>
                  <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.5rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 500 }}>
                      <input type="radio" value="1" {...register('n_pov')} style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }} /> Agree
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 500 }}>
                      <input type="radio" value="0" {...register('n_pov')} style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }} /> Disagree
                    </label>
                  </div>
                  {errors.n_pov && <span style={{color: 'var(--danger)', fontSize: '0.8rem', display: 'block', marginTop: '0.5rem'}}>{errors.n_pov.message}</span>}
                </div>
              </div>
            )}

            {/* Project Team & Scrap/Go Ahead */}
            {showGoAheadScrap && (
              <div style={{ marginTop: '2.5rem', padding: '1.5rem', background: 'var(--bg-tertiary)', borderRadius: '12px', border: '1px solid var(--border-glass)' }}>
                <h4 style={{ margin: '0 0 1.5rem 0', fontSize: '1.1rem', fontWeight: 600 }}>Assign Project Team</h4>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '1rem', alignItems: 'end', marginBottom: '1.5rem' }}>
                  <div>
                    <label className={cniStyles.formLabel}>Action Member Email</label>
                    <input 
                      className={cniStyles.formControl} 
                      type="text" 
                      placeholder="Email ID..."
                      value={newTeamMember.s_project_team}
                      onChange={(e) => setNewTeamMember({...newTeamMember, s_project_team: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className={cniStyles.formLabel}>Department</label>
                    <input 
                      className={cniStyles.formControl} 
                      type="text" 
                      placeholder="Department..."
                      value={newTeamMember.s_dept}
                      onChange={(e) => setNewTeamMember({...newTeamMember, s_dept: e.target.value})}
                    />
                  </div>
                  <button className={cniStyles.btnSecondary} onClick={handleAddTeam} style={{ height: '42px', padding: '0 1.5rem' }}>
                    <Plus size={18} /> Add
                  </button>
                </div>

                {pteam.length > 0 && (
                  <div style={{ overflowX: 'auto', borderRadius: '8px', border: '1px solid var(--border-glass)', marginBottom: '2rem' }}>
                    <table className={cniStyles.cniTable}>
                      <thead>
                        <tr>
                          <th className={cniStyles.cniTh}>Action Member</th>
                          <th className={cniStyles.cniTh}>Department</th>
                          <th className={cniStyles.cniTh} style={{ width: '80px', textAlign: 'center' }}>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pteam.map((x, i) => (
                          <tr key={i} style={{ borderBottom: '1px solid var(--border-glass)' }}>
                            <td className={cniStyles.cniTd} style={{ fontWeight: 500 }}>{x.s_project_team}</td>
                            <td className={cniStyles.cniTd}>{x.s_dept}</td>
                            <td className={cniStyles.cniTd} style={{ textAlign: 'center' }}>
                              <button className={cniStyles.btnAction} onClick={(e) => { e.preventDefault(); handleRemoveTeam(i); }} style={{ color: 'var(--danger)' }} title="Remove">
                                <Trash2 size={18} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                
                <div>
                  <label className={cniStyles.formLabel}>Remark <span style={{color: 'var(--danger)'}}>*</span></label>
                  <textarea 
                    className={cniStyles.formControl} 
                    placeholder="Enter remark before proceeding..." 
                    rows={3}
                    {...register('s_remarks')}
                    maxLength="5000"
                  ></textarea>
                  {errors.s_remarks && <span style={{color: 'var(--danger)', fontSize: '0.8rem'}}>{errors.s_remarks.message}</span>}
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className={cniStyles.cardFooter} style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', padding: '1.5rem 2rem' }}>
            <button type="button" className={cniStyles.btnSecondary} onClick={() => window.history.back()}>
              <ArrowLeft size={16} /> Back
            </button>
            
            {showGoAheadScrap && (
              <>
                <button type="button" className={cniStyles.btnPrimary} style={{ background: 'var(--danger)', borderColor: 'var(--danger)' }} onClick={handleSubmit(onScrap)} disabled={isScrapping}>
                  <X size={16} /> {isScrapping ? 'Scrapping...' : 'Scrap'}
                </button>
                <button type="button" className={cniStyles.btnPrimary} onClick={handleSubmit(onGoAhead)} disabled={isGoingAhead}>
                  <Check size={16} /> {isGoingAhead ? 'Processing...' : 'Go Ahead'}
                </button>
              </>
            )}
            
            {showSubmit && (
              <button type="button" className={cniStyles.btnPrimary} onClick={handleSubmit(onSubmitSave)} disabled={isSaving}>
                <Send size={16} /> {isSaving ? 'Submitting...' : 'Submit POV'}
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
