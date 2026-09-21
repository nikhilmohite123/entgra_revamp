import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import {
  Home,
  LayoutDashboard,
  FileText,
  UploadCloud,
  LogOut,
  ChevronDown
} from 'lucide-react';
import styles from '../styles/atrHeader.module.css';
import atrPortalImg from "../../../assets/Atr_portal.png";
import { AtrToastContainer } from './AtrToast';

  import { BASE_URL } from '../constant/atrConstants';
export default function AtrHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const menuRef = useRef(null);

  const [userProfile, setUserProfile] = useState({
    name: 'User',
    uid: '',
    country: 'India',
    location: 'Mumbai',
    initials: 'US'
  });

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
      initials
    });

    if (uid) {
      fetch(`${BASE_URL}/api/innovations/userdetail`, {
        headers: { 'x-uid': uid }
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
              initials: apiInitials
            });
          }
        })
        .catch(() => {
          // ignore or keep fallback
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

  const handleLogout = () => {
    localStorage.clear();
    navigate('/auth/login');
  };

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <header className={styles.siteHeader}>
      <AtrToastContainer />
      <div className={styles.headerInner}>
        {/* Left Side: Home Button + EPL Logo + Vertical Line + Title */}
        <div className={styles.headerLeft}>
          <Link
            to="/main"
            className={styles.homeBtn}
            title="Back to BPMN Main Portal"
          >
            <Home size={18} />
          </Link>

          <Link to="/atr" className={styles.logoBlock}>
            <img
              src={atrPortalImg}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://www.eplglobal.com/wp-content/uploads/2024/06/footer_logo.svg';
              }}
              alt="EPL Logo"
              className={styles.logoImg}
            />
            <div className={styles.logoDivider} />
            <span className={styles.logoTitle}>ATR Portal</span>
          </Link>
        </div>

        {/* Center: Module Navigation Links */}
        <nav className={styles.headerNavLinks} aria-label="ATR Navigation">
         

          <Link
            to="/atr/atrform"
            className={`${styles.navLink} ${
              isActive('/atr/atrform') || isActive('/atr/form') ? styles.navLinkActive : ''
            }`}
          >
            <FileText size={15} />
            <span>ATR Form & Trail</span>
          </Link>

          <Link
            to="/atr/charts"
            className={`${styles.navLink} ${
              isActive('/atr/charts') || isActive('/atr/chart') ? styles.navLinkActive : ''
            }`}
          >
            <LayoutDashboard size={15} />
            <span>Dashboard</span>
          </Link>

          <Link
            to="/atr/uploadCSVfile"
            className={`${styles.navLink} ${
              isActive('/atr/uploadCSVfile') || isActive('/atr/uploadcsvfile') ? styles.navLinkActive : ''
            }`}
          >
            <UploadCloud size={15} />
            <span>CSV Upload</span>
          </Link>

        
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
        </div>
      </div>
    </header>
  );
}
