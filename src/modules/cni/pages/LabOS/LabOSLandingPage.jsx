import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, List, FileBarChart, PieChart, FlaskConical } from 'lucide-react';
import cniStyles from '../../styles/cni-premium.module.css';

export function LabOSLandingPage() {
  const navigate = useNavigate();

  const navigateLegacy = (url) => {
    // Preserves native links to existing legacy forms until they are migrated
    window.location.href = url;
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      
      {/* Hero Section */}
      <div className={cniStyles.dashboardCard} style={{ marginBottom: '2rem' }}>
        <div className={cniStyles.cardHeader} style={{ borderBottom: 'none', paddingBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <FlaskConical size={32} style={{ color: 'var(--primary)' }} />
          <div>
            <h2 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--text-primary)' }}>Creativity & Innovation</h2>
            <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Laminate Property</h3>
          </div>
        </div>
        
        {/* Quick Actions (Legacy Destinations) */}
        <div className={cniStyles.cardBody} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginTop: '1rem' }}>
          
          <div 
            onClick={() => navigate('/cni/labos/form')}
            style={{ padding: '1.5rem', background: 'var(--bg-tertiary)', borderRadius: '12px', border: '1px solid var(--border-glass)', cursor: 'pointer', transition: 'all 0.2s ease', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '1rem' }}
            onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
            onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--border-glass)'}
          >
            <div style={{ background: 'rgba(6, 43, 103, 0.1)', padding: '1rem', borderRadius: '50%' }}>
              <Plus size={28} style={{ color: 'var(--primary)' }} />
            </div>
            <div>
              <h4 style={{ margin: '0 0 0.5rem 0', fontWeight: 600 }}>New Test</h4>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Create and manage your own tests.</p>
            </div>
          </div>

          <div 
            onClick={() => navigate('/cni/labos/projects')}
            style={{ padding: '1.5rem', background: 'var(--bg-tertiary)', borderRadius: '12px', border: '1px solid var(--border-glass)', cursor: 'pointer', transition: 'all 0.2s ease', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '1rem' }}
            onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
            onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--border-glass)'}
          >
            <div style={{ background: 'rgba(6, 43, 103, 0.1)', padding: '1rem', borderRadius: '50%' }}>
              <List size={28} style={{ color: 'var(--primary)' }} />
            </div>
            <div>
              <h4 style={{ margin: '0 0 0.5rem 0', fontWeight: 600 }}>Project List</h4>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Browse and view current and past projects.</p>
            </div>
          </div>

          <div 
            onClick={() => navigate('/cni/labos/summary')}
            style={{ padding: '1.5rem', background: 'var(--bg-tertiary)', borderRadius: '12px', border: '1px solid var(--border-glass)', cursor: 'pointer', transition: 'all 0.2s ease', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '1rem' }}
            onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
            onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--border-glass)'}
          >
            <div style={{ background: 'rgba(6, 43, 103, 0.1)', padding: '1rem', borderRadius: '50%' }}>
              <FileBarChart size={28} style={{ color: 'var(--primary)' }} />
            </div>
            <div>
              <h4 style={{ margin: '0 0 0.5rem 0', fontWeight: 600 }}>Summary</h4>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Comprehensive overview of projects.</p>
            </div>
          </div>

          <div 
            onClick={() => navigate('/cni/labos/analytics')}
            style={{ padding: '1.5rem', background: 'var(--bg-tertiary)', borderRadius: '12px', border: '1px solid var(--border-glass)', cursor: 'pointer', transition: 'all 0.2s ease', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '1rem' }}
            onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
            onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--border-glass)'}
          >
            <div style={{ background: 'rgba(6, 43, 103, 0.1)', padding: '1rem', borderRadius: '50%' }}>
              <PieChart size={28} style={{ color: 'var(--primary)' }} />
            </div>
            <div>
              <h4 style={{ margin: '0 0 0.5rem 0', fontWeight: 600 }}>Analytics</h4>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Detailed insights and visual graphs.</p>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
