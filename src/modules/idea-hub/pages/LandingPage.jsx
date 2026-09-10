import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/landingPage.module.css';
import SvgSprite from '../components/SvgSprite';
import IdeaHubHeader from '../components/IdeaHubHeader';
import IdeaHubFooter from '../components/IdeaHubFooter';
import { CATEGORY_LABELS, MODULE_LABELS, BASE_URL } from '../constants/ideaHubConstants';

export default function LandingPage() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Restore category from sessionStorage
  const baseUrl = BASE_URL;
  useEffect(() => {
    try {
      const saved = JSON.parse(sessionStorage.getItem('selectedCategory') || 'null');
      if (saved && saved.num) {
        setSelectedCategory(saved.num);
      }
    } catch {
      // ignore
    }
  }, []);

  const handleSelectCategory = (num) => {
    setSelectedCategory(num);
    const cat = CATEGORY_LABELS[num];
    sessionStorage.setItem('selectedCategory', JSON.stringify({ num, ...cat }));
  };

  const handleOpenModule = (moduleKey) => {
    if (!selectedCategory) return;
    sessionStorage.setItem('selectedModule', moduleKey);
    navigate(`/idea_hub/table/${moduleKey}`);
  };

  const handleOpenNPDTool = () => {
    window.location.href = 'https://entgra.eplglobal.com/bpmn/npd_summary?from=ideahub';
  };

  return (
    <div className={styles.ideaHubContainer}>
      <SvgSprite />

      {/* Header */}
      <IdeaHubHeader
        currentModule={null}
        selectedCategory={selectedCategory}
      />

      {/* Landing Main View */}
      <main className={styles.landingMain}>
        <div className={styles.heroText}>
          <h1>
            <span className={styles.accent}>idea hub</span>
          </h1>
          <p>Select a category to view and manage innovation submissions.</p>
        </div>

        {/* Category Strip */}
        <div className={styles.categoryStrip}>
          {[1, 2, 3].map((catNum) => {
            const cat = CATEGORY_LABELS[catNum];
            const isActive = selectedCategory === catNum;

            return (
              <button
                key={catNum}
                type="button"
                className={`${styles.catBtn} ${isActive ? styles.catBtnActive : ''}`}
                onClick={() => handleSelectCategory(catNum)}
              >
                <span className={styles.catBtnIcon}>
                  <svg width="22" height="22">
                    <use href={cat.iconId} />
                  </svg>
                </span>
                <span className={styles.catBtnText}>
                  <strong>{cat.full}</strong>
                  <em>{cat.sub}</em>
                </span>
              </button>
            );
          })}
        
        </div>

        {/* Notice shown when no category selected */}
        {!selectedCategory ? (
          <div className={styles.catNotice}>
            <span className={styles.catNoticeIcon}>
              <svg width="18" height="18">
                <use href="#icon-point" />
              </svg>
            </span>
            <p>Please select one of the categories above to enable the modules.</p>
          </div>
        ) : (
          <div className={styles.catSubNotice}>
            <svg width="16" height="16">
              <use href="#icon-point" />
            </svg>
            <span>Select a subcategory below to view and add your innovation.</span>
          </div>
        )}

        {/* Module Grid */}
        <div className={`${styles.moduleGrid} ${!selectedCategory ? styles.moduleGridLocked : ''}`}>
          {/* NPD Tool Card (Only visible when Category 2 is selected) */}
          {selectedCategory === 2 && (
            <button
              type="button"
              className={styles.moduleCard}
              onClick={handleOpenNPDTool}
            >
              <div className={styles.cardIcon}>
                <svg viewBox="0 0 48 48" fill="none">
                  <path
                    d="M8 34L18 24L27 29L40 13"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle cx="8" cy="34" r="3" fill="currentColor" />
                  <circle cx="18" cy="24" r="3" fill="currentColor" />
                  <circle cx="27" cy="29" r="3" fill="currentColor" />
                  <circle cx="40" cy="13" r="3" fill="currentColor" />
                  <path
                    d="M34 13H40V19"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div className={styles.cardContent}>
                <h2>NPD TOOL</h2>
                <p className={styles.cardDesc}>NPD Tracking Tool</p>
                <p className={styles.cardExamples}>Project, IDEA, Program</p>
              </div>
              <div className={styles.cardArrow}>→</div>
            </button>
          )}

          {/* Material Module Card */}
          <button
            type="button"
            className={styles.moduleCard}
            onClick={() => handleOpenModule('material')}
          >
            <div className={styles.cardIcon}>
              <svg viewBox="0 0 48 48" fill="none">
                <polygon
                  points="24,4 44,14 44,34 24,44 4,34 4,14"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <polygon
                  points="24,12 36,18 36,30 24,36 12,30 12,18"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  opacity="0.5"
                />
                <circle cx="24" cy="24" r="4" fill="currentColor" />
              </svg>
            </div>
            <div className={styles.cardContent}>
              <h2>{MODULE_LABELS.material.label}</h2>
              <p className={styles.cardDesc}>{MODULE_LABELS.material.desc}</p>
              <p className={styles.cardExamples}>{MODULE_LABELS.material.examples}</p>
            </div>
            <div className={styles.cardArrow}>→</div>
          </button>

          {/* Functional Module Card */}
          <button
            type="button"
            className={styles.moduleCard}
            onClick={() => handleOpenModule('functional')}
          >
            <div className={styles.cardIcon}>
              <svg viewBox="0 0 48 48" fill="none">
                <rect x="8" y="8" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="2" />
                <rect x="26" y="8" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="2" />
                <rect x="8" y="26" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="2" />
                <rect
                  x="26"
                  y="26"
                  width="14"
                  height="14"
                  rx="2"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="currentColor"
                  fillOpacity="0.2"
                />
              </svg>
            </div>
            <div className={styles.cardContent}>
              <h2>{MODULE_LABELS.functional.label}</h2>
              <p className={styles.cardDesc}>{MODULE_LABELS.functional.desc}</p>
              <p className={styles.cardExamples}>{MODULE_LABELS.functional.examples}</p>
            </div>
            <div className={styles.cardArrow}>→</div>
          </button>

          {/* Aesthetic Module Card */}
          <button
            type="button"
            className={styles.moduleCard}
            onClick={() => handleOpenModule('aesthetic')}
          >
            <div className={styles.cardIcon}>
              <svg viewBox="0 0 48 48" fill="none">
                <circle cx="24" cy="24" r="16" stroke="currentColor" strokeWidth="2" />
                <path d="M14 24 Q19 14 24 24 Q29 34 34 24" stroke="currentColor" strokeWidth="2" />
                <circle cx="24" cy="10" r="2.5" fill="currentColor" />
                <circle cx="36" cy="17" r="2" fill="currentColor" opacity="0.6" />
                <circle cx="12" cy="17" r="2" fill="currentColor" opacity="0.6" />
              </svg>
            </div>
            <div className={styles.cardContent}>
              <h2>{MODULE_LABELS.aesthetic.label}</h2>
              <p className={styles.cardDesc}>{MODULE_LABELS.aesthetic.desc}</p>
              <p className={styles.cardExamples}>{MODULE_LABELS.aesthetic.examples}</p>
            </div>
            <div className={styles.cardArrow}>→</div>
          </button>

          {/* Others Module Card */}
          <button
            type="button"
            className={styles.moduleCard}
            onClick={() => handleOpenModule('others')}
          >
            <div className={styles.cardIcon}>
              <svg viewBox="0 0 48 48" fill="none">
                <circle cx="24" cy="24" r="3" fill="currentColor" />
                <circle cx="10" cy="24" r="3" fill="currentColor" opacity="0.7" />
                <circle cx="38" cy="24" r="3" fill="currentColor" opacity="0.7" />
                <path
                  d="M24 8L24 16M24 32L24 40M8 12L14 18M34 30L40 36M8 36L14 30M34 18L40 12"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <div className={styles.cardContent}>
              <h2>{MODULE_LABELS.others.label}</h2>
              <p className={styles.cardDesc}>{MODULE_LABELS.others.desc}</p>
              <p className={styles.cardExamples}>{MODULE_LABELS.others.examples}</p>
            </div>
            <div className={styles.cardArrow}>→</div>
          </button>
        </div>
      </main>

      {/* Footer */}
      <IdeaHubFooter />
    </div>
  );
}
