import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from '../styles/atrDashboard.module.css';
import AtrHeader from '../components/AtrHeader';
import AtrRegionModal from '../components/AtrRegionModal';
import AtrFooter from '../components/AtrFooter';
import { BASE_URL } from '../constant/atrConstants';

// Import existing shared assets
import {
  atrPortalImg,
  socialDashboardBroImg,
  spreadsheetsBroImg,
  meetingManagementImg
} from '../../../assets';

export default function AtrDashboardPage() {
  const [empLocation, setEmpLocation] = useState('');
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(true);

  // Fetch employee region/location on mount
  useEffect(() => {
    const fetchEmpRegion = async () => {
      const loginId = localStorage.getItem('loginId') || localStorage.getItem('uid') || '';
      if (!loginId) return;

      try {
        const queryUrl = `${BASE_URL}/AtrRoute/get_region_of_emp?uid=${encodeURIComponent(loginId)}`;
        const res = await fetch(queryUrl);
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const result = await res.json();
        if (Array.isArray(result) && result.length > 0) {
          setEmpLocation(result[0].S_LOCATION || '');
        }
      } catch (err) {
        console.error('Error fetching employee location:', err);
      }
    };

    fetchEmpRegion();
  }, []);

  const handleAuthorized = (authorized) => {
    setIsAuthorized(authorized);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className={styles.dashboardWrapper}>
      {/* Top Navigation */}
      <AtrHeader />

      {/* Region & Plant Selection Modal */}
      <AtrRegionModal
        isOpen={isModalOpen && !isAuthorized}
        empLocation={empLocation}
        onAuthorized={handleAuthorized}
        onClose={handleCloseModal}
      />

      {/* Main Dashboard Container */}
      <main className={styles.mainContent}>
        {/* Top-Right EPL Global Logo */}
        {/* <div className={styles.topLogoRow}>
          <a
            href="https://www.eplglobal.com"
            target="_blank"
            rel="noopener noreferrer"
            title="EPL Global"
          >
            <img
              src="https://www.eplglobal.com/wp-content/uploads/2024/06/main_logo.svg"
              alt="EPL Global Logo"
              className={styles.mainLogo}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/img/Logo1-EpConnect.jpg';
              }}
            />
          </a>
        </div> */}

        {/* Dashboard Grid (visible once authorized) */}
        {isAuthorized ? (
          <div className={styles.dashboardGrid} id="dashpage">
            {/* Left Column: Meeting Image */}
            <div className={styles.imageContainer}>
              <img
                src="/img/officemeet1.jpg"
                alt="Team Meeting"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = meetingManagementImg;
                }}
              />
            </div>

            {/* Right Column: Title & Action Cards */}
            <div className={styles.cardsSection}>
              <div>
                <h3 className={styles.headingg}>Action Taken Report</h3>
              </div>

              <div className={styles.cardContainer}>
                {/* 1. ATR Portal Card */}
                <div className={styles.cardCustom}>
                  <img src={atrPortalImg} alt="ATR Portal" />
                  <div className={styles.cardBody}>
                    <h5 className={styles.cardTitle}>ATR Portal</h5>
                    <div className={styles.cardButton}>
                      <Link to="/atrform" className={styles.cardBtn}>
                        ATR Form & Trail
                      </Link>
                    </div>
                  </div>
                </div>

                {/* 2. Dashboard Card */}
                <div className={styles.cardCustom}>
                  <img src={socialDashboardBroImg} alt="Dashboard" />
                  <div className={styles.cardBody}>
                    <h5 className={styles.cardTitle}>Dashboard</h5>
                    <div className={styles.cardButton}>
                      <Link to="/charts" className={styles.cardBtn}>
                        Dashboard's
                      </Link>
                    </div>
                  </div>
                </div>

                {/* 3. Excel File Card */}
                <div className={styles.cardCustom}>
                  <img src={spreadsheetsBroImg} alt="Excel File" />
                  <div className={styles.cardBody}>
                    <h5 className={styles.cardTitle}>Excel File</h5>
                    <div className={styles.cardButton}>
                      <Link to="/uploadCSVfile" className={styles.cardBtn}>
                        Upload CSV File
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </main>

      {/* Footer */}
      <AtrFooter />
    </div>
  );
}
