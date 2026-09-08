import React, { createContext, useState, useContext } from 'react';

const SupplierQualityContext = createContext(null);

export function SupplierQualityProvider({ children }) {
  // Placeholder for future state (e.g., masterData API caching)
  const [masterData, setMasterData] = useState(null);

  const value = {
    masterData,
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
