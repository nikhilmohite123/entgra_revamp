import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  FileSpreadsheet, Briefcase, Shield, ShieldAlert, Layers, Clock, 
  Activity, CheckCircle, HardDrive, Calendar, BarChart3, Database, FileText, 
  DollarSign, Lightbulb, ClipboardList, LogOut, ChevronDown, User, Info, Users, Award
} from 'lucide-react';
import styles from './main.module.css';

import {
  atrPortalImg,
  checklistPanaImg,
  hmpImg,
  socialDashboardBroImg,
  spreadsheetsBroImg,
  businessDevImg,
  cniModuleImg,
  corporateVideosImg,
  customerDevImg,
  customerEnquiryImg,
  demoImg,
  eaimsImg,
  ehsPortalImg,
  enggDrawingImg,
  expenseProcessImg,
  insuranceProcessImg,
  litigationManagementImg,
  meetingManagementImg,
  notableEventsNewImg,
  otProcessImg,
  phoenixProcessImg,
  piEvaluationImg,
  queryResolutionImg,
  safetyPortalImg,
  sampleLogoImg,
  speakUpImg,
  ideaHubImg
} from '../assets';

const ACTIVE_MODULES = [
  {
    id: 'sdd',
    name: 'SDD MODULE',
    path: '/bpmn/sddmodule',
    icon: FileSpreadsheet,
    color: '#63B52F',
    image: spreadsheetsBroImg,
    desc: 'Manage spreadsheets and process worksheets.',
    backDesc: 'Digital spreadsheet and worksheet workflow processing with instant data verification.',
    features: ['Process Worksheets', 'Automated Verification', 'Export & Archival']
  },
  {
    id: 'bd',
    name: 'BUSINESS DEVELOPMENT',
    path: '/bpmn/nbd_taskList',
    icon: Briefcase,
    color: '#062B67',
    image: businessDevImg,
    desc: 'Track deals, negotiations, and partner tasks.',
    backDesc: 'Corporate business development pipeline, client engagement and contract tracking.',
    features: ['Deal Pipeline Tracking', 'Partner Negotiations', 'Stage Milestone Audits']
  },
  {
    id: 'eaims',
    name: 'eAIMS',
    path: '/bpmn/task-workflow#/legal-workflow_list',
    icon: Shield,
    color: '#062B67',
    image: eaimsImg,
    desc: 'Legal and administrative process manager.',
    backDesc: 'End-to-end legal compliance management, audit documents and regulatory clearance.',
    features: ['Legal Workflow Tracking', 'Compliance Certifications', 'Document Vault']
  },
  {
    id: 'safety',
    name: 'SAFETY PORTAL',
    path: '',
    icon: ShieldAlert,
    color: '#DC3545',
    image: safetyPortalImg,
    desc: 'Log safety audits, event alerts, and logs.',
    backDesc: 'Plant and operational safety reporting, incident tracking and risk mitigation.',
    features: ['Incident Logging', 'Risk Assessment Matrix', 'CAPA Resolution Track']
  },
  {
    id: 'ehs',
    name: 'EHS PORTAL',
    path: '/bpmn/ehs/',
    icon: Layers,
    color: '#63B52F',
    image: ehsPortalImg,
    desc: 'Environment, Health, and Safety metrics.',
    backDesc: 'Corporate environmental and occupational health monitoring and compliance dashboards.',
    features: ['EHS KPI Metrics', 'Audit Schedules', 'Hazard Prevention Alerts']
  },
  {
    id: 'ot',
    name: 'OVERTIME PROCESS',
    path: '/overtime',
    icon: Clock,
    color: '#F59E0B',
    image: otProcessImg,
    desc: 'Record and approve operational overtime.',
    backDesc: 'Automated requisition and validation workflow for plant and staff overtime hours.',
    features: ['Shift OT Requisitions', 'Multi-Level Approval Flow', 'HR Payroll Sync']
  },
  {
    id: 'phoenix',
    name: 'PHOENIX PROCESS',
    path: '/bpmn/phoenix-project-list',
    icon: Activity,
    color: '#062B67',
    image: phoenixProcessImg,
    desc: 'Project re-engineering workflow console.',
    backDesc: 'Transformation and business process re-engineering task management.',
    features: ['Project Phase Gates', 'Deliverable Milestones', 'Resource Utilization']
  },
  {
    id: 'quality',
    name: 'QUALITY PROCESS',
    path: '/bpmn/quality_main',
    icon: CheckCircle,
    color: '#63B52F',
    image: checklistPanaImg,
    desc: 'Audit logs, reports, and QA checklists.',
    backDesc: 'Quality assurance lifecycle, continuous inspection checklists and statistical QA.',
    features: ['QA Inspection Logs', 'Non-Conformance Reports', 'ISO Compliance Tracking']
  },
  {
    id: 'hmp_gmp',
    name: 'HMP & GMP',
    isSplit: true,
    path1: 'https://entgra.eplglobal.com/epdms/out/out.ViewFolder.php?folderid=43&showtree=1',
    path2: 'https://entgra.eplglobal.com/epdms/out/out.ViewFolder.php?folderid=64',
    icon: HardDrive,
    color: '#062B67',
    image: hmpImg,
    desc: 'Access standard HMP and GMP folder systems.',
    backDesc: 'Direct access to global Good Manufacturing Practice and Hygiene Management repositories.',
    features: ['Standard HMP Guidelines', 'Certified GMP Documentation', 'Revision History Control']
  },
  {
    id: 'cni',
    name: 'C&I MODULE',
    path: '/bpmn/CNI_Module',
    icon: Calendar,
    color: '#062B67',
    image: cniModuleImg,
    desc: 'Creativity and Innovation tracker board.',
    backDesc: 'Employee innovation intake, review committees and implementation tracking.',
    features: ['Idea Evaluation Pipeline', 'Reward & Recognition', 'Cross-Dept Collaborations']
  },
  {
    id: 'monthly',
    name: 'MONTHLY ACTIVITIES',
    path: '/bpmn/mainAccountpg',
    icon: BarChart3,
    color: '#062B67',
    image: socialDashboardBroImg,
    desc: 'Manage accounting tasks and monthly sheets.',
    backDesc: 'Finance and operational month-end closing, reconciliations and reporting schedules.',
    features: ['Period Closing Checklist', 'Account Reconciliations', 'Management Reporting']
  },
  {
    id: 'atr',
    name: 'ATR PORTAL',
    path: '/atr',
    icon: Database,
    color: '#63B52F',
    image: atrPortalImg,
    desc: 'Database telemetry and ATR system reviews.',
    backDesc: 'Complete lifecycle management for employee flight bookings, policy approvals and ticket issuance.',
    features: ['Corporate Policy Approvals', 'Multi-Sector Bookings', 'Instant Status Tracking']
  },
  {
    id: 'danville',
    name: 'CUSTOMER COMPLAINT DANVILLE',
    path: '/bpmn/cust_complaint',
    icon: ShieldAlert,
    color: '#DC3545',
    image: queryResolutionImg,
    desc: 'Review Danville customer complaints.',
    backDesc: 'Dedicated customer complaint resolution and root cause analysis for Danville operations.',
    features: ['8D Root Cause Analysis', 'Customer Notification Desk', 'Corrective Action Review']
  },
  {
    id: 'npd',
    name: 'NPD TOOL',
    path: '/npd_tool',
    icon: FileText,
    color: '#062B67',
    image: demoImg,
    desc: 'New Product Development tracking console.',
    backDesc: 'New product introduction tracking from formulation trials to commercial manufacturing.',
    features: ['Stage-Gate Governance', 'Trial Sample Tracking', 'Cost & Timeline Forecasting']
  },
  {
    id: 'wcc',
    name: 'WORK COMPLETION CERTIFICATE',
    path: '/bpmn/work_complation',
    icon: FileText,
    color: '#062B67',
    image: notableEventsNewImg,
    desc: 'Generate and sign completion reports.',
    backDesc: 'Vendor and contractor work verification with digital sign-off and certificate generation.',
    features: ['Milestone Sign-Off', 'Vendor Invoicing Clearance', 'Digital Verification']
  },
  {
    id: 'vendor',
    name: 'VENDOR ADVANCE PAYMENT',
    path: '/bpmn/vendor_form',
    icon: DollarSign,
    color: '#F59E0B',
    image: expenseProcessImg,
    desc: 'Approve vendor advanced payment forms.',
    backDesc: 'Commercial procurement advance payment requisition, multi-level financial approvals.',
    features: ['Payment Requisition Forms', 'Finance Review Workflow', 'ERP Payment Integration']
  },
  {
    id: 'idea',
    name: 'IDEA HUB',
    path: '/idea_hub',
    icon: Lightbulb,
    color: '#63B52F',
    image: ideaHubImg,
    desc: 'Share ideas, comments, and project brainstorming.',
    backDesc: 'Enterprise ideation engine to submit kaizen proposals, vote, and collaborate with teams.',
    features: ['Kaizen Idea Submissions', 'Leaderboard & Voting', 'Project Implementation']
  },
  {
    id: 'sample',
    name: 'SAMPLE REQUEST',
    path: '/bpmn/sample_list',
    icon: ClipboardList,
    color: '#062B67',
    image: sampleLogoImg,
    desc: 'Request and track product trial samples.',
    backDesc: 'Client trial sampling management, dispatch logistics tracking and feedback surveys.',
    features: ['Dispatch Courier Tracking', 'Customer Feedback Logs', 'Batch Sampling History']
  }
];

const INACTIVE_MODULES = [
  { id: 'audit', name: 'AUDIT TRACKER', path: '/bpmn/Audit_tracker/', icon: ClipboardList, image: checklistPanaImg, desc: 'Tracks systems compliance audits.', backDesc: 'Continuous tracking for external and internal compliance audits.', features: ['Audit Checklists', 'Compliance Tracking', 'Evidence Vault'] },
  { id: 'speakup', name: 'SPEAK UP', path: '/bpmn/Speakup', icon: ShieldAlert, image: speakUpImg, desc: 'Corporate reporting and helpline.', backDesc: 'Secure and confidential corporate whistleblower channel.', features: ['Anonymous Reports', 'Escalation Flow', 'Review Committee'] },
  { id: 'enquiry', name: 'CUST ENQUIRY TRACKER', path: '/bpmn/enquiry_list', icon: ClipboardList, image: customerEnquiryImg, desc: 'Log customer requests.', backDesc: 'Inbound sales inquiries and client relationship logging.', features: ['Lead Intake', 'Follow-up Alerts', 'Conversion Stats'] },
  { id: 'engg', name: 'ENGINEERING DRAWING', path: '/bpmn/task-workflow#/engDrawing', icon: FileText, image: enggDrawingImg, desc: 'Product schematics viewer.', backDesc: 'CAD drawings, blueprints and technical engineering diagrams.', features: ['CAD Blueprint Vault', 'Revision Approvals', 'Viewer Console'] },
  { id: 'expense', name: 'EXPENSE PROCESS', path: '/bpmn/task-workflow#/eprocessList', icon: DollarSign, image: expenseProcessImg, desc: 'Approve expense claims.', backDesc: 'Staff expense filing, receipt uploads and reimbursement cycles.', features: ['Receipt Attachments', 'Approval Stages', 'Accounts Clearance'] },
  { id: 'townhall', name: 'GLOBAL TOWN HALL FEEDBACK', path: '/bpmn/NEW_SURVEY', icon: FileText, image: notableEventsNewImg, desc: 'Feedback surveys.', backDesc: 'Executive town hall feedback polls and employee suggestions.', features: ['Live Polls', 'Anonymous Feedback', 'Analytics Dashboard'] },
  { id: 'insurance', name: 'INSURANCE PROCESS', path: '/inspro', icon: Shield, image: insuranceProcessImg, desc: 'Manage assets insurance.', backDesc: 'Plant, property and transit insurance claims and policy tracking.', features: ['Policy Register', 'Claim Settlements', 'Renewal Reminders'] },
  { id: 'litigation', name: 'LITIGATION MANAGEMENT', path: '/bpmn/litigation-epp#/litigation-main', icon: Shield, image: litigationManagementImg, desc: 'Legal claims logs.', backDesc: 'Tracking corporate litigation matters, attorney logs and court dates.', features: ['Hearing Schedules', 'Counsel Notes', 'Status Summaries'] },
  { id: 'majorcust', name: 'MAJOR CUST DEVELOP', path: '/bpmn/major_dev_process', icon: Users, image: customerDevImg, desc: 'Track key client upgrades.', backDesc: 'Key account expansion milestones and partnership strategic plans.', features: ['Strategic Accounts', 'Growth Milestones', 'Executive Reviews'] },
  { id: 'nps', name: 'NPS', path: '/bpmn/NPS/', icon: Award, image: socialDashboardBroImg, desc: 'Net Promoter Score tracker.', backDesc: 'Customer satisfaction benchmarks and NPS analytics portal.', features: ['Customer Surveys', 'NPS Benchmarking', 'Sentiment Feedback'] },
  { id: 'pi_eval', name: 'PI EVALUATION', path: '/bpmn/PI_evaluation', icon: BarChart3, image: piEvaluationImg, desc: 'Performance appraisal portal.', backDesc: 'Annual and bi-annual employee performance appraisal index.', features: ['Goal Assessments', 'Manager Reviews', 'Score Card History'] },
  { id: 'tasklist', name: 'TASKLIST', path: '/bpmn/task-workflow#/listTask', icon: ClipboardList, image: checklistPanaImg, desc: 'Standard workflow checklist.', backDesc: 'Standard operating procedure action checklist across units.', features: ['Daily SOP Tasks', 'Completion Tracking', 'Department Handover'] },
  { id: 'meeting', name: 'MEETING MANAGEMENT', path: '/bpmn/meet-SOP', icon: Calendar, image: meetingManagementImg, desc: 'Schedule and manage SOPs.', backDesc: 'Corporate meeting minutes, action items and stakeholder schedules.', features: ['Meeting Agenda', 'Action Item Registry', 'Automated Minutes'] },
  { id: 'videos', name: 'CORPORATE VIDEOS', path: '/bpmn/corporate', icon: Activity, image: corporateVideosImg, desc: 'Training media logs.', backDesc: 'Official onboarding, compliance and plant technical training videos.', features: ['Video Library', 'Watch Milestones', 'Training Completion'] }
];

export default function Main() {
  const navigate = useNavigate();
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

  const filteredActive = ACTIVE_MODULES;
  const filteredInactive = INACTIVE_MODULES;

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



      {/* 3. Cards Grid */}
      <main style={{ marginTop: '1.5rem', flex: 1 }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <CheckCircle size={16} color="var(--secondary)" /> Active Operations
        </h3>
        
        {/* Active Modules Grid (5 columns layout) */}
        <div className={styles.cardsGrid}>
          {filteredActive.map((mod) => {
            const IconComponent = mod.icon;
            const isInternal = mod.path && !mod.path.startsWith('http') && !mod.path.startsWith('/bpmn/');

            if (mod.isSplit) {
              return (
                <div key={mod.id} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                  <div className={styles.scene}>
                    <div className={styles.card} style={{ '--accent': mod.color, '--primary': '#062B67' }}>
                      {/* FRONT FACE */}
                      <div className={`${styles.face} ${styles.front}`}>
                        <div className={styles.visual}>
                          {mod.image ? (
                            <img src={mod.image} alt={mod.name} className={styles.visualImg} />
                          ) : (
                            <div className={styles.visualFallback}>
                              <IconComponent size={48} />
                            </div>
                          )}
                        </div>
                        <div className={styles.cardBody}>
                          <div className={styles.name}>{mod.name}</div>
                          <p className={styles.desc}>{mod.desc}</p>
                          <div className={styles.hint}>
                            <span>Hover to explore &bull; Access option</span>
                          </div>
                        </div>
                      </div>

                      {/* BACK FACE */}
                      <div className={`${styles.face} ${styles.back}`}>
                        <div className={styles.backTop}>
                          <div className={styles.backIcon}>
                            <IconComponent size={20} />
                          </div>
                          <div className={styles.backName}>{mod.name}</div>
                        </div>

                        <p className={styles.backDesc}>{mod.backDesc || mod.desc}</p>

                        <ul className={styles.features}>
                          {(mod.features || ['Workflow Automation', 'Status Tracking', 'Policy Compliance']).map((feat, idx) => (
                            <li key={idx}>
                              <svg width="10" height="10" viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0 }}>
                                <path d="M2.5 6L5 8.5L9.5 3.5" stroke="#7FD858" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                              <span>{feat}</span>
                            </li>
                          ))}
                        </ul>

                        <div className={styles.launchRowSplit}>
                          <a 
                            href={mod.path1} 
                            target="_blank" 
                            rel="noreferrer" 
                            className={styles.launchBtnHalf} 
                            onClick={(e) => e.stopPropagation()}
                          >
                            <span>Access HMP</span>
                            <svg width="10" height="10" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
                              <path d="M3 7H11M11 7L7.5 3.5M11 7L7.5 10.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </a>
                          <a 
                            href={mod.path2} 
                            target="_blank" 
                            rel="noreferrer" 
                            className={styles.launchBtnHalf} 
                            onClick={(e) => e.stopPropagation()}
                          >
                            <span>Access GMP</span>
                            <svg width="10" height="10" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
                              <path d="M3 7H11M11 7L7.5 3.5M11 7L7.5 10.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            }

            const cardInner = (
              <div className={styles.scene}>
                <div className={styles.card} style={{ '--accent': mod.color, '--primary': '#062B67' }}>
                  {/* FRONT FACE */}
                  <div className={`${styles.face} ${styles.front}`}>
                    <div className={styles.visual}>
                      {mod.image ? (
                        <img src={mod.image} alt={mod.name} className={styles.visualImg} />
                      ) : (
                        <div className={styles.visualFallback}>
                          <IconComponent size={48} />
                        </div>
                      )}
                    </div>
                    <div className={styles.cardBody}>
                      <div className={styles.name}>{mod.name}</div>
                      <p className={styles.desc}>{mod.desc}</p>
                      <div className={styles.hint}>
                        <span>Hover to explore &bull; Click to open</span>
                      </div>
                    </div>
                  </div>

                  {/* BACK FACE */}
                  <div className={`${styles.face} ${styles.back}`}>
                    <div className={styles.backTop}>
                      <div className={styles.backIcon}>
                        <IconComponent size={20} />
                      </div>
                      <div className={styles.backName}>{mod.name}</div>
                    </div>

                    <p className={styles.backDesc}>{mod.backDesc || mod.desc}</p>

                    <ul className={styles.features}>
                      {(mod.features || ['Workflow Automation', 'Status Tracking', 'Policy Compliance']).map((feat, idx) => (
                        <li key={idx}>
                          <svg width="10" height="10" viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0 }}>
                            <path d="M2.5 6L5 8.5L9.5 3.5" stroke="#7FD858" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>

                    <div className={styles.launchRow}>
                      <span>Launch Module</span>
                      <svg width="11" height="11" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
                        <path d="M3 7H11M11 7L7.5 3.5M11 7L7.5 10.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            );

            if (isInternal) {
              return (
                <Link 
                  key={mod.id} 
                  to={mod.path} 
                  style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
                >
                  {cardInner}
                </Link>
              );
            }

            if (!mod.path) {
              return (
                <a 
                  key={mod.id} 
                  href="#" 
                  onClick={handleLaunchSoon} 
                  style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
                >
                  {cardInner}
                </a>
              );
            }

            return (
              <a 
                key={mod.id} 
                href={mod.path} 
                target={mod.path.startsWith('http') ? '_blank' : '_self'} 
                rel="noreferrer" 
                style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
              >
                {cardInner}
              </a>
            );
          })}
        </div>

        {/* Toggle Pipeline Operations Button */}
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <button 
            onClick={() => setShowAll(!showAll)}
            className="btn"
            style={{
              backgroundColor: showAll ? 'var(--primary)' : '#FFFFFF',
              color: showAll ? '#FFFFFF' : 'var(--primary)',
              border: '1px solid var(--border-glass)',
              padding: '8px 22px',
              borderRadius: '50px',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(6, 43, 103, 0.04)'
            }}
          >
            {showAll ? 'Hide Pipeline Operations' : 'Show All Processes'}
          </button>
        </div>

        {/* 4. toggled Inactive Modules Section */}
        {showAll && (
          <div style={{ marginTop: '2.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Info size={16} /> Maintenance & Pipeline Operations
            </h3>
            
            <div className={styles.cardsGrid} style={{ opacity: 0.95 }}>
              {filteredInactive.map((mod) => {
                const IconComponent = mod.icon;
                return (
                  <a 
                    key={mod.id} 
                    href="#" 
                    onClick={handleLaunchSoon} 
                    style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
                  >
                    <div className={styles.scene}>
                      <div className={styles.card} style={{ '--accent': '#64748b', '--primary': '#1E293B' }}>
                        
                        {/* FRONT FACE */}
                        <div className={`${styles.face} ${styles.front}`}>
                          <div className={styles.visual}>
                            {mod.image ? (
                              <img src={mod.image} alt={mod.name} className={styles.visualImg} />
                            ) : (
                              <div className={styles.visualFallback}>
                                <IconComponent size={40} />
                              </div>
                            )}
                          </div>
                          <div className={styles.cardBody}>
                            <div className={styles.name}>{mod.name}</div>
                            <p className={styles.desc}>{mod.desc}</p>
                            <div className={styles.hint}>
                              <span>Pipeline Process &bull; Coming Soon</span>
                            </div>
                          </div>
                        </div>

                        {/* BACK FACE */}
                        <div className={`${styles.face} ${styles.back}`} style={{ background: '#1E293B' }}>
                          <div className={styles.backTop}>
                            <div className={styles.backIcon} style={{ background: 'rgba(255, 255, 255, 0.15)' }}>
                              <IconComponent size={18} />
                            </div>
                            <div className={styles.backName}>{mod.name}</div>
                          </div>

                          <p className={styles.backDesc}>{mod.backDesc || mod.desc}</p>

                          <ul className={styles.features}>
                            {(mod.features || ['Integration Roadmap', 'Security Review', 'Access Controls']).map((feat, idx) => (
                              <li key={idx}>
                                <svg width="10" height="10" viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0 }}>
                                  <path d="M2.5 6L5 8.5L9.5 3.5" stroke="#7FD858" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                <span>{feat}</span>
                              </li>
                            ))}
                          </ul>

                          <div className={styles.launchRow} style={{ background: 'rgba(255, 255, 255, 0.12)' }}>
                            <span>Launching Soon</span>
                            <Info size={11} style={{ flexShrink: 0 }} />
                          </div>
                        </div>

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