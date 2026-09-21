import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Plus, FileText, RefreshCw, GitBranch, Download, FolderGit2, ChevronDown, ChevronRight, Activity, Clock, CheckCircle, ListTodo, Presentation, Search } from 'lucide-react';
import { useStageGateData } from '../../hooks/useStageGateData';
import { projectApi } from '../../services/projectApi';
import cniStyles from '../../styles/cni-premium.module.css';

export function StageGateDashboard() {
  const navigate = useNavigate();
  const cniHead = localStorage.getItem('cniHead') || '0';
  const {
    myProjects,
    cniHeadApproval,
    otherOption,
    stageProjects,
    commercialCif,
    cifApproved,
    projectStatus,
    projectSummary,
    isLoading,
    hasError,
    refetchAll
  } = useStageGateData();

  const [modalData, setModalData] = useState({ type: null, data: [], isOpen: false });
  const [globalSearch, setGlobalSearch] = useState('');
  const [statusViewSearch, setStatusViewSearch] = useState('');

  const filterData = (list) => {
    if (!list) return [];
    if (!globalSearch.trim()) return list;
    const lower = globalSearch.toLowerCase();
    return list.filter(row => 
      (row.s_project_name && row.s_project_name.toLowerCase().includes(lower)) ||
      (row.s_project_head_id && row.s_project_head_id.toString().toLowerCase().includes(lower)) ||
      (row.s_new_project_id && row.s_new_project_id.toLowerCase().includes(lower)) ||
      (row.s_initiator && row.s_initiator.toLowerCase().includes(lower)) ||
      (row.status && row.status.toLowerCase().includes(lower))
    );
  };

  const filterProjectStatus = (list) => {
    let filtered = filterData(list);
    if (statusViewSearch) {
      const lower = statusViewSearch.toLowerCase();
      filtered = filtered.filter(row => 
        (row.s_project_name && row.s_project_name.toLowerCase().includes(lower)) ||
        (row.s_project_head_id && row.s_project_head_id.toString().toLowerCase().includes(lower)) ||
        (row.s_new_project_id && row.s_new_project_id.toLowerCase().includes(lower)) ||
        (row.s_initiator && row.s_initiator.toLowerCase().includes(lower)) ||
        (row.status && row.status.toLowerCase().includes(lower))
      );
    }
    return filtered;
  };

  const handlePcifAttachment = async (id) => {
    try {
      const res = await projectApi.getPcifCifAttachment({ id });
      setModalData({ type: 'pcif', data: res.data || [], isOpen: true });
    } catch (error) {
      alert("Failed to load attachments.");
    }
  };

  const handleDoeAttachment = async (s_project_head_id) => {
    try {
      const res = await projectApi.getLatestDoe({ s_project_head_id });
      setModalData({ type: 'doe', data: res.data || [], isOpen: true });
    } catch (error) {
      alert("Failed to load DoE attachment.");
    }
  };

  if (isLoading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', flexDirection: 'column', gap: '1rem' }}>
      <RefreshCw size={32} className="fa-spin" style={{ color: 'var(--primary)', animation: 'spin 1.5s linear infinite' }} />
      <div style={{ color: 'var(--text-secondary)', fontWeight: 500, letterSpacing: '0.5px' }}>Loading Stage Gate Process...</div>
    </div>
  );
  if (hasError) return (
    <div style={{ padding: '2rem', color: 'var(--danger)', textAlign: 'center', fontWeight: 600 }}>
      <div style={{ marginBottom: '1rem' }}><RefreshCw size={48} /></div>
      Failed to load Dashboard data. Please try again.
    </div>
  );

  return (
    <div className={`container-fluid ${cniStyles.cniContainer}`} style={{ padding: '2.5rem', background: 'linear-gradient(135deg, #f8fafd 0%, #f1f5f9 100%)', minHeight: '100vh' }}>
      
      {/* Premium Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1.5rem', background: '#ffffff', padding: '1.5rem 2rem', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)', padding: '1rem', borderRadius: '14px', boxShadow: '0 4px 15px rgba(26, 92, 255, 0.2)' }}>
            <FolderGit2 size={28} color="white" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.85rem', fontWeight: 800, margin: '0 0 0.25rem 0', color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
              Stage Gate Process
            </h1>
            <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.95rem', fontWeight: 500 }}>
              C&I Project Approval & Stage Tracking Dashboard
            </p>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', background: '#f8fafd', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.4rem 0.75rem', gap: '0.5rem', width: '250px' }}>
            <Search size={16} color="var(--text-secondary)" />
            <input 
              type="text" 
              placeholder="Search projects..." 
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '0.9rem', color: 'var(--text-primary)' }}
            />
          </div>
          <button className={cniStyles.btnPrimary} onClick={() => navigate('/cni/projects/create')} style={{ boxShadow: '0 4px 15px rgba(26, 92, 255, 0.2)', padding: '0.6rem 1.25rem' }}>
            <Plus size={18} /> Create New
          </button>
          {cniHead === '1' && (
            <button className={cniStyles.btnSecondary} onClick={() => navigate('/cni/reports')} style={{ background: 'white' }}>
              <FileText size={18} /> Report
            </button>
          )}
          <a href="/CNI/wrkfl_chart/cniwf.pdf" target="_blank" rel="noreferrer" className={cniStyles.btnSecondary} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'white' }}>
            <GitBranch size={18} /> Workflow
          </a>
          <button className={cniStyles.btnSecondary} onClick={refetchAll} style={{ background: 'white', color: 'var(--primary)', borderColor: 'var(--primary-light)' }}>
            <RefreshCw size={18} /> Refresh
          </button>
        </div>
      </div>

      <div className="row" style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '1.5rem' }}>
        <div style={{ flex: '1 1 calc(50% - 0.75rem)' }}>
          <DashboardCard title="My Project's" count={myProjects.data?.length} icon={<ListTodo size={20} />} accent="#1a5cff">
            <Table 
              headers={['Si. No', 'Project No.', 'Project Name', 'Status', 'Initiator', 'Audit Trail']}
              data={filterData(myProjects.data)}
              renderRow={(row) => (
                <tr key={row.s_project_head_id}>
                  <td style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>{row.s_project_head_id}</td>
                  <td>
                    <Link to={`/cni/projects/${row.s_project_head_id}`} style={{ fontWeight: 600, color: 'var(--primary)', textDecoration: 'none' }}>
                      {row.s_new_project_id || row.s_project_head_id}
                    </Link>
                  </td>
                  <td style={{ fontWeight: 500 }}>{row.s_project_name}</td>
                  <td><StatusBadge status={row.status} /></td>
                  <td>{row.s_initiator === 'null' ? '' : row.s_initiator}</td>
                  <td>
                    <Link to={`/cni/projects/${row.s_project_head_id}/status`} className={cniStyles.btnSecondary} style={{ padding: '0.3rem 0.75rem', fontSize: '0.8rem', textDecoration: 'none' }}>
                      Click To View
                    </Link>
                  </td>
                </tr>
              )}
            />
          </DashboardCard>
        </div>

        <div style={{ flex: '1 1 calc(50% - 0.75rem)' }}>
          <DashboardCard title="Initial Approval By C&I Head" count={cniHeadApproval.data?.length} icon={<Clock size={20} />} accent="#f59e0b">
            <Table 
              headers={['Project No.', 'Project Name', 'Initiator', 'Status', 'Region']}
              data={filterData(cniHeadApproval.data)}
              renderRow={(row) => row.s_level === '0' && (
                <tr key={row.s_project_head_id}>
                  <td>
                    <Link to={`/cni/projects/${row.s_tmpl_route}/${row.s_project_head_id}`} style={{ fontWeight: 600, color: 'var(--primary)', textDecoration: 'none' }}>
                      {row.s_project_head_id} {row.s_new_project_id ? `(${row.s_new_project_id})` : ''}
                    </Link>
                  </td>
                  <td style={{ fontWeight: 500 }}>{row.s_project_name}</td>
                  <td>{row.s_initiator === 'null' ? '' : row.s_initiator}</td>
                  <td><StatusBadge status={row.status} /></td>
                  <td><span style={{ padding: '0.2rem 0.6rem', background: '#f1f5f9', borderRadius: '4px', fontSize: '0.85rem' }}>{row.s_region}</span></td>
                </tr>
              )}
            />
          </DashboardCard>
        </div>
      </div>

      <div className="row" style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '1.5rem' }}>
        <div style={{ flex: '1 1 calc(50% - 0.75rem)' }}>
          <DashboardCard title="Other Option" count={otherOption.data?.length} icon={<Activity size={20} />} accent="#8b5cf6">
            <Table 
              headers={['Project No.', 'Project Name', 'Initiator', 'Status', 'Region']}
              data={filterData(otherOption.data)}
              renderRow={(row) => (
                <tr key={`${row.s_project_head_id}-${row.s_stage_approval}`}>
                  <td>
                    <Link to={`/cni/projects/${row.s_tmpl_route}/${row.s_project_head_id}/${row.s_stage_approval}`} style={{ fontWeight: 600, color: 'var(--primary)', textDecoration: 'none' }}>
                      {row.s_project_head_id} {row.s_new_project_id ? `(${row.s_new_project_id})` : ''}
                    </Link>
                  </td>
                  <td style={{ fontWeight: 500 }}>{row.s_project_name}</td>
                  <td>{row.s_initiator}</td>
                  <td><StatusBadge status={row.status} /></td>
                  <td><span style={{ padding: '0.2rem 0.6rem', background: '#f1f5f9', borderRadius: '4px', fontSize: '0.85rem' }}>{row.s_region}</span></td>
                </tr>
              )}
            />
          </DashboardCard>
        </div>

        <div style={{ flex: '1 1 calc(50% - 0.75rem)' }}>
          <DashboardCard title="Stages Or Provisional CIF" count={stageProjects.data?.length} icon={<Presentation size={20} />} accent="#0ea5e9">
            <Table 
              headers={['Project No.', 'Project Name', 'Initiator', 'Status', 'Region']}
              data={filterData(stageProjects.data)}
              renderRow={(row) => (
                <tr key={row.s_project_head_id}>
                  <td>
                    <Link to={`/cni/projects/${row.s_tmpl_route}/${row.s_project_head_id}`} style={{ fontWeight: 600, color: 'var(--primary)', textDecoration: 'none' }}>
                      {row.s_project_head_id} {row.s_new_project_id ? `(${row.s_new_project_id})` : ''}
                    </Link>
                  </td>
                  <td style={{ fontWeight: 500 }}>{row.s_project_name}</td>
                  <td>{row.s_initiator === 'null' ? '' : row.s_initiator}</td>
                  <td><StatusBadge status={row.status} /></td>
                  <td><span style={{ padding: '0.2rem 0.6rem', background: '#f1f5f9', borderRadius: '4px', fontSize: '0.85rem' }}>{row.s_region}</span></td>
                </tr>
              )}
            />
          </DashboardCard>
        </div>
      </div>

      <div className="row" style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '1.5rem' }}>
        <div style={{ flex: '1 1 calc(50% - 0.75rem)' }}>
          <DashboardCard title="Commercial CIF Approval Pending" count={commercialCif.data?.length} icon={<Clock size={20} />} accent="#eab308">
            <Table 
              headers={['Project No.', 'Project Name', 'Initiator', 'Status', 'View']}
              data={filterData(commercialCif.data)}
              renderRow={(row) => (
                <tr key={row.s_project_head_id}>
                  <td>
                    <Link to={`/cni/final-Cif/${row.s_project_head_id}`} style={{ fontWeight: 600, color: 'var(--primary)', textDecoration: 'none' }}>
                      {row.s_project_head_id} {row.s_new_project_id ? `(${row.s_new_project_id})` : ''}
                    </Link>
                  </td>
                  <td style={{ fontWeight: 500 }}>{row.s_project_name}</td>
                  <td>{row.s_initiator}</td>
                  <td><StatusBadge status={row.status} /></td>
                  <td>
                    <Link to={`/cni/view-previous/4G-1/${row.s_project_head_id}`} target="_blank" className={cniStyles.btnSecondary} style={{ padding: '0.3rem 0.75rem', fontSize: '0.8rem', textDecoration: 'none' }}>
                      Provisional CIF
                    </Link>
                  </td>
                </tr>
              )}
            />
          </DashboardCard>
        </div>

        <div style={{ flex: '1 1 calc(50% - 0.75rem)' }}>
          <DashboardCard title="CIF Approved" count={cifApproved.data?.length} icon={<CheckCircle size={20} />} accent="#10b981">
            <Table 
              headers={['Project No.', 'Project Name', 'Initiator', 'Status', 'Release Date', 'View']}
              data={filterData(cifApproved.data)}
              renderRow={(row) => (
                <tr key={row.s_project_head_id}>
                  <td>
                    <Link to={`/cni/final-Cif-Approved/${row.s_project_head_id}`} style={{ fontWeight: 600, color: 'var(--primary)', textDecoration: 'none' }}>
                      {row.s_project_head_id} {row.s_new_project_id ? `(${row.s_new_project_id})` : ''}
                    </Link>
                  </td>
                  <td style={{ fontWeight: 500 }}>{row.s_project_name}</td>
                  <td>{row.s_initiator === 'null' ? '' : row.s_initiator}</td>
                  <td><StatusBadge status={row.status} /></td>
                  <td style={{ color: 'var(--text-secondary)' }}>{row.release_date}</td>
                  <td>
                    <button className={cniStyles.btnSecondary} onClick={() => handlePcifAttachment(row.s_project_head_id)} style={{ padding: '0.3rem 0.75rem', fontSize: '0.8rem' }}>
                      <Download size={14} style={{ marginRight: '4px' }} /> PCIF/CIF
                    </button>
                  </td>
                </tr>
              )}
            />
          </DashboardCard>
        </div>
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <DashboardCard title="Project Status View" count={projectStatus.data?.length} icon={<Activity size={20} />} accent="#3b82f6" defaultOpen={true}>
          <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', justifyContent: 'flex-end' }}>
            <div style={{ display: 'flex', alignItems: 'center', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '0.4rem 0.75rem', gap: '0.5rem', width: '300px' }}>
              <Search size={16} color="var(--text-secondary)" />
              <input 
                type="text" 
                placeholder="Search Status View specifically..." 
                value={statusViewSearch}
                onChange={(e) => setStatusViewSearch(e.target.value)}
                style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '0.85rem', color: 'var(--text-primary)' }}
              />
            </div>
          </div>
          <Table 
            headers={['Project ID', 'Project Name', 'Initiator', 'Location', 'Status', 'Pending Action', 'Audit Trail']}
            data={filterProjectStatus(projectStatus.data)}
            renderRow={(row) => (
              <tr key={row.s_project_head_id}>
                <td style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>{row.s_project_head_id} {row.s_new_project_id ? `(${row.s_new_project_id})` : ''}</td>
                <td><strong style={{ color: 'var(--text-primary)' }}>{row.s_project_name}</strong></td>
                <td>{row.s_initiator === 'null' ? '' : row.s_initiator}</td>
                <td><span style={{ padding: '0.2rem 0.6rem', background: '#f1f5f9', borderRadius: '4px', fontSize: '0.85rem' }}>{row.s_project_locations}</span></td>
                <td><StatusBadge status={row.status} /></td>
                <td style={{ maxWidth: '231px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={row.empid}>{row.empid}</td>
                <td>
                  <Link to={`/cni/projects/${row.s_project_head_id}/status/${row.empid}`} className={cniStyles.btnSecondary} style={{ padding: '0.3rem 0.75rem', fontSize: '0.8rem', textDecoration: 'none' }}>
                    Click To View
                  </Link>
                </td>
              </tr>
            )}
          />
        </DashboardCard>
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <DashboardCard title="Project Summary Report" count={projectSummary.data?.length} icon={<FileText size={20} />} accent="#6366f1" defaultOpen={true}>
          <Table 
            headers={['Project Id.', 'Project Name', 'Initiator', 'View']}
            data={filterData(projectSummary.data)}
            renderRow={(row) => (
              <tr key={row.s_project_head_id}>
                <td style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>{row.s_project_head_id}</td>
                <td style={{ fontWeight: 500 }}>{row.s_project_name}</td>
                <td>{row.s_initiator === 'null' ? '' : row.s_initiator}</td>
                <td>
                  <button className={cniStyles.btnSecondary} onClick={() => handleDoeAttachment(row.s_project_head_id)} style={{ padding: '0.3rem 0.75rem', fontSize: '0.8rem' }}>
                    <Download size={14} style={{ marginRight: '4px' }} /> View DoE
                  </button>
                </td>
              </tr>
            )}
          />
        </DashboardCard>
      </div>

      {/* Attachment Modal */}
      {modalData.isOpen && (
        <div className={cniStyles.modalOverlay} onClick={() => setModalData({ ...modalData, isOpen: false })} style={{ zIndex: 1000, backdropFilter: 'blur(4px)', background: 'rgba(15, 23, 42, 0.4)' }}>
          <div className={cniStyles.modalContent} onClick={e => e.stopPropagation()} style={{ maxWidth: '650px', borderRadius: '16px', border: 'none', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-glass)', paddingBottom: '1rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FolderGit2 size={22} color="var(--primary)" />
                {modalData.type === 'pcif' ? 'CIF / PCIF Attachment' : 'Latest DoE Document'}
              </h2>
              <button onClick={() => setModalData({ ...modalData, isOpen: false })} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.5rem', color: 'var(--text-secondary)' }}>&times;</button>
            </div>
            
            <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
              <table className={cniStyles.table} style={{ width: '100%', margin: 0 }}>
                <thead style={{ background: '#f8fafc', position: 'sticky', top: 0 }}>
                  <tr>
                    {modalData.type === 'pcif' && <th>Uploaded by</th>}
                    <th>Attachment Name</th>
                    {modalData.type === 'pcif' && <th>Type</th>}
                  </tr>
                </thead>
                <tbody>
                  {modalData.data.map((y, idx) => (
                    <tr key={idx} style={{ transition: 'all 0.2s', cursor: 'pointer' }}>
                      {modalData.type === 'pcif' && <td style={{ color: 'var(--text-secondary)' }}>{y.s_uid}</td>}
                      <td>
                        {modalData.type === 'pcif' ? (
                          <a href={`/${y.s_path}/${y.s_new_name}`} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', fontWeight: 500, textDecoration: 'none' }}>
                            <FileText size={16} /> {y.s_ogi_name}
                          </a>
                        ) : (
                          y.latest_doe ? (
                            <a href={`/${y.s_path}/${y.s_doe_attach_newname_file}`} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', fontWeight: 500, textDecoration: 'none' }}>
                              <FileText size={16} /> {y.latest_doe}
                            </a>
                          ) : <span style={{ color: 'var(--text-secondary)' }}>Not Uploaded</span>
                        )}
                      </td>
                      {modalData.type === 'pcif' && <td><span style={{ padding: '0.2rem 0.5rem', background: '#e0e7ff', color: '#4338ca', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>{y.s_attach_type}</span></td>}
                    </tr>
                  ))}
                  {modalData.data.length === 0 && (
                    <tr>
                      <td colSpan={3} style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-secondary)' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                          <FileText size={32} opacity={0.3} />
                          <span>No attachments found for this project.</span>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-glass)' }}>
              <button className={cniStyles.btnSecondary} onClick={() => setModalData({ ...modalData, isOpen: false })}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Subcomponents

function StatusBadge({ status }) {
  if (!status) return null;
  // Apply logic to match colors to statuses
  let bg = '#dcfce7'; let color = '#166534'; // Green
  
  if (status.toLowerCase().includes('pending') || status.toLowerCase().includes('hold')) {
    bg = '#fef3c7'; color = '#92400e'; // Yellow
  } else if (status.toLowerCase().includes('reject') || status.toLowerCase().includes('fail')) {
    bg = '#fee2e2'; color = '#991b1b'; // Red
  } else if (status.toLowerCase().includes('progress')) {
    bg = '#dbeafe'; color = '#1e40af'; // Blue
  }

  return (
    <span style={{ 
      display: 'inline-flex',
      alignItems: 'center',
      padding: '0.25rem 0.75rem', 
      background: bg, 
      color: color, 
      borderRadius: '20px', 
      fontSize: '0.8rem', 
      fontWeight: 600,
      whiteSpace: 'nowrap'
    }}>
      {status}
    </span>
  );
}

function DashboardCard({ title, count, children, icon, accent = 'var(--primary)', defaultOpen = false }) {
  const [isCollapsed, setIsCollapsed] = useState(!defaultOpen);
  
  return (
    <div className={cniStyles.dashboardCard} style={{ display: 'flex', flexDirection: 'column', height: '100%', marginBottom: 0, padding: 0, overflow: 'hidden', border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.05)', borderRadius: '16px', background: '#ffffff', transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)' }}>
      <div 
        style={{ 
          padding: '1.25rem 1.5rem', 
          background: `linear-gradient(135deg, #ffffff 0%, ${accent}08 100%)`, 
          borderBottom: isCollapsed ? 'none' : '1px solid var(--border-glass)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: 'pointer',
          userSelect: 'none',
          position: 'relative'
        }}
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '4px', background: accent }}></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingLeft: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '10px', background: `${accent}15`, color: accent, boxShadow: `0 4px 10px ${accent}20` }}>
            {icon}
          </div>
          <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-primary)', fontWeight: 700, letterSpacing: '-0.3px' }}>{title}</h3>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ 
            backgroundColor: count > 0 ? accent : '#e2e8f0', 
            color: count > 0 ? 'white' : '#64748b', 
            padding: '0.15rem 0.6rem',
            borderRadius: '20px',
            fontSize: '0.85rem',
            fontWeight: 700,
            boxShadow: count > 0 ? `0 2px 5px ${accent}40` : 'none'
          }}>
            {count || 0}
          </span>
          {isCollapsed ? <ChevronRight size={18} color="var(--text-secondary)" /> : <ChevronDown size={18} color="var(--text-secondary)" />}
        </div>
      </div>
      
      {!isCollapsed && (
        <div style={{ padding: '0', flex: 1, overflowX: 'auto', background: 'white' }}>
          {children}
        </div>
      )}
    </div>
  );
}

function Table({ headers, data, renderRow }) {
  if (!data || data.length === 0) {
    return (
      <div style={{ padding: '3rem 1.5rem', textAlign: 'center', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
        <ListTodo size={32} opacity={0.3} />
        <span style={{ fontSize: '0.95rem', fontWeight: 500 }}>No records found.</span>
      </div>
    );
  }
  
  return (
    <table className={cniStyles.table} style={{ margin: 0, border: 'none', width: '100%' }}>
      <thead>
        <tr>
          {headers.map(h => <th key={h}>{h}</th>)}
        </tr>
      </thead>
      <tbody>
        {data.map(renderRow)}
      </tbody>
    </table>
  );
}
