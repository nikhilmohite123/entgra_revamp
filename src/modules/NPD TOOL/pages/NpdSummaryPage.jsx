import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import styles from '../styles/npdSummary.module.css';
import NpdHeader from '../components/NpdHeader';
import NpdSummaryFilterBar from '../components/NpdSummaryFilterBar';
import NpdSummaryTable from '../components/NpdSummaryTable';
import { BASE_URL } from '../constants/npdConstants';

export default function NpdSummaryPage() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const forIdeaHub = queryParams.get('from') === 'ideahub';

  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [summaryData, setSummaryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [imageZoomUrl, setImageZoomUrl] = useState(null);

  // Fetch summary data when selected category changes
  const baseUrl = BASE_URL;
  const fetchSummaryData = async (ctg) => {
    setLoading(true);
    try {
      const response = await fetch(`${baseUrl}/npd/getnpdsummry`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ s_component: ctg }),
      });
      const result = await response.json();

      if (result && Array.isArray(result.data)) {
        // Deduplicate by n_npdtracking_id
        const uniqueData = [];
        const idSet = {};
        result.data.forEach((item) => {
          if (!idSet[item.n_npdtracking_id]) {
            idSet[item.n_npdtracking_id] = true;
            uniqueData.push(item);
          }
        });
        setSummaryData(uniqueData);
      } else {
        setSummaryData([]);
      }
    } catch (err) {
      console.error('Error fetching NPD summary data:', err);
      setSummaryData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummaryData(selectedCategory);
  }, [selectedCategory]);

  return (
    <div>
      {/* NPD Header */}
      <NpdHeader />

      {/* Main Container */}
      <div className={styles.mainContainer} id="mainContainer">
        {/* Component Category Filter Buttons */}
        <NpdSummaryFilterBar
          selectedCategory={selectedCategory}
          onSelectCategory={(cat) => setSelectedCategory(cat)}
        />

        {/* Loading Spinner or Summary Table */}
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading summary...</span>
            </div>
            <p className="mt-2 text-muted fw-bold">Loading NPD Summary...</p>
          </div>
        ) : (
          <NpdSummaryTable
            summaryData={summaryData}
            selectedCategory={selectedCategory}
            onImageClick={(url) => setImageZoomUrl(url)}
          />
        )}
      </div>

      {/* Full Image Zoom Modal */}
      {imageZoomUrl && (
        <div className={styles.imageModalOverlay} onClick={() => setImageZoomUrl(null)}>
          <img src={imageZoomUrl} alt="Zoomed View" className={styles.zoomedImage} />
        </div>
      )}
    </div>
  );
}
