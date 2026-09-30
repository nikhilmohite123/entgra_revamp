import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import {
  Home,
  FileText,
  PlusCircle,
  BarChart3,
  FileSpreadsheet,
  Download,
  LogOut,
  ChevronDown,
  Menu,
  X,
} from 'lucide-react';
import styles from '../styles/WccHeader.module.css';
import {checklistPanaImg} from '../../../assets/index.js';
import { useWcc } from '../context/useWcc';
import { BASE_URL } from '../constants/wccConstants';

export default function WccHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const { userLevel, userRole, fetchUserLevel, get_reg_loc_lvl, showToast } = useWcc();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const menuRef = useRef(null);

  const [userProfile, setUserProfile] = useState({
    name: 'User',
    uid: '',
    country: 'India',
    location: 'Mumbai',
    initials: 'US',
  });

  const handleNewRequestNav = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setDrawerOpen(false);

    let role = userRole;
    let lvl = userLevel;

    if (!role || !lvl) {
      const res = await fetchUserLevel();
      role = res?.userRole || 'In';
      lvl = res?.userLevel || '1';
    }

    const isUserInitiator =
      role === 'Inititior' ||
      role === 'In' ||
      String(lvl) === '1';

    if (!isUserInitiator) {
      if (showToast) {
        showToast('You are not an authorized person; only Initiator can initiate a form.', 'error');
      }
      return;
    }

    if (typeof window.get_reg_loc_lvl === 'function') {
      await window.get_reg_loc_lvl();
    } else if (typeof get_reg_loc_lvl === 'function') {
      await get_reg_loc_lvl();
    }

    navigate('/wcc/new');
  };

  // Load user profile on mount
  useEffect(() => {
    const uid = localStorage.getItem('uid') || localStorage.getItem('loginId') || '';
    const storedEmpName = localStorage.getItem('empName') || '';
    const storedLoc = localStorage.getItem('loc') || '';
    const storedCountry = localStorage.getItem('country') || 'India';

    const formattedName = (storedEmpName || uid || 'User')
      .replace(/[.]+/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());

    const initials =
      formattedName
        .split(' ')
        .filter(Boolean)
        .map((part) => part[0])
        .slice(0, 2)
        .join('')
        .toUpperCase() || (uid ? uid.slice(0, 2).toUpperCase() : 'US');

    setUserProfile({
      name: formattedName,
      uid: uid ? `UID: ${uid}` : '',
      rawUid: uid,
      country: storedCountry,
      location: storedLoc,
      initials,
    });

    if (uid) {
      fetch(`${BASE_URL}/api/innovations/userdetail`, {
        headers: { 'x-uid': uid },
      })
        .then((res) => res.json())
        .then((res) => {
          if (res && res.success && res.data) {
            const data = res.data;
            const apiName = data.s_emp_name || formattedName;
            const apiInitials =
              apiName
                .split(' ')
                .filter(Boolean)
                .map((part) => part[0])
                .slice(0, 2)
                .join('')
                .toUpperCase() || initials;

            setUserProfile({
              name: apiName,
              uid: uid ? `UID: ${uid}` : '',
              rawUid: uid,
              country: data.s_country || storedCountry || '—',
              location: data.s_location || storedLoc || '—',
              initials: apiInitials,
            });
          }
        })
        .catch(() => {
          // ignore error and keep local fallback
        });
    }
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Close mobile drawer on desktop resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 992) {
        setDrawerOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    navigate('/auth/login');
  };

  const isActive = (path) => {
    if (path === '/wcc') {
      return (
        location.pathname === '/wcc' ||
        location.pathname === '/wcc/' ||
        location.pathname === '/wcc/list'
      );
    }
    return location.pathname.startsWith(path);
  };

  return (
    <header className={styles.siteHeader}>
      <div className={styles.headerInner}>
        {/* Left Side: Home Button + EPL Logo + Vertical Line + Title "wcc portal" */}
        <div className={styles.headerLeft}>
          <Link
            to="/main"
            className={styles.homeBtn}
            title="Back to BPMN Main Portal"
          >
            <Home size={18} />
          </Link>

          <Link to="/wcc" className={styles.logoBlock}>
            <img
              src={checklistPanaImg}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/img/Logo1-EpConnect.jpg';
              }}
              alt="EPL Logo"
              className={styles.logoImg}
            />
            <div className={styles.logoDivider} />
            <span className={styles.logoTitle}>wcc portal</span>
          </Link>
        </div>

        {/* Center: Module Navigation Links */}
        <nav className={styles.headerNavLinks} aria-label="WCC Navigation">
          <Link
            to="/wcc"
            className={`${styles.navLink} ${isActive('/wcc') ? styles.navLinkActive : ''}`}
          >
            <FileText size={15} />
            <span>Requests</span>
          </Link>

          <Link
            to="/wcc/new"
            onClick={handleNewRequestNav}
            className={`${styles.navLink} ${isActive('/wcc/new') ? styles.navLinkActive : ''}`}
          >
            <PlusCircle size={15} />
            <span>New Request</span>
          </Link>

          <Link
            to="/wcc/wcc_dash"
            className={`${styles.navLink} ${
              isActive('/wcc/wcc_dash') || isActive('/wcc/analytics')
                ? styles.navLinkActive
                : ''
            }`}
          >
            <BarChart3 size={15} />
            <span>Dashboard</span>
          </Link>

          <Link
            to="/wcc/wcc_data_export"
            className={`${styles.navLink} ${
              isActive('/wcc/wcc_data_export') || isActive('/wcc/export')
                ? styles.navLinkActive
                : ''
            }`}
          >
            <FileSpreadsheet size={15} />
            <span>Data Export</span>
          </Link>

          <a
            href="/WorkCompletion/Work Completion Certificate SOP.pdf"
            className={`${styles.navLink} ${styles.sopLink}`}
            download
            target="_blank"
            rel="noopener noreferrer"
          >
            <Download size={15} />
            <span>SOP</span>
          </a>
        </nav>

        {/* Right Side: Avatar Profile with Dropdown */}
        <div className={styles.headerRight}>
          <div className={styles.avatarWrap} ref={menuRef}>
            <div
              className={styles.avatarTrigger}
              onClick={(e) => {
                e.stopPropagation();
                setDropdownOpen(!dropdownOpen);
              }}
            >
              <div className={styles.avatarCircle}>{userProfile.initials}</div>
              <div className={styles.avatarInlineInfo}>
                <span className={styles.avatarInlineName}>{userProfile.name}</span>
                <span className={styles.avatarInlineLoc}>
                  {userProfile.location
                    ? `${userProfile.location}${userProfile.country ? `, ${userProfile.country}` : ''}`
                    : userProfile.country}
                </span>
              </div>
              <ChevronDown
                size={14}
                className={`${styles.avatarCaret} ${dropdownOpen ? styles.avatarCaretOpen : ''}`}
              />
            </div>

            {dropdownOpen && (
              <div className={styles.avatarDropdown} onClick={(e) => e.stopPropagation()}>
                <div className={styles.avatarDdRow}>
                  <div className={styles.avatarDdCircle}>{userProfile.initials}</div>
                  <div>
                    <div className={styles.avatarDdName}>{userProfile.name}</div>
                    <div className={styles.avatarDdUid}>{userProfile.uid}</div>
                    <div className={styles.roleBadge}>
                      Level {userLevel} &bull; {userRole || 'Initiator'}
                    </div>
                  </div>
                </div>
                <div className={styles.avatarDdDivider}></div>
                <div className={styles.avatarDdDetail}>
                  <span className={styles.avatarDdLabel}>Country</span>
                  <span>{userProfile.country || '—'}</span>
                </div>
                <div className={styles.avatarDdDetail}>
                  <span className={styles.avatarDdLabel}>Location</span>
                  <span>{userProfile.location || '—'}</span>
                </div>
                <button
                  type="button"
                  className={styles.logoutBtn}
                  onClick={handleLogout}
                >
                  <LogOut size={14} />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>

          {/* Mobile Hamburger Menu Toggle */}
          <button
            type="button"
            className={styles.mobileMenuBtn}
            onClick={() => setDrawerOpen(!drawerOpen)}
            aria-label="Toggle navigation menu"
          >
            {drawerOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      <div className={`${styles.mobileDrawer} ${drawerOpen ? styles.open : ''}`}>
        <Link to="/main" onClick={() => setDrawerOpen(false)}>
          <Home size={16} /> Entgra Home
        </Link>
        <Link to="/wcc" onClick={() => setDrawerOpen(false)}>
          <FileText size={16} /> Requests
        </Link>
        <Link to="/wcc/new" onClick={handleNewRequestNav}>
          <PlusCircle size={16} /> New Request
        </Link>
        <Link to="/wcc/wcc_dash" onClick={() => setDrawerOpen(false)}>
          <BarChart3 size={16} /> Dashboard
        </Link>
        <Link to="/wcc/wcc_data_export" onClick={() => setDrawerOpen(false)}>
          <FileSpreadsheet size={16} /> Data Export
        </Link>
        <a
          href="/WorkCompletion/Work Completion Certificate SOP.pdf"
          download
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => setDrawerOpen(false)}
        >
          <Download size={16} /> Download SOP
        </a>
      </div>

      {/* Mobile Drawer Backdrop */}
      <div
        className={`${styles.drawerOverlay} ${drawerOpen ? styles.active : ''}`}
        onClick={() => setDrawerOpen(false)}
      />
    </header>
  );
}
