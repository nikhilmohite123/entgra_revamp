import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Home, Plus } from 'lucide-react';
import styles from '../styles/SamplePortalHeader.module.css';
import { useSamplePortal } from '../context/useSamplePortal';
import logo from '../Assests/sample-logo.png';

export default function SamplePortalHeader() {
  const navigate = useNavigate();
  const { userProfile, isAdmin } = useSamplePortal();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const avatarRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (avatarRef.current && !avatarRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, []);

  return (
    <header className={styles.header}>
      <div className={styles.headerInner}>
        {/* Logo & Navigation */}
        <div className={styles.logoArea}>
          <button
            className={styles.homeBtn}
            onClick={() => navigate('/main')}
            aria-label="Back to Portal Home"
            title="Return to Main Portal"
          >
            <Home size={19} />
          </button>

          <Link to="/sample_list" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
            <img src={logo} alt="EPL Global" className={styles.logoImg} />
            <div className={styles.logoDivider} />
            <span className={styles.logoTitle}>Sample Request Form</span>
          </Link>
        </div>

        {/* Center Tagline */}
        <div className={styles.headerNav}>
          <span className={styles.tagline}>Sample Request Management</span>
        </div>

        {/* Right Actions */}
        <div className={styles.headerActions}>
          {!isAdmin && (
            <Link to="/sample_portal" className={styles.btnNavPrimary} id="newRequestBtn">
              <Plus size={16} />
              <span>New Request</span>
            </Link>
          )}

          {/* User Profile Avatar */}
          <div className={styles.avatarWrap} ref={avatarRef}>
            <div
              className={styles.avatarTrigger}
              onClick={(e) => {
                e.stopPropagation();
                setDropdownOpen((prev) => !prev);
              }}
              title="User Account"
            >
              <div className={styles.avatarCircle}>{userProfile.initials}</div>
              <div className={styles.avatarName}>{userProfile.name}</div>
              <span className={styles.avatarCaret}>▾</span>
            </div>

            {dropdownOpen && (
              <div className={styles.avatarDropdown}>
                <div className={styles.avatarDdRow}>
                  <div className={styles.avatarCircle}>{userProfile.initials}</div>
                  <div>
                    <div className={styles.avatarDdName}>{userProfile.name}</div>
                    <div className={styles.avatarDdUid}>{userProfile.uid}</div>
                  </div>
                </div>
                <div className={styles.avatarDdDivider} />
                <div className={styles.avatarDdItem}>
                  <span className={styles.avatarDdLabel}>Location</span>
                  <span>{userProfile.location}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
