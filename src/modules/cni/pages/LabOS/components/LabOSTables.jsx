import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Eye, List, CheckCircle, FolderOpen, Activity } from 'lucide-react';
import { useLabOS, useLabOSChild } from '../../../hooks/useLabOS';
import cniStyles from '../../../styles/cni-premium.module.css';
import { CniLoader } from '../../../components/common';

// Helper component for child row expansion
function ExpandableChildRow({ matId }) {
  const { data, isLoading, isError } = useLabOSChild(matId);

  if (isLoading) return <div style={{ padding: '1rem', textAlign: 'center' }}>Loading details...</div>;
  if (isError) return <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--danger)' }}>Failed to load details.</div>;
  if (!data || data.length === 0) return <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No testing details found.</div>;

  const getColor = (status) => {
    switch (status) {
      case 0: return "var(--danger)";
      case 1: return "#679eb7";
      case 2: return "var(--primary)";
      case 3: return "#febb36";
      case 4: return "var(--secondary)"; // green
      case 5: return "#767228";
      default: return "var(--text-primary)";
    }
  };

  return (
    <div style={{ padding: '1rem', background: 'var(--bg-primary)', borderBottom: '1px solid var(--border-glass)' }}>
      {data.map((ele, idx) => (
        <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem', marginBottom: '1rem' }}>
          
          <table className={cniStyles.cniTable} style={{ margin: 0 }}>
            <tbody>
              <tr>
                <th style={{ padding: '0.5rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Lab Sample Id</th>
                <td style={{ padding: '0.5rem' }}>{ele.s_lab_sample_id}</td>
              </tr>
              <tr>
                <th style={{ padding: '0.5rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Test Report Id</th>
                <td style={{ padding: '0.5rem' }}>{ele.s_test_report_id || "--"}</td>
              </tr>
              <tr>
                <th style={{ padding: '0.5rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Description</th>
                <td style={{ padding: '0.5rem' }}>{ele.s_sample_desc_lab_sample}</td>
              </tr>
            </tbody>
          </table>

          <table className={cniStyles.cniTable} style={{ margin: 0 }}>
            <tbody>
              {ele.s_categories !== 4 ? (
                <>
                  <tr>
                    <th style={{ padding: '0.5rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Optical Testing</th>
                    <td style={{ padding: '0.5rem' }}><span style={{ color: getColor(ele.n_ot_status), fontWeight: 600 }}>{ele.ot_status}</span></td>
                  </tr>
                  <tr>
                    <th style={{ padding: '0.5rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Mechanical Testing</th>
                    <td style={{ padding: '0.5rem' }}><span style={{ color: getColor(ele.n_mt_status), fontWeight: 600 }}>{ele.mt_status}</span></td>
                  </tr>
                  <tr>
                    <th style={{ padding: '0.5rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Barrier Testing</th>
                    <td style={{ padding: '0.5rem' }}><span style={{ color: getColor(ele.n_bt_status), fontWeight: 600 }}>{ele.bt_status}</span></td>
                  </tr>
                  <tr>
                    <th style={{ padding: '0.5rem', fontWeight: 600, color: 'var(--text-secondary)' }}>CB Testing</th>
                    <td style={{ padding: '0.5rem' }}><span style={{ color: getColor(ele.n_cbt_status), fontWeight: 600 }}>{ele.cbt_status}</span></td>
                  </tr>
                  <tr>
                    <th style={{ padding: '0.5rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Characterization Testing</th>
                    <td style={{ padding: '0.5rem' }}><span style={{ color: getColor(ele.n_dsc_status), fontWeight: 600 }}>{ele.dsc_status}</span></td>
                  </tr>
                  <tr>
                    <th style={{ padding: '0.5rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Sealing Properties</th>
                    <td style={{ padding: '0.5rem' }}><span style={{ color: getColor(ele.n_seal_status), fontWeight: 600 }}>{ele.seal_status}</span></td>
                  </tr>
                </>
              ) : (
                <tr>
                  <th style={{ padding: '0.5rem', fontWeight: 600, color: 'var(--text-secondary)' }}>RM Material Testing</th>
                  <td style={{ padding: '0.5rem' }}><span style={{ color: getColor(ele.n_rm_status), fontWeight: 600 }}>{ele.rm_status}</span></td>
                </tr>
              )}
            </tbody>
          </table>

        </div>
      ))}
    </div>
  );
}

function LaminateListTable({ data, isLoading, isError, isSearchActive }) {
  const [expandedRows, setExpandedRows] = useState(new Set());

  const toggleRow = (id) => {
    const newSet = new Set(expandedRows);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setExpandedRows(newSet);
  };

  if (isLoading) return <CniLoader />;
  if (isError) return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--danger)' }}>Failed to load Laminate List.</div>;
  if (!data || data.length === 0) return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No Laminate records found.</div>;

  return (
    <div style={{ overflowX: 'auto' }}>
      <table className={cniStyles.cniTable}>
        <thead>
          <tr>
            <th className={cniStyles.cniTh} style={{ width: '50px', background: '#f8fafc', padding: '1rem', borderBottom: '2px solid var(--border-glass)' }}></th>
            {isSearchActive && <th className={cniStyles.cniTh} style={{ background: '#f8fafc', padding: '1rem', borderBottom: '2px solid var(--border-glass)' }}>Category</th>}
            <th className={cniStyles.cniTh} style={{ background: '#f8fafc', padding: '1rem', borderBottom: '2px solid var(--border-glass)' }}>Material Code</th>
            <th className={cniStyles.cniTh} style={{ background: '#f8fafc', padding: '1rem', borderBottom: '2px solid var(--border-glass)' }}>Remark</th>
            <th className={cniStyles.cniTh} style={{ background: '#f8fafc', padding: '1rem', borderBottom: '2px solid var(--border-glass)' }}>Initiator</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => {
            const isExpanded = expandedRows.has(row.n_mat_id);
            return (
              <React.Fragment key={row.n_mat_id}>
                <tr style={{ borderBottom: '1px solid var(--border-glass)', cursor: 'pointer' }} onClick={() => toggleRow(row.n_mat_id)}>
                  <td className={cniStyles.cniTd} style={{ textAlign: 'center', color: 'var(--primary)' }}>
                    {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                  </td>
                  {isSearchActive && <td className={cniStyles.cniTd} style={{ fontWeight: 600 }}>{row.s_categories}</td>}
                  <td className={cniStyles.cniTd} style={{ fontWeight: 500, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <a href={`/cni-lp-form?id=${row.s_mat_code}&status=${row.n_status}`} onClick={e => e.stopPropagation()} style={{ color: 'var(--primary)' }}>
                      <Eye size={16} />
                    </a>
                    {row.s_mat_code}
                  </td>
                  <td className={cniStyles.cniTd}>{row.s_sample_desc}</td>
                  <td className={cniStyles.cniTd}>{row.s_created_by}</td>
                </tr>
                {isExpanded && (
                  <tr>
                    <td colSpan={isSearchActive ? 5 : 4} style={{ padding: 0 }}>
                      <ExpandableChildRow matId={row.n_mat_id} />
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function PendingApprovalTable({ data, isLoading, isError }) {
  if (isLoading) return <CniLoader />;
  if (isError) return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--danger)' }}>Failed to load Pending Approvals.</div>;
  if (!data || data.length === 0) return null; // Legacy behavior hides the panel entirely

  const getTestLabel = (type) => {
    const map = {
      'OT': 'Optical Testing',
      'MT': 'Mechanical Testing',
      'BT': 'Barrier Testing',
      'CBT': 'CB Testing',
      'DSC': 'DSC Testing',
      'RM': 'RM Testing',
      'SEAL': 'Sealing Properties'
    };
    return map[type] || type;
  };

  return (
    <div style={{ overflowX: 'auto' }}>
      <table className={cniStyles.cniTable}>
        <thead>
          <tr>
            <th className={cniStyles.cniTh} style={{ width: '100px', background: '#f8fafc', padding: '1rem', borderBottom: '2px solid var(--border-glass)' }}>Action</th>
            <th className={cniStyles.cniTh} style={{ background: '#f8fafc', padding: '1rem', borderBottom: '2px solid var(--border-glass)' }}>Material Code</th>
            <th className={cniStyles.cniTh} style={{ background: '#f8fafc', padding: '1rem', borderBottom: '2px solid var(--border-glass)' }}>Initiator</th>
            <th className={cniStyles.cniTh} style={{ background: '#f8fafc', padding: '1rem', borderBottom: '2px solid var(--border-glass)' }}>Type</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr key={idx} style={{ borderBottom: '1px solid var(--border-glass)' }}>
              <td className={cniStyles.cniTd}>
                <a href={`/cni-lp-appoval?type=${row.n_type}&testid=${row.n_lp_id}&matid=${row.n_mat_id}`} className={cniStyles.btnPrimary} style={{ textDecoration: 'none', padding: '0.25rem 0.75rem', fontSize: '0.85rem' }}>
                  Review
                </a>
              </td>
              <td className={cniStyles.cniTd}>
                <div style={{ fontWeight: 600 }}>Mat Code: <a href={`/cni-lp-form?id=${row.s_mat_code}&status=${row.n_status}`}><Eye size={14}/></a> {row.s_mat_code}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Sample Description: {row.s_sample_desc}</div>
              </td>
              <td className={cniStyles.cniTd}>{row.s_created_by}</td>
              <td className={cniStyles.cniTd}>
                <span style={{ padding: '4px 10px', background: 'rgba(6, 43, 103, 0.1)', color: 'var(--primary)', borderRadius: '50px', fontSize: '0.85rem', fontWeight: 600 }}>
                  {getTestLabel(row.n_type)}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PendingActivityTable({ data, isLoading, isError }) {
  if (isLoading) return <div style={{ padding: '2rem', textAlign: 'center' }}><CniLoader /></div>;
  if (isError) return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--danger)' }}>Failed to load Pending Activity.</div>;
  if (!data || data.length === 0) return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No Pending Activity found.</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1rem' }}>
      {data.map((ele, idx) => (
        <div key={idx} style={{ background: 'var(--bg-tertiary)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-glass)' }}>
          <h5 style={{ margin: '0 0 0.5rem 0', fontWeight: 600 }}>
            <a href={`/cni-lp-form?id=${ele.s_mat_code}&status=${ele.n_status}`} style={{ color: 'var(--primary)', textDecoration: 'none' }}>
              Mat: {ele.s_mat_code} (DOP: {ele.d_dop})
            </a>
          </h5>
          <p style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{ele.s_sample_desc}</p>
          <div style={{ fontSize: '0.85rem', padding: '0.75rem', background: 'var(--bg-primary)', borderRadius: '4px', borderLeft: '3px solid var(--primary)' }}>
            <ul style={{ margin: 0, paddingLeft: '1rem', color: 'var(--text-primary)' }}>
              {ele.s_categories === 4 ? (
                <li>{ele.RM}</li>
              ) : (
                <>
                  <li>{ele.Ot}</li>
                  <li>{ele.Mt}</li>
                  <li>{ele.Bt}</li>
                  <li>{ele.CBt}</li>
                  <li>{ele.DSC}</li>
                  <li>{ele.SEAL}</li>
                </>
              )}
            </ul>
            <div style={{ marginTop: '0.5rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Initiator: {ele.s_created_by}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function LabOSTables({ category, categoryName, searchData, isSearchActive, isSearchLoading, isSearchError }) {
  const {
    matHeadersQuery,
    pendingApprovalQuery,
    matReportQuery,
    pendingActivityQuery
  } = useLabOS(category);

  // If search is active, the primary list renders searchData instead of matHeadersQuery
  const activeListData = isSearchActive ? searchData : matHeadersQuery.data?.data;
  const activeListLoading = isSearchActive ? isSearchLoading : matHeadersQuery.isLoading;
  const activeListError = isSearchActive ? isSearchError : matHeadersQuery.isError;
  const listTitle = isSearchActive ? "Global Search Results" : `Laminate List (${categoryName})`;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        {/* Laminate List (or Search Results) */}
        <div className={cniStyles.dashboardCard} style={{ border: 'none', boxShadow: '0 8px 30px rgba(6, 43, 103, 0.08)' }}>
          <div 
            className={cniStyles.cardHeader} 
            style={{ 
              background: 'linear-gradient(135deg, var(--primary) 0%, #0a3a8a 100%)', 
              color: 'white', 
              borderRadius: '12px 12px 0 0',
              padding: '1.25rem 1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              borderBottom: 'none'
            }}
          >
            <div style={{ background: 'rgba(255,255,255,0.1)', padding: '0.5rem', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <List size={20} color="white" />
            </div>
            <h3 className={cniStyles.cardTitle} style={{ color: 'white', margin: 0, fontSize: '1.25rem' }}>{listTitle}</h3>
          </div>
          <LaminateListTable data={activeListData} isLoading={activeListLoading} isError={activeListError} isSearchActive={isSearchActive} />
        </div>

        {/* Pending Approval */}
        {(!pendingApprovalQuery.isLoading && pendingApprovalQuery.data?.data?.length > 0) && (
          <div className={cniStyles.dashboardCard} style={{ border: 'none', boxShadow: '0 8px 30px rgba(6, 43, 103, 0.08)' }}>
            <div 
              className={cniStyles.cardHeader} 
              style={{ 
                background: 'linear-gradient(135deg, var(--primary) 0%, #0a3a8a 100%)', 
                color: 'white', 
                borderRadius: '12px 12px 0 0',
                padding: '1.25rem 1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                borderBottom: 'none'
              }}
            >
              <div style={{ background: 'rgba(255,255,255,0.1)', padding: '0.5rem', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CheckCircle size={20} color="white" />
              </div>
              <h3 className={cniStyles.cardTitle} style={{ color: 'white', margin: 0, fontSize: '1.25rem' }}>Pending for Approval ({categoryName})</h3>
            </div>
            <PendingApprovalTable data={pendingApprovalQuery.data?.data} isLoading={pendingApprovalQuery.isLoading} isError={pendingApprovalQuery.isError} />
          </div>
        )}

        {/* Project List / Report List */}
        <div className={cniStyles.dashboardCard} style={{ border: 'none', boxShadow: '0 8px 30px rgba(6, 43, 103, 0.08)' }}>
          <div 
            className={cniStyles.cardHeader} 
            style={{ 
              background: 'linear-gradient(135deg, var(--primary) 0%, #0a3a8a 100%)', 
              color: 'white', 
              borderRadius: '12px 12px 0 0',
              padding: '1.25rem 1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              borderBottom: 'none'
            }}
          >
            <div style={{ background: 'rgba(255,255,255,0.1)', padding: '0.5rem', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FolderOpen size={20} color="white" />
            </div>
            <h3 className={cniStyles.cardTitle} style={{ color: 'white', margin: 0, fontSize: '1.25rem' }}>Project List ({categoryName})</h3>
          </div>
          <LaminateListTable data={matReportQuery.data?.data} isLoading={matReportQuery.isLoading} isError={matReportQuery.isError} categoryName={categoryName} />
        </div>

      </div>

      {/* Sidebar: Pending Activity */}
      <div className={cniStyles.dashboardCard} style={{ border: 'none', boxShadow: '0 8px 30px rgba(6, 43, 103, 0.08)' }}>
        <div 
          className={cniStyles.cardHeader} 
          style={{ 
            background: 'linear-gradient(135deg, var(--primary) 0%, #0a3a8a 100%)', 
            color: 'white', 
            borderRadius: '12px 12px 0 0',
            padding: '1.25rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            borderBottom: 'none'
          }}
        >
          <div style={{ background: 'rgba(255,255,255,0.1)', padding: '0.5rem', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Activity size={20} color="white" />
          </div>
          <h3 className={cniStyles.cardTitle} style={{ color: 'white', margin: 0, fontSize: '1.25rem' }}>Pending Activity</h3>
        </div>
        <div style={{ maxHeight: '800px', overflowY: 'auto' }}>
          <PendingActivityTable data={pendingActivityQuery.data?.data} isLoading={pendingActivityQuery.isLoading} isError={pendingActivityQuery.isError} />
        </div>
      </div>

    </div>
  );
}
