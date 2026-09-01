import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styles from '../styles/ideaHub.module.css';
import { CATEGORY_LABELS, MODULE_LABELS } from '../constants/ideaHubConstants';
import logo from '../Assests/epl-logo.png';


export default function IdeaHubHeader({ currentModule, selectedCategory, onAddEntry, showBack, onBack }) {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [userProfile, setUserProfile] = useState({
    name: 'User',
    uid: '',
    country: 'India',
    location: 'Mumbai',
    initials: 'US'
  });

  // Load user profile on mount
  useEffect(() => {
    const uid = localStorage.getItem('uid') || '';
    const storedEmpName = localStorage.getItem('empName') || '';
    const storedLoc = localStorage.getItem('loc') || '';
    const storedCountry = localStorage.getItem('country') || 'India';

    const formattedName = (storedEmpName || uid || 'User')
      .replace(/[.]+/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());

    const initials = formattedName
      .split(' ')
      .filter(Boolean)
      .map((part) => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'US';

    setUserProfile({
      name: formattedName,
      uid: uid ? `UID: ${uid}` : '',
      rawUid: uid,
      country: storedCountry,
      location: storedLoc,
      initials
    });

    if (uid) {
      fetch('/bpmn/api/innovations/userdetail', {
        headers: { 'x-uid': uid }
      })
        .then((res) => res.json())
        .then((res) => {
          if (res && res.success && res.data) {
            const data = res.data;
            const apiName = data.s_emp_name || formattedName;
            const apiInitials = apiName
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
          // ignore or keep local fallback
        });
    }
  }, []);

  // Initialize Google Translate Element for multi-language translation
  useEffect(() => {
    const initTranslate = () => {
      if (window.google && window.google.translate && window.google.translate.TranslateElement) {
        try {
          const container = document.getElementById('google_translate_element');
          if (container && container.innerHTML.trim() === '') {
            new window.google.translate.TranslateElement(
              {
                pageLanguage: 'en',
                autoDisplay: false
              },
              'google_translate_element'
            );
          }
        } catch (e) {
          console.error('Google Translate init error:', e);
        }
      }
    };

    window.googleTranslateElementInit = initTranslate;

    // Check if script is already added
    const existingScript = document.getElementById('google-translate-script');
    if (!existingScript) {
      const script = document.createElement('script');
      script.id = 'google-translate-script';
      script.type = 'text/javascript';
      script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      document.body.appendChild(script);
    } else {
      setTimeout(initTranslate, 300);
    }

    // Interval to ensure body top is not pushed down by translate banner
    const interval = setInterval(() => {
      const bannerFrame = document.querySelector('iframe.goog-te-banner-frame');
      if (bannerFrame) {
        bannerFrame.style.display = 'none';
      }
      if (document.body.style.top && document.body.style.top !== '0px') {
        document.body.style.top = '0px';
      }
    }, 500);

    return () => clearInterval(interval);
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

  const catObj = CATEGORY_LABELS[selectedCategory];
  const moduleCfg = currentModule ? MODULE_LABELS[currentModule] : null;

  return (
    <header className={styles.siteHeader}>
      <div className={styles.headerInner}>
        {showBack && (
          <button
            type="button"
            className={styles.backBtn}
            onClick={onBack ? onBack : () => navigate(-1)}
          >
            ← Back
          </button>
        )}

        {/* Logo and Home Button */}
        <div className={styles.logo} onClick={() => navigate('/idea_hub')}>
          {!showBack && (
            <Link
              to="/main"
              className={styles.homeBtn}
              title="Back to BPMN Main Portal"
              onClick={(e) => e.stopPropagation()}
            >
              <svg width="20" height="20">
                <use href="#icon-home" />
              </svg>
            </Link>
          )}

          <img
            src={logo}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/img/Logo1-EpConnect.jpg';
            }}
            alt="EPL Idea Hub"
            className={styles.logoImg}
          />
          <div className={styles.logoDivider}></div>
          <div className={styles.logoTextBlock}>
            <span className={styles.logoTitle}>idea hub</span>
          </div>
        </div>

        {/* Center Navigation / Breadcrumbs / Category Badge */}
        <div className={styles.headerNav}>
          {currentModule && moduleCfg ? (
            <div className={styles.breadcrumb}>
              <button
                className={styles.bcHome}
                onClick={() => navigate('/idea_hub')}
              >
                Home
              </button>
              <span className={styles.bcSep}>/</span>
              <span className={styles.bcCurrent}>{moduleCfg.label}</span>
            </div>
          ) : (
            <>
              <span className={styles.headerTagline}>Innovation Submission Portal</span>
              {catObj && (
                <div className={styles.navCategoryBadge}>
                  <span className={styles.navCatIcon}>
                    <svg width="18" height="18">
                      <use href={catObj.iconId} />
                    </svg>
                  </span>
                  <span>{catObj.short}</span>
                </div>
              )}
            </>
          )}

          <div className={styles.translateWrap} id="google_translate_element"></div>
        </div>

        {/* Header Right Actions */}
        <div className={styles.headerActions}>
          {currentModule && (
            <button
              type="button"
              className={styles.addEntryBtn}
              onClick={onAddEntry ? onAddEntry : () => {
                navigate(`/idea_hub/form?module=${currentModule}`);
              }}
            >
              <span className={styles.addIcon}>+</span> Add Entry
            </button>
          )}

          {/* Avatar Profile */}
          <div className={styles.avatarWrap}>
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
              <span className={`${styles.avatarCaret} ${dropdownOpen ? styles.avatarCaretOpen : ''}`}>
                ▼
              </span>
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
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
