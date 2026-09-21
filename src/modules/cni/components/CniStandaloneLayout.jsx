import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { User, LogOut, ChevronDown } from 'lucide-react';
import styles from '../../../pages/main.module.css';

export function CniStandaloneLayout() {
  const navigate = useNavigate();
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState('');
  
  const uid = localStorage.getItem('uid') || 'admin@eplglobal.com';

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleString());
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/auth/login');
  };

  const handleDMSSubmit = (e) => {
    e.preventDefault();
    const loginId = localStorage.getItem('loginId') || 'admin';
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = 'https://entgra.eplglobal.com/epdms/op/op.Login.php';
    form.target = '_blank';

    const loginInput = document.createElement('input');
    loginInput.type = 'hidden';
    loginInput.name = 'login';
    loginInput.value = loginId;
    form.appendChild(loginInput);

    const pwdInput = document.createElement('input');
    pwdInput.type = 'hidden';
    pwdInput.name = 'pwd';
    pwdInput.value = '123Admin%^&QWERASDFzxcv';
    form.appendChild(pwdInput);

    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
  };

  const handleLaunchSoon = (e) => {
    e.preventDefault();
    alert('Launching Soon!');
  };

  return (
    <div className={styles.portalContainer} style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Home Page Exact Header */}
      <header className={styles.portalHeader}>
        <div className={styles.portalBrand} style={{ cursor: 'pointer' }} onClick={() => navigate('/main')}>
          <img src="/img/Logo1-EpConnect.jpg" alt="EP Connect Logo" className={styles.portalLogoImg} />
          <div>
            <h1 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--primary)', margin: 0 }}>ENTGRA</h1>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>EPL Business Workflow Systems</span>
          </div>
        </div>

        {/* Mobile menu toggle */}
        <button 
          className="d-lg-none"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          style={{ background: 'none', border: '1px solid var(--border-glass)', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer' }}
        >
          <span style={{ display: 'block', width: '20px', height: '2px', backgroundColor: '#333', margin: '4px 0' }}></span>
          <span style={{ display: 'block', width: '20px', height: '2px', backgroundColor: '#333', margin: '4px 0' }}></span>
          <span style={{ display: 'block', width: '20px', height: '2px', backgroundColor: '#333', margin: '4px 0' }}></span>
        </button>

        {/* Header Navigation Link Items */}
        <nav className={`${styles.portalNavBar} ${mobileMenuOpen ? styles.open : ''}`}>
          <button onClick={() => navigate('/main')} className="btn" style={{ background: '#EAF2FC', border: 'none', padding: '8px 16px', borderRadius: '50px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary)', cursor: 'pointer', marginRight: '5px' }}>
            Main Portal
          </button>
          
          <button onClick={handleDMSSubmit} className="btn" style={{ background: '#EAF2FC', border: 'none', padding: '8px 16px', borderRadius: '50px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary)', cursor: 'pointer' }}>
            Document Management System
          </button>
          
          <a href="/bpmn/idea_discussion_list" className="btn" style={{ background: '#EAF2FC', border: 'none', padding: '8px 16px', borderRadius: '50px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary)', textDecoration: 'none' }}>
            War on Waste - Idea Portal
          </a>

          <a href="/bpmn/epl-current-year-survey" className="btn" style={{ background: '#EAF2FC', border: 'none', padding: '8px 16px', borderRadius: '50px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary)', textDecoration: 'none' }}>
            Survey on Return to Work
          </a>

          {/* Activities Dropdown */}
          <div 
            style={{ position: 'relative' }}
            onMouseEnter={() => setActiveDropdown('activities')}
            onMouseLeave={() => setActiveDropdown(null)}
          >
            <button className="btn" style={{ background: '#EAF2FC', border: 'none', padding: '8px 16px', borderRadius: '50px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
              Activities <ChevronDown size={14} />
            </button>
            
            {activeDropdown === 'activities' && (
              <div style={{ position: 'absolute', top: '100%', right: 0, width: '240px', background: '#FFFFFF', border: '1px solid var(--border-glass)', borderRadius: '8px', boxShadow: '0 4px 15px rgba(6, 43, 103, 0.08)', zIndex: 100, padding: '0.5rem 0' }}>
                <a href="/bpmn/dms_access_ids" className={styles.dropdownHoverItem}>DMS Access Portal</a>
                <a href="/bpmn/speakUp_list" className={styles.dropdownHoverItem}>Speak Up List</a>
                <a href="/bpmn/194q_dash" className={styles.dropdownHoverItem}>194Q Dashboard</a>
                <a href="/bpmn/rmdm_main" className={styles.dropdownHoverItem}>RMDM Process</a>
                <a href="#" onClick={handleLaunchSoon} className={styles.dropdownHoverItem}>Supplier Quality</a>
                <a href="#" onClick={handleLaunchSoon} className={styles.dropdownHoverItem}>Internal Quality</a>
                <a href="/bpmn/nbd_taskList_Old" className={styles.dropdownHoverItem}>Business Dev Old</a>
                <a href="/bpmn/query_resolution" className={styles.dropdownHoverItem}>Query Resolution</a>
              </div>
            )}
          </div>
        </nav>

        {/* User profile with logout dropdown */}
        <div 
          style={{ position: 'relative' }}
          onMouseEnter={() => setActiveDropdown('profile')}
          onMouseLeave={() => setActiveDropdown(null)}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', border: '1px solid var(--border-glass)', padding: '6px 12px', borderRadius: '50px', background: 'var(--bg-tertiary)' }}>
            <User size={16} color="var(--primary)" />
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--primary)' }}>{uid.split('@')[0]}</span>
            <ChevronDown size={14} color="var(--primary)" />
          </div>

          {activeDropdown === 'profile' && (
            <div style={{ position: 'absolute', top: '100%', right: 0, width: '150px', background: '#FFFFFF', border: '1px solid var(--border-glass)', borderRadius: '8px', boxShadow: '0 4px 15px rgba(6, 43, 103, 0.08)', zIndex: 100, padding: '0.5rem 0' }}>
              <button onClick={handleLogout} style={{ width: '100%', background: 'none', border: 'none', padding: '0.5rem 1rem', fontSize: '0.8rem', color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', textAlign: 'left' }}>
                <LogOut size={14} /> Log out
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '20px' }}>
        <Outlet />
      </main>

      {/* Home Page Exact Footer */}
      <footer className={styles.portalFooter} style={{ marginTop: 'auto' }}>
        <div className="container-fluid" style={{ padding: '15px 30px' }}>
          <div className="row" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: '#a0aec0' }}>
            <div style={{ textAlign: 'left' }}>
              Local System Time: <i style={{ fontWeight: 600, color: '#FFFFFF' }}>{currentTime || 'Loading...'}</i> (local timezone)
            </div>
            <div style={{ textAlign: 'center' }}>
              Support and maintain by <i><a href="https://kosqu.com/" target="_blank" rel="noreferrer" style={{ color: 'var(--secondary)', textDecoration: 'none', fontWeight: 600 }}>KOSQU</a></i>
            </div>
            <div style={{ textAlign: 'right' }}>
              Powered by <a href="/bpmn" style={{ color: '#FFFFFF', textDecoration: 'none', fontWeight: 600 }}>Essel BPMN v2.0</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
