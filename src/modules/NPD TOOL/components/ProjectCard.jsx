import React, { useState, useEffect } from 'react';
import { FileText } from 'lucide-react';
import styles from '../styles/npdTool.module.css';
import { BASE_URL } from '../constants/npdConstants';

/**
 * Resolves full backend image URL from project data
 */
function resolveProjectImageUrl(project) {
  if (!project) return null;

  const rawFileName =
    project.s_npd_new_file_name ||
    project.new_file_names ||
    project.s_file_name ||
    project.file_name ||
    project.s_npd_og_file_name ||
    '';

  if (!rawFileName) return null;

  // Take first file from comma-separated list
  const files = rawFileName
    .split(',')
    .map((f) => f.trim())
    .filter(Boolean);

  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'];
  const imageFile =
    files.find((f) => {
      const ext = f.split('.').pop()?.toLowerCase();
      return imageExtensions.includes(ext);
    }) || files[0];

  if (!imageFile) return null;

  // If already absolute URL
  if (
    imageFile.startsWith('http://') ||
    imageFile.startsWith('https://') ||
    imageFile.startsWith('data:')
  ) {
    return imageFile;
  }

  // Base path from backend
  let rawPath =
    project.s_path ||
    project.file_paths ||
    project.file_path ||
    project.path ||
    '/NPD_uploads';

  let cleanPath = rawPath.split(',')[0].trim();
  // Strip /bpmn if present because backend serves uploaded assets under /NPD_uploads
  cleanPath = cleanPath.replace(/^\/bpmn\/NPD_uploads/i, '/NPD_uploads');

  if (!cleanPath.startsWith('/')) {
    cleanPath = '/' + cleanPath;
  }
  if (cleanPath.endsWith('/')) {
    cleanPath = cleanPath.slice(0, -1);
  }

  const backendOrigin = BASE_URL;

  return `${backendOrigin}${cleanPath}/${imageFile}`;
}

export default function ProjectCard({ project, isLoading }) {
  const [imgError, setImgError] = useState(false);
  const [imgSrc, setImgSrc] = useState(null);

  useEffect(() => {
    setImgError(false);
    setImgSrc(resolveProjectImageUrl(project));
  }, [project]);

  if (isLoading) {
    return (
      <div className={`${styles.moduleCard} ${styles.loadingCard}`}>
        <div className={styles.cardIcon}>
          <div style={{ width: 40, height: 40, borderRadius: 8, background: '#e2e8f0' }} />
        </div>
        <div className={styles.cardContent}>
          <div style={{ width: '40%', height: 12, background: '#e2e8f0', borderRadius: 4, marginBottom: 8 }} />
          <div style={{ width: '70%', height: 20, background: '#e2e8f0', borderRadius: 4, marginBottom: 6 }} />
          <div style={{ width: '50%', height: 14, background: '#e2e8f0', borderRadius: 4 }} />
        </div>
      </div>
    );
  }

  const handleCardClick = () => {
    if (project?.n_npdtracking_id) {
      window.location.href = `/npd_tool/npdsinglepageprojectview?id=${project.n_npdtracking_id}`;
    }
  };

  const rawFileName =
    project?.s_npd_new_file_name ||
    project?.new_file_names ||
    project?.s_npd_og_file_name ||
    '';
  const isPdf = rawFileName.split('.').pop()?.toLowerCase() === 'pdf';

  const handleImageError = () => {
    // Retry with direct backend URL if not already tried
    const firstFile = rawFileName.split(',')[0]?.trim();
    const fallbackDirect = `${BASE_URL}/NPD_uploads/${firstFile}`;

    if (firstFile && imgSrc !== fallbackDirect) {
      setImgSrc(fallbackDirect);
    } else {
      setImgError(true);
    }
  };

  return (
    <div
      className={styles.moduleCard}
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleCardClick();
        }
      }}
    >
      {/* Photo Container */}
      <div className={styles.cardIcon}>
        {imgSrc && !imgError && !isPdf ? (
          <img
            src={imgSrc}
            alt={project?.s_project_name || 'Project Photo'}
            onError={handleImageError}
            loading="lazy"
          />
        ) : isPdf ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <FileText size={26} color="#003c96" />
            <span style={{ fontSize: '10px', fontWeight: 700, color: '#003c96' }}>PDF</span>
          </div>
        ) : (
          <svg viewBox="0 0 48 48" fill="none" style={{ width: 28, height: 28 }}>
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
        )}
      </div>

      {/* Project Details */}
      <div className={styles.cardContent}>
        <div className={styles.cardHeaderRow}>
          <span className={styles.cardCategoryBadge}>{project?.s_region || 'GLOBAL'}</span>
          {project?.s_project_no && (
            <span className={styles.cardProjectNo}>No: {project.s_project_no}</span>
          )}
        </div>
        <h2 className={styles.cardTitle}>{project?.s_project_name || 'NPD Project'}</h2>
        <p className={styles.cardDesc}>{project?.s_component || 'Packaging Component'}</p>
        <p className={styles.cardExamples}>Click to view single project tracking details</p>
      </div>

      <div className={styles.cardArrow}>→</div>
    </div>
  );
}
