import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  ArrowLeft, Home, FolderKanban, LayoutDashboard, BarChart3, 
  Layers, Menu, X 
} from 'lucide-react';
import styles from '../styles/npdTrack.module.css';

export default function NpdTrackHeader({ forIdeaHub }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const goBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/main');
    }
  };

  const goBackToIdeaHub = () => {
    navigate('/idea_hub');
  };

  const goBackToSummary = () => {
    navigate('/npd_tool/npd_summary?from=ideahub');
  };

  if (forIdeaHub) {
    return (
      <nav className={styles.mainNav}>
        <div className={styles.navContainer}>
          <div className={styles.brandGroup}>
            <Link to="/main" className={styles.brandLink}>
              <img
                src="/img/Logo1-EpConnect.jpg"
                className={styles.brandLogo}
                alt="Logo"
                onError={(e) => { e.target.src = 'https://www.eplglobal.com/wp-content/uploads/2024/06/footer_logo.svg'; }}
              />
            </Link>
            <div className={styles.brandDivider}></div>
            <h3 className={styles.headerTitle}>NPD TRACKING TOOL</h3>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              className={`${styles.navLinkItem} ${location.pathname.includes('/npd_summary') ? styles.navLinkActive : ''}`}
              onClick={goBackToSummary}
            >
              <BarChart3 size={15} />
              <span>Summary</span>
            </button>
            <button
              type="button"
              className={styles.backBtn}
              onClick={goBackToIdeaHub}
            >
              <ArrowLeft size={15} />
              <span>Go Back</span>
            </button>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className={styles.mainNav}>
      <div className={styles.navContainer}>
        {/* Brand Group */}
        <div className={styles.brandGroup}>
          <Link to="/main" className={styles.brandLink}>
            <img
              src="/img/Logo1-EpConnect.jpg"
              className={styles.brandLogo}
              alt="Logo"
              onError={(e) => { e.target.src = 'https://www.eplglobal.com/wp-content/uploads/2024/06/footer_logo.svg'; }}
            />
          </Link>
          <div className={styles.brandDivider}></div>
          <h3 className={styles.headerTitle}>NPD TRACKING TOOL</h3>
        </div>

        {/* Mobile Toggler */}
        <button
          className={styles.mobileToggler}
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-expanded={menuOpen}
          aria-label="Toggle navigation"
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        {/* Navigation Links */}
        <div className={`${styles.mobileNavCollapse} ${menuOpen ? styles.mobileOpen : ''}`}>
          <ul className={styles.navLinksList}>
            <li className={styles.navItem}>
              <button
                type="button"
                className={styles.backBtn}
                onClick={goBack}
              >
                <ArrowLeft size={14} />
                <span>Go Back</span>
              </button>
            </li>
            <li className={styles.navItem}>
              <Link
                className={`${styles.navLinkItem} ${location.pathname === '/main' ? styles.navLinkActive : ''}`}
                to="/main"
                onClick={() => setMenuOpen(false)}
              >
                <Layers size={14} />
                <span>Entgra</span>
              </Link>
            </li>
            <li className={styles.navItem}>
              <Link
                className={`${styles.navLinkItem} ${location.pathname.endsWith('/npdtrack') ? styles.navLinkActive : ''}`}
                to="/npd_tool/npdtrack"
                onClick={() => setMenuOpen(false)}
              >
                <FolderKanban size={14} />
                <span>NPD Programs</span>
              </Link>
            </li>
            <li className={styles.navItem}>
              <Link
                className={`${styles.navLinkItem} ${location.pathname === '/npd_tool' || location.pathname.endsWith('/npdtrack_landing_page') ? styles.navLinkActive : ''}`}
                to="/npd_tool/npdtrack_landing_page"
                onClick={() => setMenuOpen(false)}
              >
                <Home size={14} />
                <span>Home</span>
              </Link>
            </li>
            <li className={styles.navItem}>
              <Link
                className={`${styles.navLinkItem} ${location.pathname.endsWith('/npd_summary') ? styles.navLinkActive : ''}`}
                to="/npd_tool/npd_summary"
                onClick={() => setMenuOpen(false)}
              >
                <BarChart3 size={14} />
                <span>Summary</span>
              </Link>
            </li>
            <li className={styles.navItem}>
              <Link
                className={`${styles.navLinkItem} ${location.pathname.endsWith('/npd_dashboard') ? styles.navLinkActive : ''}`}
                to="/npd_tool/npd_dashboard"
                onClick={() => setMenuOpen(false)}
              >
                <LayoutDashboard size={14} />
                <span>Dashboard</span>
              </Link>
            </li>
            <li className={styles.navItem}>
              <Link
                className={`${styles.navLinkItem} ${location.pathname.endsWith('/mbr_dashboard') ? styles.navLinkActive : ''}`}
                to="/npd_tool/mbr_dashboard"
                onClick={() => setMenuOpen(false)}
              >
                <BarChart3 size={14} />
                <span>MBR</span>
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}
