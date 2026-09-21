import React, { useState, useEffect } from 'react';
import styles from '../styles/atrModal.module.css';
import { BASE_URL, ALLOWED_PLANTS } from '../constant/atrConstants';
import auditImg from "../Assests/audit.png";
import atrToast from './AtrToast';

export default function AtrRegionModal({
  isOpen,
  empLocation,
  onAuthorized,
  onClose
}) {
  const [regions, setRegions] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState('');
  const [plants, setPlants] = useState([]);
  const [selectedPlant, setSelectedPlant] = useState('');
  const [loadingRegions, setLoadingRegions] = useState(false);
  const [loadingPlants, setLoadingPlants] = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(false);
  const [error, setError] = useState('');

  // Fetch all available regions on modal mount
  useEffect(() => {
    if (!isOpen) return;

    const fetchRegions = async () => {
      setLoadingRegions(true);
      setError('');
      try {
        const res = await fetch(`${BASE_URL}/AtrRoute/get_region`);
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();
        if (Array.isArray(data)) {
          setRegions(data);
        } else {
          setRegions([]);
        }
      } catch (err) {
        console.error('Error fetching ATR regions:', err);
        setError('Failed to load regions. Please check server connection.');
      } finally {
        setLoadingRegions(false);
      }
    };

    fetchRegions();
  }, [isOpen]);

  // Handle region dropdown change
  const handleRegionChange = async (e) => {
    const regionVal = e.target.value;
    setSelectedRegion(regionVal);
    setSelectedPlant('');
    setPlants([]);

    if (!regionVal) return;

    setLoadingPlants(true);
    setError('');
    try {
      const queryUrl = `${BASE_URL}/AtrRoute/get_plant_data?S_REGION=${encodeURIComponent(regionVal)}`;
      const res = await fetch(queryUrl);
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      if (Array.isArray(data)) {
        // Filter by predefined allowed plants
        const filtered = data.filter(
          (item) => item.S_LOCATION && ALLOWED_PLANTS.includes(item.S_LOCATION)
        );
        setPlants(filtered);
      } else {
        setPlants([]);
      }
    } catch (err) {
      console.error('Error fetching plant data:', err);
      setError('Failed to load plant data.');
    } finally {
      setLoadingPlants(false);
    }
  };

  // Handle plant dropdown change and check region access
  const handlePlantChange = async (e) => {
    const plantVal = e.target.value;
    setSelectedPlant(plantVal);

    if (!plantVal) return;

    setCheckingAccess(true);
    setError('');

    const uid = localStorage.getItem('uid') || '';

    // Check bypass for master admins directly
    if (uid === 'pallav.bhatnagar' || uid === 'vinay.thakur' || uid === '') {
      onAuthorized(true);
      onClose();
      setCheckingAccess(false);
      return;
    }

    try {
      const locParam = empLocation || plantVal;
      const queryUrl = `${BASE_URL}/AtrRoute/cheack_region_vise_acces?loc=${encodeURIComponent(locParam)}`;
      const res = await fetch(queryUrl);
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      console.log('region ----:', data);

      if (Array.isArray(data) && data.length > 0) {
        const userRegion = data[0].S_REGION;
        console.log('User Region from API:', userRegion);
        console.log('Selected Region:', selectedRegion);
        if (userRegion === selectedRegion) {
          onAuthorized(true);
          onClose();
        } else {
          atrToast.error('You are not authorised to view data');
          onAuthorized(false);
        }
      } else {
        atrToast.error('You are not authorised to view data');
        onAuthorized(false);
      }
    } catch (err) {
      console.error('Error checking region access:', err);
      atrToast.error('Something went wrong while retrieving data.');
      onAuthorized(false);
    } finally {
      setCheckingAccess(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} id="dropdown">
      <div className={styles.modalContent}>
        <div className={styles.rowc}>
          <img
            src={auditImg}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://www.eplglobal.com/wp-content/uploads/2024/06/main_logo.svg';
            }}
            alt="EPL"
            className={styles.modalImage}
          />

          <div className={styles.dropdownContainer}>
            <div className={styles.dropdownGroup}>
              <h3 className={styles.dropdownTitle}>Select Region</h3>
              <select
                id="regionDropdown"
                className={styles.selectInput}
                value={selectedRegion}
                onChange={handleRegionChange}
                disabled={loadingRegions}
              >
                <option value="">-- Select Region --</option>
                {regions.map((item, index) => (
                  <option key={index} value={item.s_region}>
                    {item.s_region}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.dropdownGroup}>
              <h3 className={styles.dropdownTitle}>Select Plant</h3>
              <select
                id="LocDD"
                className={styles.selectInput}
                value={selectedPlant}
                onChange={handlePlantChange}
                disabled={!selectedRegion || loadingPlants || checkingAccess}
              >
                <option value="" disabled selected={!selectedPlant}>
                  -- Select Plant --
                </option>
                {plants.map((item, index) => (
                  <option key={index} value={item.S_LOCATION}>
                    {item.S_LOCATION}
                  </option>
                ))}
              </select>
            </div>

            {(loadingRegions || loadingPlants || checkingAccess) && (
              <div className={styles.spinnerContainer}>
                <span>Loading...</span>
              </div>
            )}

            {error && <div className={styles.errorText}>{error}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
