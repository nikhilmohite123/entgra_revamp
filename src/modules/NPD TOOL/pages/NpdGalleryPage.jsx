import React, { useState, useEffect } from 'react';
import styles from '../styles/npdTool.module.css';
import NpdHeader from '../components/NpdHeader';
import ProjectCard from '../components/ProjectCard';
import { BASE_URL } from '../constants/npdConstants';

const fallbackProjects = [
  {
    n_npdtracking_id: 1,
    s_region: 'Americas',
    s_project_no: 'NPD-2024-001',
    s_project_name: 'Sustainable Bio-Polymer Tube',
    s_component: 'Eco-Barrier Laminate Tube',
  },
  {
    n_npdtracking_id: 2,
    s_region: 'Europe',
    s_project_no: 'NPD-2024-002',
    s_project_name: 'Ultra High-Gloss Metallic Cap',
    s_component: 'Cosmetic Dispensing Closure',
  },
  {
    n_npdtracking_id: 3,
    s_region: 'India',
    s_project_no: 'NPD-2024-003',
    s_project_name: 'Pharma Tamper-Evident Seal',
    s_component: 'Child-Resistant Dispenser System',
  },
  {
    n_npdtracking_id: 4,
    s_region: 'East Asia',
    s_project_no: 'NPD-2024-004',
    s_project_name: 'Recyclable Mono-Material Web',
    s_component: 'PCR High-Density Polyethylene',
  },
];

export default function NpdGalleryPage() {
  const [tilesData, setTilesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const baseUrl = BASE_URL;

  const get4DetailsData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${baseUrl}/npd/get_4_tails`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('AJAX Result:', result);

      if (result && result.data && Array.isArray(result.data) && result.data.length > 0) {
        setTilesData(result.data);
      } else {
        setTilesData(fallbackProjects);
      }
    } catch (err) {
      console.warn('AJAX Error or backend offline, showing success stories:', err.message);
      setTilesData(fallbackProjects);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('NpdGalleryPage mounted, fetching tiles data...');
    get4DetailsData();
  }, []);

  return (
    <div className={styles.npdPageWrapper}>
      {/* Header & Navigation */}
      <NpdHeader />

      {/* Main Content Area Styled Like Idea Hub Landing Page */}
      <main className={styles.landingMain}>
        {/* Main Title Section */}
        <div className={styles.heroText}>
          <h1>
            <span className={styles.accent}>success stories</span>
          </h1>
          <p>Select a project to view detailed product development milestones and tracking metrics.</p>
        </div>

        {/* Dynamic Project Cards Grid Container */}
        <div className={styles.cardsContainer} id="cardsContainer">
          {loading ? (
            <>
              <ProjectCard isLoading={true} />
              <ProjectCard isLoading={true} />
              <ProjectCard isLoading={true} />
              <ProjectCard isLoading={true} />
            </>
          ) : error && tilesData.length === 0 ? (
            <div className={styles.statusMessage}>{error}</div>
          ) : tilesData.length === 0 ? (
            <div className={styles.statusMessage}>No projects available</div>
          ) : (
            tilesData.map((project, index) => (
              <ProjectCard key={project.n_npdtracking_id || index} project={project} />
            ))
          )}
        </div>
      </main>
    </div>
  );
}
