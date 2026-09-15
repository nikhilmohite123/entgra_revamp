import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    // Read from localStorage on mount. 
    // Fallback included to emulate existing system behavior.
    const storedUid = localStorage.getItem('uid');
    setUserId(storedUid || 'admin@eplglobal.com');
  }, []);

  const value = {
    userId,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to consume the AuthContext easily
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
