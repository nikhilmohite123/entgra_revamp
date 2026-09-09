import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  FolderKanban,
  BarChart3,
  LayoutDashboard,
  Settings,
  ShieldCheck,
  Menu,
  X,
  ChevronDown,
} from 'lucide-react';
import styles from '../styles/npdTool.module.css';
import eplLogo from '../../idea-hub/Assests/epl-logo.png';
import { NpdToastContainer } from './NpdToast';
import { BASE_URL } from '../constants/npdConstants';

export default function NpdHeader() {
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [userProfile, setUserProfile] = useState({
    name: 'User',
    uid: '',
    country: 'India',
    location: 'Mumbai',
    initials: 'US',
  });

  // Load user profile from localStorage (uid, empName, loc, country) and API
  useEffect(() => {
    const uid = localStorage.getItem('uid') || '';
    const storedEmpName = localStorage.getItem('empName') || '';
    const storedLoc = localStorage.getItem('loc') || '';
    const storedCountry = localStorage.getItem('country') || 'India';

    const rawName = storedEmpName || uid || 'User';
    const formattedName = rawName
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
        .catch(() => fetch('/bpmn/api/innovations/userdetail', { headers: { 'x-uid': uid } }))
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
          // keep fallback
        });
    }
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(`.${styles.avatarWrap}`)) {
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

  return (
    <header className={styles.siteHeader}>
      <NpdToastContainer />
      <div className={styles.headerInner}>
        {/* Left Side: Home Button + Logo + Normal Vertical Line + Module Name "npd tool" */}
        <div className={styles.headerLeft}>
          <Link
            to="/main"
            className={styles.homeBtn}
            title="Back to BPMN Main Portal"
          >
            <Home size={18} />
          </Link>

          <Link to="/npd_tool/npdtrack_landing_page" className={styles.logoBlock}>
            <img
              src={eplLogo}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://www.eplglobal.com/wp-content/uploads/2024/06/footer_logo.svg';
              }}
              alt="EPL Logo"
              className={styles.logoImg}
            />
            <div className={styles.logoDivider} />
            <span className={styles.logoTitle}>npd tool</span>
          </Link>
        </div>

        {/* Right Side: Navigation links + Avatar Profile with Admin Settings */}
        <div className={styles.headerRight}>
          <nav className={styles.headerNavLinks} aria-label="NPD Navigation">
            <Link
              to="/npd_tool/npdtrack"
              className={`${styles.headerNavLink} ${location.pathname.endsWith('/npdtrack') ? styles.headerNavLinkActive : ''}`}
            >
              <FolderKanban size={15} />
              <span>NPD Programs</span>
            </Link>

            <Link
              to="/npd_tool/npd_summary"
              className={`${styles.headerNavLink} ${location.pathname.endsWith('/npd_summary') ? styles.headerNavLinkActive : ''}`}
            >
              <BarChart3 size={15} />
              <span>Summary</span>
            </Link>

            <Link
              to="/npd_tool/npd_dashboard"
              className={`${styles.headerNavLink} ${location.pathname.endsWith('/npd_dashboard') ? styles.headerNavLinkActive : ''}`}
            >
              <LayoutDashboard size={15} />
              <span>Dashboard</span>
            </Link>

            <Link
              to="/npd_tool/mbr_dashboard"
              className={`${styles.headerNavLink} ${location.pathname.endsWith('/mbr_dashboard') ? styles.headerNavLinkActive : ''}`}
            >
              <BarChart3 size={15} />
              <span>MBR</span>
            </Link>
          </nav>

          {/* User Avatar with UID and Admin Settings in dropdown */}
          <div className={styles.avatarWrap}>
            <div
              className={styles.avatarTrigger}
              onClick={() => setDropdownOpen(!dropdownOpen)}
              role="button"
              tabIndex={0}
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
                    <div className={styles.avatarDdUid}>{userProfile.uid || 'User'}</div>
                  </div>
                </div>

                <div className={styles.avatarDdDivider} />

                <div className={styles.avatarDdDetail}>
                  <span className={styles.avatarDdLabel}>Country</span>
                  <span>{userProfile.country || '—'}</span>
                </div>
                <div className={styles.avatarDdDetail}>
                  <span className={styles.avatarDdLabel}>Location</span>
                  <span>{userProfile.location || '—'}</span>
                </div>

                <div className={styles.avatarDdDivider} />

                {/* Admin Setting Symbol & Option in dropdown */}
                <Link to="/npd_tool/npd_setting" className={styles.dropdownActionItem}>
                  <Settings size={16} />
                  <span>Admin Settings</span>
                </Link>

                <Link to="/npd_tool/npd_regional_admin" className={styles.dropdownActionItem}>
                  <ShieldCheck size={16} />
                  <span>Regional Admin Settings</span>
                </Link>
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
        <Link to="/npd_tool/npdtrack" onClick={() => setDrawerOpen(false)}>
          <FolderKanban size={16} /> NPD Programs
        </Link>
        <Link to="/npd_tool/npd_summary" onClick={() => setDrawerOpen(false)}>
          <BarChart3 size={16} /> Summary
        </Link>
        <Link to="/npd_tool/npd_dashboard" onClick={() => setDrawerOpen(false)}>
          <LayoutDashboard size={16} /> Dashboard
        </Link>
        <Link to="/npd_tool/mbr_dashboard" onClick={() => setDrawerOpen(false)}>
          <BarChart3 size={16} /> MBR
        </Link>
        <div style={{ height: '1px', background: 'rgba(255,255,255,0.15)', margin: '8px 0' }} />
        <Link to="/npd_tool/npd_setting" onClick={() => setDrawerOpen(false)}>
          <Settings size={16} /> Admin Settings
        </Link>
        <Link to="/npd_tool/npd_regional_admin" onClick={() => setDrawerOpen(false)}>
          <ShieldCheck size={16} /> Regional Admin
        </Link>
      </div>

      {/* Mobile Drawer Backdrop */}
      <div
        className={`${styles.drawerOverlay} ${drawerOpen ? styles.active : ''}`}
        onClick={() => setDrawerOpen(false)}
      />
    </header>
  );
}
