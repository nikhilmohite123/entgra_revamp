import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import { getLocations, getSupplierCategories, getCurrencyUom } from '../../../services/supplierQualityService';
import { useAuth } from '../../../../context/AuthContext';

const SupplierQualityContext = createContext(null);

export function SupplierQualityProvider({ children }) {
  const { userId } = useAuth(); // Can be used for logging or role checks if needed
  
  const [masterData, setMasterData] = useState({
    plants: [],
    supplierCategories: [],
    uomList: [],
    currencyList: [],
  });
  const [loadingMasterData, setLoadingMasterData] = useState(true);
  const [masterDataError, setMasterDataError] = useState(null);

  const abortControllerRef = useRef(null);

  useEffect(() => {
    // Allows us to prevent refetching constantly if already loading/loaded
    // We will abort previous requests if they are unexpectedly unmounted
    abortControllerRef.current = new AbortController();

    const fetchMasterData = async () => {
      setLoadingMasterData(true);
      try {
        const signal = abortControllerRef.current.signal;
        
        // Execute fetches in parallel to minimize load times
        const [locationsRes, categoriesRes, currencyUomRes] = await Promise.all([
          getLocations(signal),
          getSupplierCategories(signal),
          getCurrencyUom(signal)
        ]);

        setMasterData({
          plants: locationsRes || [],
          supplierCategories: categoriesRes || [],
          uomList: (currencyUomRes && currencyUomRes.data && currencyUomRes.data[0]) || [],
          currencyList: (currencyUomRes && currencyUomRes.data && currencyUomRes.data[1]) || [],
        });
        setMasterDataError(null);
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error("Failed to fetch Supplier Master Data", err);
          setMasterDataError(err.message || 'Failed to sync master data');
        }
      } finally {
        setLoadingMasterData(false);
      }
    };

    fetchMasterData();

    return () => {
      // Cleanup to abort the fetch if the Provider unmounts 
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const value = {
    masterData,
    loadingMasterData,
    masterDataError,
  };

  return (
    <SupplierQualityContext.Provider value={value}>
      {children}
    </SupplierQualityContext.Provider>
  );
}

export const useSupplierQuality = () => {
  const context = useContext(SupplierQualityContext);
  if (context === undefined) {
    throw new Error('useSupplierQuality must be used within a SupplierQualityProvider');
  }
  return context;
};
