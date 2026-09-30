import React, { createContext, useState, useEffect, useCallback, useMemo } from 'react';
import { BASE_URL, parseIndianNumber } from '../constants/wccConstants';

export const WccContext = createContext(null);

export function WccProvider({ children }) {
  const [userRole, setUserRole] = useState('In');
  const [userLevel, setUserLevel] = useState('1'); // '1', '2', '3', '4'
  const [requests, setRequests] = useState([]);
  const [forwardedRequests, setForwardedRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null); // { message, type: 'success' | 'error' | 'info' }

  // Location & Meta data
  const [locations, setLocations] = useState([]);
  const [plantCodes, setPlantCodes] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [metaDefaults, setMetaDefaults] = useState({
    reqCompany: '',
    campCode: '',
    region: '',
    country: '',
    asset: '',
  });

  // Current session user details
  const uid = localStorage.getItem('uid') || '';
  const loginId = localStorage.getItem('loginId') || '';

  // Toast notifier helper
  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
  }, []);

  const hideToast = useCallback(() => {
    setToast(null);
  }, []);

  // 1. Fetch User Level & Role from Backend
  const fetchUserLevel = useCallback(async () => {
    const curUid = localStorage.getItem('uid') || uid || '';
    const curLoginId = localStorage.getItem('loginId') || loginId || '';
    if (!curUid && !curLoginId) return { userRole: 'In', userLevel: '1' };

    try {
      const response = await fetch(
        `${BASE_URL}/workcompletionRoute/get_lvl?uid=${encodeURIComponent(curUid)}&loginId=${encodeURIComponent(curLoginId)}`
      );
      if (!response.ok) throw new Error('Failed to fetch level');
      const data = await response.json();

      let role = 'In';
      let level = '1';

      if (!data || data.length === 0) {
        setUserRole('In');
        setUserLevel('1');
        return { userRole: 'In', userLevel: '1' };
      }

      for (let i = 0; i < data.length; i++) {
        level = String(data[i].n_level);
        role = data[i].s_role;
      }

      setUserLevel(level);
      setUserRole(role);
      return { userRole: role, userLevel: level };
    } catch (err) {
      console.error('Error fetching WCC level:', err);
      setUserRole('In');
      setUserLevel('1');
      return { userRole: 'In', userLevel: '1' };
    }
  }, [uid, loginId]);

  // 2. Fetch Requests List
  const fetchRequestList = useCallback(async () => {
    const curUid = localStorage.getItem('uid') || uid || '';
    const curLoginId = localStorage.getItem('loginId') || loginId || '';
    if (!curUid && !curLoginId) return;
    setLoading(true);

    try {
      const response = await fetch(
        `${BASE_URL}/workcompletionRoute/get_list_of_request?uid=${encodeURIComponent(curUid)}&loginId=${encodeURIComponent(curLoginId)}`
      );
      if (!response.ok) throw new Error('Failed to fetch request list');
      const data = await response.json();

      const processedData = (Array.isArray(data) ? data : []).map((row) => {
        let totalAmountSum = 0;
        if (row.s_asset_details) {
          try {
            const cleanString = String(row.s_asset_details)
              .replace(/\t/g, '\\t')
              .replace(/\n/g, '\\n');
            const assetDetails = JSON.parse(cleanString);
            if (Array.isArray(assetDetails)) {
              totalAmountSum = assetDetails.reduce((sum, item) => {
                const amount = parseFloat(item.totalAmount) || 0;
                return sum + amount;
              }, 0);
            }
          } catch {
            totalAmountSum = 0;
          }
        }
        return {
          ...row,
          totalAmountSum,
        };
      });

      setRequests(processedData);
    } catch (err) {
      console.error('Error fetching request list:', err);
      showToast('Error loading requests list', 'error');
    } finally {
      setLoading(false);
    }
  }, [uid, loginId, showToast]);

  // 3. Fetch Forwarded Requests List
  const fetchForwardedList = useCallback(async () => {
    const curUid = localStorage.getItem('uid') || uid || '';
    const curLoginId = localStorage.getItem('loginId') || loginId || '';
    if (!curUid && !curLoginId) return;

    try {
      const response = await fetch(
        `${BASE_URL}/workcompletionRoute/get_list_of_forwarded_request?uid=${encodeURIComponent(curUid)}&loginId=${encodeURIComponent(curLoginId)}`
      );
      if (!response.ok) return;
      const data = await response.json();

      if (Array.isArray(data) && data.length > 0) {
        const processedData = data.map((row) => {
          let totalAmountSum = 0;
          if (row.s_asset_details) {
            try {
              const cleanString = String(row.s_asset_details)
                .replace(/\t/g, '\\t')
                .replace(/\n/g, '\\n');
              const assetDetails = JSON.parse(cleanString);
              if (Array.isArray(assetDetails)) {
                totalAmountSum = assetDetails.reduce((sum, item) => {
                  const amount = parseFloat(item.totalAmount) || 0;
                  return sum + amount;
                }, 0);
              }
            } catch {
              totalAmountSum = 0;
            }
          }
          return {
            ...row,
            totalAmountSum,
          };
        });
        setForwardedRequests(processedData);
      } else {
        setForwardedRequests([]);
      }
    } catch (err) {
      console.error('Error fetching forwarded requests:', err);
    }
  }, [uid, loginId]);

  // 4. Fetch Locations, Company, Plants (window.get_reg_loc_lvl legacy logic)
  const get_reg_loc_lvl = useCallback(async () => {
    const curUid = localStorage.getItem('uid') || uid || '';
    const curLoginId = localStorage.getItem('loginId') || loginId || '';

    try {
      const response = await fetch(`${BASE_URL}/workcompletionRoute/get_reg_loc`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: curUid,
          loginId: curLoginId,
          work_Comp: 'work_Comp',
        }),
      });
      if (!response.ok) return null;
      const result = await response.json();
      const data = result.data || [];

      let reqCompany = '';
      let region = '';
      let campCode = '';
      let country = '';
      let asset = '';

      if (data.length > 0) {
        reqCompany = (data[0].s_company_code || '') + '-EPL Limited';
        region = data[0].s_region || '';
        campCode = data[0].s_company_code || '';
        country = data[0].s_country || '';
        asset = data[0].s_asset || '';
      }

      // LOCATION unique
      const locList = [];
      for (let i = 0; i < data.length; i++) {
        const loc = data[i].s_location;
        if (loc && locList.indexOf(loc) === -1) {
          locList.push(loc);
        }
      }

      let defaultLocation = '';
      if (locList.length === 1) {
        defaultLocation = locList[0];
      } else if (locList.length > 1) {
        defaultLocation = '';
      }

      // PLANT CODE unique
      const pCodeList = [];
      for (let k = 0; k < data.length; k++) {
        const code = data[k].s_plant_code;
        if (code && pCodeList.indexOf(code) === -1) {
          pCodeList.push(code);
        }
      }

      let defaultPlantCode = '';
      if (pCodeList.length === 1) {
        defaultPlantCode = pCodeList[0];
      } else if (pCodeList.length > 1) {
        defaultPlantCode = '';
      }

      const meta = {
        reqCompany,
        region,
        country,
        asset,
        campCode,
      };

      setMetaDefaults(meta);
      setLocations(locList);
      setPlantCodes(pCodeList);

      return {
        data,
        metaDefaults: meta,
        locations: locList,
        plantCodes: pCodeList,
        defaultLocation,
        defaultPlantCode,
        requestorName: curUid,
      };
    } catch (err) {
      console.error('Error fetching reg loc:', err);
      return null;
    }
  }, [uid, loginId]);

  // Attach to window.get_reg_loc_lvl to preserve original logic for external scripts/calls
  useEffect(() => {
    window.get_reg_loc_lvl = get_reg_loc_lvl;
    return () => {
      delete window.get_reg_loc_lvl;
    };
  }, [get_reg_loc_lvl]);

  // 5. Fetch Departments
  const fetchDepartments = useCallback(async () => {
    const curUid = localStorage.getItem('uid') || uid || '';
    try {
      const response = await fetch(
        `${BASE_URL}/workcompletionRoute/get_dep?uid=${encodeURIComponent(curUid)}`
      );
      if (!response.ok) return;
      const result = await response.json();
      const data = result.data || [];
      const deptList = data.map((d) => d.s_department).filter(Boolean);
      setDepartments(deptList);
    } catch (err) {
      console.error('Error fetching departments:', err);
    }
  }, [uid]);

  // 6. Delete Request
  const deleteRequest = useCallback(async (n_id) => {
    if (!window.confirm('Are you sure you want to delete this request?')) return;

    try {
      const response = await fetch(
        `${BASE_URL}/workcompletionRoute/delete_request?n_id=${encodeURIComponent(n_id)}`
      );
      if (!response.ok) throw new Error('Failed to delete request');
      showToast('Request Deleted!', 'success');
      fetchRequestList();
    } catch (err) {
      console.error('Error deleting request:', err);
      showToast('Failed to delete request', 'error');
    }
  }, [fetchRequestList, showToast]);

  // Calculate Summary Counts from Requests
  const summaryCounts = useMemo(() => {
    let completed = 0;
    let projectHead = 0;
    let unitHead = 0;
    let capexController = 0;

    requests.forEach((r) => {
      const lvl = Number(r.n_level);
      if (lvl === 5) {
        completed++;
      } else if (lvl === 3) {
        projectHead++;
      } else if (lvl === 2) {
        unitHead++;
      } else if (lvl === 4) {
        capexController++;
      }
    });

    return {
      completed,
      projectHead,
      unitHead,
      capexController,
    };
  }, [requests]);

  useEffect(() => {
    fetchUserLevel();
    fetchRequestList();
    fetchForwardedList();
    get_reg_loc_lvl();
    fetchDepartments();
  }, [fetchUserLevel, fetchRequestList, fetchForwardedList, get_reg_loc_lvl, fetchDepartments]);

  const value = {
    userRole,
    userLevel,
    requests,
    forwardedRequests,
    loading,
    summaryCounts,
    locations,
    plantCodes,
    departments,
    metaDefaults,
    toast,
    showToast,
    hideToast,
    fetchUserLevel,
    fetchRequestList,
    fetchForwardedList,
    fetchRegLoc: get_reg_loc_lvl,
    get_reg_loc_lvl,
    fetchDepartments,
    deleteRequest,
    uid,
    loginId,
  };

  return <WccContext.Provider value={value}>{children}</WccContext.Provider>;
}
