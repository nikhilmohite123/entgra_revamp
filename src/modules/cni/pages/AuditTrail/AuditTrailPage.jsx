import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuditTrail } from '../../hooks/useAuditTrail';
import { CniLoader, CniError } from '../../components/common';
import { useCniPermissions } from '../../hooks/useCniPermissions';
import { ArrowLeft, Clock, Activity } from 'lucide-react';
import cniStyles from '../../styles/cni-premium.module.css';

export function AuditTrailPage() {
  const { projectId, empId } = useParams();
  const navigate = useNavigate();
  const { user } = useCniPermissions();
  
  const { data: auditTrails, isLoading, isError, error } = useAuditTrail(projectId);

  if (isLoading) return <CniLoader />;
  if (isError) return <CniError message={error.message} />;

  return (
    <div className={`container-fluid ${cniStyles.cniContainer}`} style={{ padding: '2.5rem', background: 'linear-gradient(135deg, #f8fafd 0%, #f1f5f9 100%)', minHeight: '100vh' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', background: '#ffffff', padding: '1.5rem 2rem', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)', padding: '0.75rem', borderRadius: '10px', boxShadow: '0 4px 10px rgba(26, 92, 255, 0.2)' }}>
            <Activity size={24} color="white" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
              Project Audit Trail
            </h1>
            <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.9rem', fontWeight: 500 }}>
              Project ID: {projectId}
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          {empId && (
            <div style={{ padding: '0.5rem 1rem', background: '#fef3c7', color: '#92400e', borderRadius: '20px', fontWeight: 600, fontSize: '0.85rem' }}>
              Action Pending: {empId}
            </div>
          )}
          <button 
            className={cniStyles.btnSecondary} 
            onClick={() => navigate('/cni/stages')}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <ArrowLeft size={16} /> Back to Dashboard
          </button>
        </div>
      </div>

      {/* Main Table Card */}
      <div className={cniStyles.dashboardCard} style={{ overflow: 'hidden', border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.05)', borderRadius: '16px', background: '#ffffff' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className={cniStyles.table} style={{ margin: 0, border: 'none', width: '100%' }}>
            <thead style={{ background: '#f4f7f9', borderBottom: '2px solid #e2e8f0' }}>
              <tr>
                <th style={{ borderTop: 'none', borderBottom: 'none', color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.8px', padding: '1rem 1.5rem', fontWeight: 700 }}>Approval</th>
                <th style={{ borderTop: 'none', borderBottom: 'none', color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.8px', padding: '1rem 1.5rem', fontWeight: 700 }}>Remark</th>
                <th style={{ borderTop: 'none', borderBottom: 'none', color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.8px', padding: '1rem 1.5rem', fontWeight: 700 }}>Status</th>
                <th style={{ borderTop: 'none', borderBottom: 'none', color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.8px', padding: '1rem 1.5rem', fontWeight: 700 }}>Tag</th>
                <th style={{ borderTop: 'none', borderBottom: 'none', color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.8px', padding: '1rem 1.5rem', fontWeight: 700 }}>Date</th>
              </tr>
            </thead>
            <tbody>
              {auditTrails.map((y, index) => (
                <tr key={index}>
                  <td style={{ fontWeight: 600, color: 'var(--primary)' }}>{y.s_employee_id}</td>
                  <td>{y.remark}</td>
                  <td>
                    <span style={{ 
                      padding: '0.25rem 0.75rem', 
                      background: y.status?.toLowerCase().includes('reject') ? '#fee2e2' : '#dcfce7', 
                      color: y.status?.toLowerCase().includes('reject') ? '#991b1b' : '#166534', 
                      borderRadius: '20px', 
                      fontSize: '0.8rem', 
                      fontWeight: 600 
                    }}>
                      {y.status}
                    </span>
                  </td>
                  <td><span style={{ padding: '0.2rem 0.6rem', background: '#f1f5f9', borderRadius: '4px', fontSize: '0.85rem' }}>{y.s_tag}</span></td>
                  <td style={{ color: 'var(--text-secondary)' }}>{y.currentDate}</td>
                </tr>
              ))}
              {auditTrails.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-secondary)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                      <Clock size={48} opacity={0.2} />
                      <span style={{ fontSize: '1rem', fontWeight: 500 }}>No audit records found for this project.</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
