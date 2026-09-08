import React, { createContext, useState, useEffect, useCallback, useMemo } from 'react';
import { CATEGORY_LABELS } from '../constants/ideaHubConstants';
import { ENV } from '../../../config/env';

export const IdeaHubContext = createContext(null);

export function IdeaHubProvider({ children }) {
  // Shared in-memory Category state (default to Category 1: Commercialised Innovations)
  const [selectedCategory, setSelectedCategoryState] = useState(1);
  const [selectedModule, setSelectedModuleState] = useState('material');

  // User Profile & NPD Authorization state
  const [userProfile, setUserProfile] = useState(() => {
    const uid = localStorage.getItem('uid') || '';
    const storedEmpName = localStorage.getItem('empName') || '';
    const storedLoc = localStorage.getItem('loc') || '';
    const storedCountry = localStorage.getItem('country') || 'India';

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
      uid: uid ? `UID: ${uid}` : '',
      rawUid: uid,
      country: storedCountry,
      location: storedLoc,
      initials,
    };
  });

  const [isAccessNDP, setIsAccessNDP] = useState(false);
  const [userRole, setUserRole] = useState(0); // 1 = Admin, 0 = Normal
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Set category handler
  const setSelectedCategory = useCallback((catNum) => {
    setSelectedCategoryState(catNum);
  }, []);

  // Set module handler
  const setSelectedModule = useCallback((moduleKey) => {
    setSelectedModuleState(moduleKey);
  }, []);

  // Load user profile & NPD authorization on mount or refresh
  const refreshUserProfile = useCallback(async () => {
    const uid = localStorage.getItem('uid') || '';
    if (!uid) {
      setAuthLoading(false);
      return;
    }

    setAuthLoading(true);
    setAuthError(null);

    try {
      const [authRes, userRes] = await Promise.allSettled([
        fetch(`${ENV.API_BASE_URL}/api/innovations/checkid?username=${encodeURIComponent(uid)}`).then(
          (r) => (r.ok ? r.json() : null)
        ),
        fetch(`${ENV.API_BASE_URL}/api/innovations/userdetail?username=${encodeURIComponent(uid)}`).then(
          (r) => (r.ok ? r.json() : null)
        ),
      ]);

      if (authRes.status === 'fulfilled' && authRes.value) {
        setIsAccessNDP(Boolean(authRes.value.authorized));
        setUserRole(Number(authRes.value.role) === 1 ? 1 : 0);
      }

      if (userRes.status === 'fulfilled' && userRes.value && userRes.value.success && userRes.value.data) {
        const data = userRes.value.data;
        const formattedName = (data.s_emp_name || userProfile.name || 'User')
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

        setUserProfile({
          name: formattedName,
          uid: uid ? `UID: ${uid}` : '',
          rawUid: uid,
          country: data.s_country || userProfile.country || '—',
          location: data.s_location || userProfile.location || '—',
          initials,
        });
      }
    } catch (err) {
      console.error('Idea Hub auth initialization error:', err);
      setAuthError(err.message || 'Failed to authenticate user profile');
    } finally {
      setAuthLoading(false);
    }
  }, [userProfile.country, userProfile.location, userProfile.name]);

  useEffect(() => {
    refreshUserProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const activeCategoryObj = useMemo(() => {
    return selectedCategory ? CATEGORY_LABELS[selectedCategory] || null : null;
  }, [selectedCategory]);

  const value = useMemo(
    () => ({
      selectedCategory,
      activeCategoryObj,
      setSelectedCategory,
      selectedModule,
      setSelectedModule,
      userProfile,
      isAccessNDP,
      userRole,
      authLoading,
      authError,
      refreshUserProfile,
    }),
    [
      selectedCategory,
      activeCategoryObj,
      setSelectedCategory,
      selectedModule,
      setSelectedModule,
      userProfile,
      isAccessNDP,
      userRole,
      authLoading,
      authError,
      refreshUserProfile,
    ]
  );

  return <IdeaHubContext.Provider value={value}>{children}</IdeaHubContext.Provider>;
}

export default IdeaHubContext;
