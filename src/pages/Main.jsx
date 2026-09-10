import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, FileSpreadsheet, Briefcase, Shield, ShieldAlert, Layers, Clock, 
  Activity, CheckCircle, HardDrive, Calendar, BarChart3, Database, FileText, 
  DollarSign, Lightbulb, ClipboardList, LogOut, ChevronDown, User, Info, Users, Award
} from 'lucide-react';
import styles from './main.module.css';

const ACTIVE_MODULES = [
  { id: 'sdd', name: 'SDD MODULE', path: '/bpmn/sddmodule', icon: FileSpreadsheet, color: '#63B52F', desc: 'Manage spreadsheets and process worksheets.' },
  { id: 'bd', name: 'BUSINESS DEVELOPMENT', path: '/bpmn/nbd_taskList', icon: Briefcase, color: '#062B67', desc: 'Track deals, negotiations, and partner tasks.' },
  { id: 'eaims', name: 'eAIMS', path: '/bpmn/task-workflow#/legal-workflow_list', icon: Shield, color: '#062B67', desc: 'Legal and administrative process manager.' },
  { id: 'safety', name: 'SAFETY PORTAL', path: '/bpmn/safety', icon: ShieldAlert, color: '#DC3545', desc: 'Log safety audits, event alerts, and logs.' },
  { id: 'ehs', name: 'EHS PORTAL', path: '/bpmn/ehs/', icon: Layers, color: '#63B52F', desc: 'Environment, Health, and Safety metrics.' },
  { id: 'ot', name: 'OVERTIME PROCESS', path: '/bpmn/ot_main', icon: Clock, color: '#F59E0B', desc: 'Record and approve operational overtime.' },
  { id: 'phoenix', name: 'PHOENIX PROCESS', path: '/bpmn/phoenix-project-list', icon: Activity, color: '#062B67', desc: 'Project re-engineering workflow console.' },
  { id: 'quality', name: 'QUALITY PROCESS', path: '/bpmn/quality_main', icon: CheckCircle, color: '#63B52F', desc: 'Audit logs, reports, and QA checklists.' },
  { id: 'hmp_gmp', name: 'HMP & GMP', isSplit: true, path1: 'https://entgra.eplglobal.com/epdms/out/out.ViewFolder.php?folderid=43&showtree=1', path2: 'https://entgra.eplglobal.com/epdms/out/out.ViewFolder.php?folderid=64', icon: HardDrive, color: '#062B67', desc: 'Access standard HMP and GMP folder systems.' },
  { id: 'cni', name: 'C&I MODULE', path: '/bpmn/CNI_Module', icon: Calendar, color: '#062B67', desc: 'Creativity and Innovation tracker board.' },
  { id: 'monthly', name: 'MONTHLY ACTIVITIES', path: '/bpmn/mainAccountpg', icon: BarChart3, color: '#062B67', desc: 'Manage accounting tasks and monthly sheets.' },
  { id: 'atr', name: 'ATR PORTAL', path: '/bpmn/dashboard', icon: Database, color: '#63B52F', desc: 'Database telemetry and ATR system reviews.' },
  { id: 'danville', name: 'CUSTOMER COMPLAINT DANVILLE', path: '/bpmn/cust_complaint', icon: ShieldAlert, color: '#DC3545', desc: 'Review Danville customer complaints.' },
  { id: 'npd', name: 'NPD TOOL', path: '/bpmn/npdtrack_landing_page', icon: FileText, color: '#062B67', desc: 'New Product Development tracking console.' },
  { id: 'wcc', name: 'WORK COMPLETION CERTIFICATE', path: '/bpmn/work_complation', icon: FileText, color: '#062B67', desc: 'Generate and sign completion reports.' },
  { id: 'vendor', name: 'VENDOR ADVANCE PAYMENT', path: '/bpmn/vendor_form', icon: DollarSign, color: '#F59E0B', desc: 'Approve vendor advanced payment forms.' },
  { id: 'idea', name: 'IDEA HUB', path: '/idea_hub', icon: Lightbulb, color: '#63B52F', desc: 'Share ideas, comments, and project brainstorming.' },
  { id: 'sample', name: 'SAMPLE REQUEST', path: '/sample_list', icon: ClipboardList, color: '#062B67', desc: 'Request and track product trial samples.' }
];

const INACTIVE_MODULES = [
  { id: 'audit', name: 'AUDIT TRACKER', path: '/bpmn/Audit_tracker/', icon: ClipboardList, desc: 'Tracks systems compliance audits.' },
  { id: 'speakup', name: 'SPEAK UP', path: '/bpmn/Speakup', icon: ShieldAlert, desc: 'Corporate reporting and helpline.' },
  { id: 'enquiry', name: 'CUST ENQUIRY TRACKER', path: '/bpmn/enquiry_list', icon: ClipboardList, desc: 'Log customer requests.' },
  { id: 'engg', name: 'ENGINEERING DRAWING', path: '/bpmn/task-workflow#/engDrawing', icon: FileText, desc: 'Product schematics viewer.' },
  { id: 'expense', name: 'EXPENSE PROCESS', path: '/bpmn/task-workflow#/eprocessList', icon: DollarSign, desc: 'Approve expense claims.' },
  { id: 'townhall', name: 'GLOBAL TOWN HALL FEEDBACK', path: '/bpmn/NEW_SURVEY', icon: FileText, desc: 'Feedback surveys.' },
  { id: 'insurance', name: 'INSURANCE PROCESS', path: '/inspro', icon: Shield, desc: 'Manage assets insurance.' },
  { id: 'litigation', name: 'LITIGATION MANAGEMENT', path: '/bpmn/litigation-epp#/litigation-main', icon: Shield, desc: 'Legal claims logs.' },
  { id: 'majorcust', name: 'MAJOR CUST DEVELOP', path: '/bpmn/major_dev_process', icon: Users, desc: 'Track key client upgrades.' },
  { id: 'nps', name: 'NPS', path: '/bpmn/NPS/', icon: Award, desc: 'Net Promoter Score tracker.' },
  { id: 'pi_eval', name: 'PI EVALUATION', path: '/bpmn/PI_evaluation', icon: BarChart3, desc: 'Performance appraisal portal.' },
  { id: 'tasklist', name: 'TASKLIST', path: '/bpmn/task-workflow#/listTask', icon: ClipboardList, desc: 'Standard workflow checklist.' },
  { id: 'meeting', name: 'MEETING MANAGEMENT', path: '/bpmn/meet-SOP', icon: Calendar, desc: 'Schedule and manage SOPs.' },
  { id: 'videos', name: 'CORPORATE VIDEOS', path: '/bpmn/corporate', icon: Activity, desc: 'Training media logs.' }
];

export default function Main() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAll, setShowAll] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState('');
  
  // Verify session on component mount
  const uid = localStorage.getItem('uid') || 'admin@eplglobal.com';

  useEffect(() => {
    // If no authenticated user, redirect back to login
    const authUser = localStorage.getItem('auth_user');
    if (!authUser && !localStorage.getItem('uid')) {
      navigate('/auth/login');
    }
  }, [navigate]);

  // Handle Live Local Clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleString());
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Filter Modules
  const filteredActive = ACTIVE_MODULES.filter(mod => 
    mod.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mod.desc.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredInactive = INACTIVE_MODULES.filter(mod =>
    mod.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mod.desc.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleLogout = () => {
    localStorage.clear();
    navigate('/auth/login');
  };

  const handleLaunchSoon = (e) => {
    e.preventDefault();
    setIsModalOpen(true);
  };

  // Submit simulated Document Management System PHP form
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

  return (
    <div className={styles.portalContainer}>
      
      {/* 1. Header Section */}
      <header className={styles.portalHeader}>
        <div className={styles.portalBrand}>
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

      {/* 2. Main Portal Title & Toolbar Section */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--primary)', margin: 0 }}>
            Business Process & Document Management System
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Access all verified process units, documents, and compliance tracking cards below.
          </p>
        </div>

        {/* Toolbar: Search input and toggle options */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FFFFFF', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-glass)' }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: '360px' }}>
            <span style={{ position: 'absolute', top: '12px', left: 14, color: 'var(--text-secondary)' }}>
              <Search size={16} />
            </span>
            <input 
              type="text" 
              placeholder="Search business processes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%', padding: '8px 12px 8px 38px', borderRadius: '50px', border: '1px solid var(--border-glass)', outline: 'none', fontSize: '0.85rem' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Active Modules ({filteredActive.length})</span>
            <button 
              onClick={() => setShowAll(!showAll)}
              className="btn"
              style={{
                backgroundColor: showAll ? 'var(--primary)' : '#FFFFFF',
                color: showAll ? '#FFFFFF' : 'var(--primary)',
                border: '1px solid var(--primary)',
                padding: '8px 16px',
                borderRadius: '50px',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: '0.2s'
              }}
            >
              {showAll ? 'Hide Inactive Processes' : 'Show All Processes'}
            </button>
          </div>
        </div>
      </section>

      {/* 3. Cards Grid */}
      <main style={{ marginTop: '1.5rem', flex: 1 }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <CheckCircle size={16} color="var(--secondary)" /> Active Operations
        </h3>
        
        {/* Active Modules Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.25rem' }}>
          {filteredActive.map((mod) => {
            const IconComponent = mod.icon;
            
            if (mod.isSplit) {
              // Specialized HMP & GMP double-link card
              return (
                <div key={mod.id} className={styles.portalCard} style={{ borderTop: `4px solid ${mod.color}`, padding: '1.25rem', height: '185px', justifyContent: 'space-between', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ backgroundColor: 'var(--bg-primary)', padding: '8px', borderRadius: '8px', color: mod.color }}>
                      <IconComponent size={22} />
                    </div>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>{mod.name}</span>
                  </div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '8px 0', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{mod.desc}</p>
                  <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
                    <a href={mod.path1} target="_blank" rel="noreferrer" className="btn" style={{ flex: 1, textDecoration: 'none', background: 'var(--primary-light)', color: 'var(--primary)', padding: '6px', fontSize: '0.75rem', fontWeight: 700, borderRadius: '6px', textAlign: 'center' }}>
                      Access HMP
                    </a>
                    <a href={mod.path2} target="_blank" rel="noreferrer" className="btn" style={{ flex: 1, textDecoration: 'none', background: 'var(--primary-light)', color: 'var(--primary)', padding: '6px', fontSize: '0.75rem', fontWeight: 700, borderRadius: '6px', textAlign: 'center' }}>
                      Access GMP
                    </a>
                  </div>
                </div>
              );
            }

            return (
              <a key={mod.id} href={mod.path} style={{ textDecoration: 'none' }}>
                <div className={styles.portalCard} style={{ borderTop: `4px solid ${mod.color}`, padding: '1.25rem', height: '185px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ backgroundColor: 'var(--bg-primary)', padding: '8px', borderRadius: '8px', color: mod.color }}>
                      <IconComponent size={22} />
                    </div>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>{mod.name}</span>
                  </div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '8px 0', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{mod.desc}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 700, marginTop: 'auto' }}>
                    <span>Launch console</span>
                    <ChevronDown size={12} style={{ transform: 'rotate(-90deg)' }} />
                  </div>
                </div>
              </a>
            );
          })}
        </div>

        {/* 4. toggled Inactive Modules Section */}
        {showAll && (
          <div style={{ marginTop: '2.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Info size={16} /> Maintenance & Pipeline Operations
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.25rem', opacity: 0.85 }}>
              {filteredInactive.map((mod) => {
                const IconComponent = mod.icon;
                return (
                  <a key={mod.id} href="#" onClick={handleLaunchSoon} style={{ textDecoration: 'none' }}>
                    <div className={styles.portalCard} style={{ borderTop: `4px solid var(--text-muted)`, padding: '1.25rem', height: '185px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', backgroundColor: 'rgba(255,255,255,0.7)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ backgroundColor: 'var(--bg-primary)', padding: '8px', borderRadius: '8px', color: 'var(--text-muted)' }}>
                          <IconComponent size={22} />
                        </div>
                        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)' }}>{mod.name}</span>
                      </div>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '8px 0', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{mod.desc}</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, marginTop: 'auto' }}>
                        <span style={{ background: '#EAF2FC', color: 'var(--primary)', padding: '2px 8px', borderRadius: '50px', fontSize: '0.65rem' }}>Pipeline</span>
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* 5. Modal Dialog: Launching Soon */}
      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '0.75rem' }}>LAUNCHING SOON</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              This operational workflow is currently undergoing security audits and integration upgrades.
            </p>
            <button 
              onClick={() => setIsModalOpen(false)}
              className="btn"
              style={{
                width: '100%',
                backgroundColor: 'var(--primary)',
                color: '#FFFFFF',
                border: 'none',
                padding: '10px',
                borderRadius: '8px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Acknowledge & Close
            </button>
          </div>
        </div>
      )}

      {/* 6. Footer Section */}
      <footer className={styles.portalFooter}>
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