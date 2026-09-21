import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Book, LayoutDashboard, Shield, FileText, Database, ArrowRight } from 'lucide-react';
import styles from '../../styles/cni-premium.module.css';

export function CniLandingPage() {
  const navigate = useNavigate();
  const uid = localStorage.getItem('uid') || '';
  const [showPatentDetails, setShowPatentDetails] = useState(false);

  useEffect(() => {
    // Legacy hardcoded auth list for patent dashboard
    const auth_Person = ["shubhangi.avhad", "hariharan.k", "gurunath.pv", "kavita.shepal", "satish.biradar"];
    if (auth_Person.includes(uid)) {
      setShowPatentDetails(true);
    }
  }, [uid]);

  const cards = [
    {
      title: 'D-STAGE',
      description: 'Project re-engineering workflow console.',
      icon: <Book size={32} color="var(--primary)" />,
      onClick: () => navigate('/cni/stages'),
    },
    {
      title: 'T-SITE',
      description: 'Regulatory Dashboard & commercial laminates.',
      icon: <LayoutDashboard size={32} color="var(--primary)" />,
      onClick: () => navigate('/cni/dashboard'),
    },
    {
      title: 'LabOS',
      description: 'Laboratory management operations.',
      icon: <Database size={32} color="var(--primary)" />,
      onClick: () => navigate('/cni/labos'),
    },
    {
      title: 'Log-Management',
      description: 'System event logs and audit trails.',
      icon: <FileText size={32} color="var(--primary)" />,
      onClick: () => navigate('/cni/logs'),
    },
    {
      title: 'Patent Dashboard',
      description: 'Manage intellectual property workflows.',
      icon: <Shield size={32} color="var(--primary)" />,
      onClick: () => {},
      isPatent: true
    }
  ];

  return (
    <div className={`container ${styles.cniContainer}`} style={{ marginTop: '2rem', paddingBottom: '3rem' }}>
      
      {/* Premium Hero Section */}
      <div className={styles.hero} style={{ marginBottom: '2.5rem' }}>
        <h1 className={styles.heroTitle}>Creativity & Innovation Hub</h1>
        <p className={styles.heroSubtitle}>
          Select a specialized module below to access project workflows, laboratory management, and regulatory dashboards.
        </p>
      </div>

      {/* Module Grid */}
      <div className={styles.gridCards}>
        {cards.map((card, index) => (
          <div 
            key={index} 
            className={`${styles.surface} ${styles.surfaceHover}`}
            style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              padding: '1.5rem',
              cursor: card.isPatent && !showPatentDetails ? 'not-allowed' : 'pointer',
              opacity: card.isPatent && !showPatentDetails ? 0.6 : 1,
              position: 'relative',
              overflow: 'hidden'
            }}
            onClick={(!card.isPatent || showPatentDetails) ? card.onClick : undefined}
          >
            {/* Top Icon & Title */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{ background: 'var(--primary-light)', padding: '12px', borderRadius: '12px' }}>
                {card.icon}
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--primary)', margin: 0 }}>
                {card.title}
              </h3>
            </div>
            
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', flex: 1 }}>
              {card.description}
            </p>

            {/* Bottom Actions */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-glass)', paddingTop: '1rem', marginTop: 'auto' }}>
              {card.isPatent && showPatentDetails ? (
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <a 
                    href="https://entgra.eplglobal.com/epdms/out/out.ViewFolder.php?folderid=5417&showtree=1" 
                    target="_blank" 
                    rel="noreferrer"
                    className={styles.btnSecondary}
                    onClick={(e) => e.stopPropagation()}
                  >
                    File Upload
                  </a>
                  <a 
                    href="https://entgra.eplglobal.com/epdms/out/patent_dash.html" 
                    target="_blank" 
                    rel="noreferrer"
                    className={styles.btnPrimary}
                    onClick={(e) => e.stopPropagation()}
                  >
                    Summary <ArrowRight size={16} />
                  </a>
                </div>
              ) : (
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {card.isPatent && !showPatentDetails ? 'Restricted Access' : 'Launch Module'} 
                  {(!card.isPatent || showPatentDetails) && <ArrowRight size={16} />}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
