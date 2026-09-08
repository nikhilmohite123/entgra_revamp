import React, { createContext, useState, useEffect, useCallback, useMemo } from 'react';
import { ADMIN_UID } from '../constants/samplePortalConstants';
import { ENV } from '../../../config/env';

export const SamplePortalContext = createContext(null);

export function SamplePortalProvider({ children }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentTab, setCurrentTab] = useState('Open');
  const [searchTerm, setSearchTerm] = useState('');

  // User Profile
  const [userProfile] = useState(() => {
    const uid = localStorage.getItem('uid') || '';
    const storedEmpName = localStorage.getItem('empName') || '';
    const storedLoc = localStorage.getItem('loc') || '';

    const formattedName = (storedEmpName || uid || 'User')
      .replace(/[.]+/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());

    const initials =
      formattedName
        .split(' ')
        .filter(Boolean)
        .map((part) => part[0])
        .slice(0, 2)
        .join('')
        .toUpperCase() || 'US';

    return {
      name: formattedName,
      uid,
      location: storedLoc || '—',
      initials,
    };
  });

  const [isAdmin, setIsAdmin] = useState(() => {
    const uid = localStorage.getItem('uid') || '';
    return uid.toLowerCase() === ADMIN_UID.toLowerCase();
  });

  // Fetch Requests directly on context
  const fetchRequests = useCallback(async () => {
    const uid = localStorage.getItem('uid') || '';
    if (!uid) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${ENV.API_BASE_URL}/bpmn/api/sample?username=${encodeURIComponent(uid)}`
      );
      if (!response.ok) {
        throw new Error(`Failed to load requests (Status: ${response.status})`);
      }
      const res = await response.json();
      if (res && res.success) {
        setRequests(res.data || []);
        if (res.isAdmin !== undefined) {
          setIsAdmin(Boolean(res.isAdmin) || uid.toLowerCase() === ADMIN_UID.toLowerCase());
        }
      } else {
        setError(res?.message || 'Failed to load sample requests.');
      }
    } catch (err) {
      console.error('Sample requests fetch error:', err);
      setError(err.message || 'Network error while loading sample requests.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const value = useMemo(
    () => ({
      requests,
      setRequests,
      loading,
      error,
      currentTab,
      setCurrentTab,
      searchTerm,
      setSearchTerm,
      isAdmin,
      setIsAdmin,
      userProfile,
      fetchRequests,
    }),
    [
      requests,
      loading,
      error,
      currentTab,
      searchTerm,
      isAdmin,
      userProfile,
      fetchRequests,
    ]
  );

  return (
    <SamplePortalContext.Provider value={value}>
      {children}
    </SamplePortalContext.Provider>
  );
}

export default SamplePortalContext;
