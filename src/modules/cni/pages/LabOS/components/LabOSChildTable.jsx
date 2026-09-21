import React from 'react';
import { Edit2, Trash2, ClipboardList } from 'lucide-react';
import { useLabOSMutations } from '../../../hooks/useLabOS';
import cniStyles from '../../../styles/cni-premium.module.css';

export function LabOSChildTable({ data, isLoading, isError, onEdit, isEditable }) {
  const { deleteMatChildMutation } = useLabOSMutations();

  const handleDelete = async (id) => {
    if (window.confirm("Do you really want to Delete the Record ? ")) {
      try {
        await deleteMatChildMutation.mutateAsync(id);
        alert("Record Deleted Successfully.");
      } catch (error) {
        alert("Failed to delete record.");
      }
    }
  };

  if (isLoading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading Lab Samples...</div>;
  }

  if (isError) {
    return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--danger)' }}>Failed to load Lab Samples.</div>;
  }

  if (!data || data.length === 0) {
    return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No Lab Samples found.</div>;
  }

  return (
    <div className={cniStyles.dashboardCard} style={{ marginBottom: '2rem', border: 'none', boxShadow: '0 8px 30px rgba(6, 43, 103, 0.08)' }}>
      <div 
        className={cniStyles.cardHeader} 
        style={{ 
          background: 'linear-gradient(135deg, var(--primary) 0%, #0a3a8a 100%)', 
          color: 'white', 
          borderRadius: '12px 12px 0 0',
          padding: '1.25rem 2rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          borderBottom: 'none'
        }}
      >
        <div style={{ background: 'rgba(255,255,255,0.1)', padding: '0.6rem', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ClipboardList size={22} color="white" />
        </div>
        <div>
          <h3 className={cniStyles.cardTitle} style={{ color: 'white', fontSize: '1.3rem', marginBottom: '0.2rem' }}>
            Existing Lab Samples
          </h3>
          <p style={{ margin: 0, color: 'rgba(255,255,255,0.8)', fontSize: '0.85rem' }}>
            Manage the lab samples associated with this Master Material.
          </p>
        </div>
      </div>
      <div className={cniStyles.cardBody} style={{ padding: '1rem', overflowX: 'auto' }}>
        <table className={cniStyles.cniTable} style={{ margin: 0, width: '100%' }}>
          <thead>
            <tr>
              <th className={cniStyles.cniTh} style={{ background: '#f8fafc', padding: '1rem', borderBottom: '2px solid var(--border-glass)' }}>Lab Sample ID</th>
              <th className={cniStyles.cniTh} style={{ background: '#f8fafc', padding: '1rem', borderBottom: '2px solid var(--border-glass)' }}>DOP</th>
              <th className={cniStyles.cniTh} style={{ background: '#f8fafc', padding: '1rem', borderBottom: '2px solid var(--border-glass)' }}>Description</th>
              <th className={cniStyles.cniTh} style={{ background: '#f8fafc', padding: '1rem', borderBottom: '2px solid var(--border-glass)', width: '120px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.n_lp_id} style={{ borderBottom: '1px solid var(--border-glass)' }}>
                <td className={cniStyles.cniTd} style={{ color: 'var(--primary)', fontWeight: 600 }}>{row.s_lab_sample_id}</td>
                <td className={cniStyles.cniTd}>{row.d_dop}</td>
                <td className={cniStyles.cniTd}>{row.s_sample_desc_lab_sample || '--'}</td>
                <td className={cniStyles.cniTd}>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button 
                      onClick={() => onEdit(row)}
                      className={cniStyles.btnSecondary} 
                      style={{ padding: '0.25rem 0.5rem', background: 'var(--bg-primary)' }}
                      title={!isEditable ? "Editing is disabled after all testing categories are submitted." : "Edit"}
                      disabled={!isEditable}
                    >
                      <Edit2 size={14} color={isEditable ? "var(--primary)" : "var(--text-tertiary)"} />
                    </button>
                    <button 
                      onClick={() => handleDelete(row.n_lp_id)}
                      className={cniStyles.btnSecondary} 
                      style={{ padding: '0.25rem 0.5rem', background: 'var(--bg-primary)' }}
                      title="Delete"
                    >
                      <Trash2 size={14} color="var(--danger)" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
