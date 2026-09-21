import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Clock, Save, Edit3, X, Search, ShieldAlert } from 'lucide-react';
import styles from '../styles/overtime.module.css';
import { BASE_URL } from '../constants/overtimeConstants';

// Helper for DD-MM-YYYY <-> YYYY-MM-DD conversion
function formatdateDDMMYY(dateStr) {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  }
  return dateStr;
}

export default function OtFixHourPage() {
  const uid = localStorage.getItem('uid') || '';

  // Super admin authorization check
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Locations dropdown list
  const [locationList, setLocationList] = useState([]);

  // Fix hour list
  const [fixHourList, setFixHourList] = useState([]);
  const [loadingList, setLoadingList] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');

  // Form Fields
  const [unitName, setUnitName] = useState('');
  const [deptName, setDeptName] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [weekHr, setWeekHr] = useState('');
  const [monthHr, setMonthHr] = useState('');
  const [quaterHr, setQuaterHr] = useState('');
  const [otFixId, setOtFixId] = useState('');

  // Edit Mode state
  const [isEditMode, setIsEditMode] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // 1. Fetch Fix Hour List
  const fetchFixHourData = useCallback(async () => {
    setLoadingList(true);
    // Reset form fields like beforeSend
    setUnitName('');
    setDeptName('');
    setFromDate('');
    setToDate('');
    setWeekHr('');
    setMonthHr('');
    setQuaterHr('');
    setOtFixId('');
    setIsEditMode(false);

    try {
      const response = await fetch(`${BASE_URL}/otPro/get_fixhour_data`, {
        method: 'POST',
      });
      if (response.ok) {
        const results = await response.json();
        setFixHourList(Array.isArray(results) ? results : []);
      }
    } catch (err) {
      console.error('Error fetching fixhour data:', err);
    } finally {
      setLoadingList(false);
    }
  }, []);

  // 2. Fetch Locations
  const fetchLocations = useCallback(async () => {
    try {
      const response = await fetch(`${BASE_URL}/global/getlocation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      if (response.ok) {
        const result = await response.json();
        const filtered = (Array.isArray(result) ? result : [])
          .filter((item) => item.S_REGION === 'AMESA')
          .map((item) => ({
            id: item.N_LOCATION_ID,
            name: item.S_LOCATION === 'ASSAM' ? 'GUWAHATI' : item.S_LOCATION,
          }));
        setLocationList(filtered);
      }
    } catch (err) {
      console.error('Error fetching locations:', err);
    } finally {
      fetchFixHourData();
    }
  }, [fetchFixHourData]);

  // 3. Verify Super Admin Authorization
  useEffect(() => {
    const verifySuperAdmin = async () => {
      setCheckingAuth(true);
      try {
        const response = await fetch(`${BASE_URL}/otPro/getAuth`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({ uid }).toString(),
        });
        if (response.ok) {
          const result = await response.json();
          if (result && result.length > 0 && result[0].s_type === 's_admin') {
            setIsSuperAdmin(true);
            fetchLocations();
          } else {
            setIsSuperAdmin(false);
          }
        }
      } catch (err) {
        console.error('Error verifying super admin auth:', err);
      } finally {
        setCheckingAuth(false);
      }
    };

    verifySuperAdmin();
  }, [uid, fetchLocations]);

  // 4. Save New Fix Hour Record (add_Otfixhour_data)
  const handleAddFixHour = async (e) => {
    e.preventDefault();
    if (!unitName) return alert('Please select Unit Name');
    if (!fromDate) return alert('Please select From Date');
    if (!toDate) return alert('Please select To Date');
    if (!weekHr) return alert('Please enter Weekly OT Allowance');
    if (!monthHr) return alert('Please enter Monthly OT Allowance');
    if (!quaterHr) return alert('Please enter Quarterly OT Allowance');

    const data = {
      n_plant_id: unitName,
      s_start_date: formatdateDDMMYY(fromDate),
      s_end_date: formatdateDDMMYY(toDate),
      n_fix_hr: weekHr,
      month_hr: monthHr,
      quater_hr: quaterHr,
    };

    setSubmitting(true);
    try {
      const response = await fetch(`${BASE_URL}/otPro/add_fixhour_detail`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(data).toString(),
      });
      const result = await response.json();
      if (result.message === 'Success') {
        alert('Data Add Successfully');
        fetchFixHourData();
      }
    } catch (err) {
      console.error('Error adding fix hour:', err);
    } finally {
      setSubmitting(false);
    }
  };

  // 5. Load Record for Editing (get_fixhor_data)
  const handleEditRecord = async (n_OT_fix_id) => {
    try {
      const response = await fetch(`${BASE_URL}/otPro/get_ot_fixhourdetail`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ n_OT_fix_id }).toString(),
      });
      if (response.ok) {
        const result = await response.json();
        const record = result?.[0];
        if (record) {
          setUnitName(record.n_plant_id || '');
          setDeptName(record.s_department || '');
          setFromDate(formatdateDDMMYY(record.s_start_date));
          setToDate(formatdateDDMMYY(record.s_end_date));
          setWeekHr(record.n_fix_hr_weekly || '');
          setMonthHr(record.n_fix_hr_monthly || '');
          setQuaterHr(record.n_fix_hr_quaterly || '');
          setOtFixId(record.n_OT_fix_id || '');
          setIsEditMode(true);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }
    } catch (err) {
      console.error('Error loading fix hour detail for edit:', err);
    }
  };

  // 6. Update Record (update_Otfixhour_data)
  const handleUpdateFixHour = async (e) => {
    e.preventDefault();
    if (!unitName) return alert('Please select Unit Name');
    if (!fromDate) return alert('Please select From Date');
    if (!toDate) return alert('Please select To Date');
    if (!weekHr) return alert('Please enter Weekly OT Allowance');
    if (!monthHr) return alert('Please enter Monthly OT Allowance');
    if (!quaterHr) return alert('Please enter Quarterly OT Allowance');

    const data = {
      n_plant_id: unitName,
      s_department: deptName,
      s_start_date: formatdateDDMMYY(fromDate),
      s_end_date: formatdateDDMMYY(toDate),
      n_fix_hr: weekHr,
      month_hr: monthHr,
      quater_hr: quaterHr,
      n_OT_fix_id: otFixId,
    };

    setSubmitting(true);
    try {
      const response = await fetch(`${BASE_URL}/otPro/update_Otfixhour_data`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(data).toString(),
      });
      const result = await response.json();
      if (result.message === 'Success') {
        alert('Data Update Successfully');
        setIsEditMode(false);
        fetchFixHourData();
      }
    } catch (err) {
      console.error('Error updating fix hour:', err);
    } finally {
      setSubmitting(false);
    }
  };

  // Reset form
  const handleCancelEdit = () => {
    setUnitName('');
    setDeptName('');
    setFromDate('');
    setToDate('');
    setWeekHr('');
    setMonthHr('');
    setQuaterHr('');
    setOtFixId('');
    setIsEditMode(false);
  };

  // Filtered List
  const filteredList = fixHourList.filter((row) => {
    if (!searchFilter.trim()) return true;
    const q = searchFilter.toLowerCase();
    const plant = (row.plant === 'ASSAM' ? 'GUWAHATI' : row.plant || '').toLowerCase();
    const start = (row.s_start_date || '').toLowerCase();
    const end = (row.s_end_date || '').toLowerCase();
    return plant.includes(q) || start.includes(q) || end.includes(q);
  });

  if (checkingAuth) {
    return (
      <div className={styles.pageContainer}>
        <div className={styles.loadingSpinner}>Verifying authorization...</div>
      </div>
    );
  }

  if (!isSuperAdmin) {
    return (
      <div className={styles.pageContainer}>
        <div className={styles.panelCard} style={{ maxWidth: '600px', margin: '60px auto', padding: '32px', textAlign: 'center' }}>
          <ShieldAlert size={48} color="#e11d48" style={{ marginBottom: '16px' }} />
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>
            Access Restricted
          </h2>
          <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '24px' }}>
            The Overtime Fix Hour Master is only accessible to Super Administrators.
          </p>
          <Link to="/overtime" className={`${styles.btnAction} ${styles.btnApply}`}>
            <ArrowLeft size={16} />
            Return to Overtime Portal
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      {/* Top Bar */}
      <div className={styles.topBar}>
        <div className={styles.titleArea}>
          <h1>
            <Clock size={26} color="#0284c7" />
            Overtime Fix Hour Form
          </h1>
          <p>Configure weekly, monthly, and quarterly overtime limits per unit</p>
        </div>

        <div className={styles.actionButtons}>
          <Link to="/overtime" className={`${styles.btnAction} ${styles.btnApply}`}>
            <ArrowLeft size={15} />
            Back to Overtime Portal
          </Link>
        </div>
      </div>

      {/* Main Panel */}
      <div className={styles.panelCard}>
        <div className={styles.panelHeader}>
          <div className={styles.panelHeaderTitle}>
            <Clock size={18} />
            {isEditMode ? 'Edit Overtime Fix Hour Rule' : 'Add Overtime Fix Hour Rule'}
          </div>
        </div>

        <div className={styles.panelBody}>
          <form onSubmit={isEditMode ? handleUpdateFixHour : handleAddFixHour}>
            <div className={styles.formRow} style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Unit Name</label>
                <select
                  id="unit_name"
                  className={styles.formInput}
                  value={unitName}
                  onChange={(e) => setUnitName(e.target.value)}
                >
                  <option value="">-- Select Location --</option>
                  {locationList.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>From Date</label>
                <input
                  type="date"
                  id="d_from_date"
                  className={styles.formInput}
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>To Date</label>
                <input
                  type="date"
                  id="d_to_date"
                  className={styles.formInput}
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                />
              </div>
            </div>

            <div className={styles.formRow} style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Weekly OT Allow (In min)</label>
                <input
                  type="number"
                  id="week_hr"
                  min="0"
                  placeholder="e.g. 240"
                  className={styles.formInput}
                  value={weekHr}
                  onChange={(e) => setWeekHr(e.target.value)}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Monthly OT Allow (In min)</label>
                <input
                  type="number"
                  id="month_hr"
                  min="0"
                  placeholder="e.g. 960"
                  className={styles.formInput}
                  value={monthHr}
                  onChange={(e) => setMonthHr(e.target.value)}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Quarterly OT Allow (In min)</label>
                <input
                  type="number"
                  id="quater_hr"
                  min="0"
                  placeholder="e.g. 2880"
                  className={styles.formInput}
                  value={quaterHr}
                  onChange={(e) => setQuaterHr(e.target.value)}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '16px' }}>
              {!isEditMode ? (
                <button
                  type="submit"
                  id="btnAdd"
                  className={`${styles.btnAction} ${styles.btnApply}`}
                  disabled={submitting}
                >
                  <Save size={16} />
                  {submitting ? 'Saving...' : 'Save'}
                </button>
              ) : (
                <>
                  <button
                    type="submit"
                    id="btnUpdate"
                    className={`${styles.btnAction} ${styles.btnReport}`}
                    disabled={submitting}
                  >
                    <Save size={16} />
                    {submitting ? 'Updating...' : 'Update'}
                  </button>
                  <button
                    type="button"
                    className={`${styles.btnAction}`}
                    style={{ backgroundColor: '#e2e8f0', color: '#475569' }}
                    onClick={handleCancelEdit}
                  >
                    <X size={16} />
                    Cancel Edit
                  </button>
                </>
              )}
            </div>
          </form>

          <hr style={{ margin: '32px 0 24px 0', borderColor: '#e2e8f0' }} />

          {/* Table of Existing Master Rules */}
          <div className={styles.tableToolbar}>
            <div className={styles.searchBox}>
              <Search size={16} className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search master rules by unit or date..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
              />
            </div>
          </div>

          <div className={styles.tableWrapper}>
            <table className={styles.otTable}>
              <thead>
                <tr>
                  <th>Unit Name</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Weekly OT Allow (In min)</th>
                  <th>Monthly OT Allow (In min)</th>
                  <th>Quarterly OT Allow (In min)</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody id="tbody_otfixhour">
                {loadingList ? (
                  <tr>
                    <td colSpan="7" className={styles.emptyState}>
                      Loading fix hour master rules...
                    </td>
                  </tr>
                ) : filteredList.length === 0 ? (
                  <tr>
                    <td colSpan="7" className={styles.emptyState}>
                      No fix hour master records found.
                    </td>
                  </tr>
                ) : (
                  filteredList.map((row, idx) => {
                    const plantname = row.plant === 'ASSAM' ? 'GUWAHATI' : row.plant;
                    return (
                      <tr key={row.n_OT_fix_id || idx}>
                        <td><strong>{plantname}</strong></td>
                        <td>{row.s_start_date}</td>
                        <td>{row.s_end_date}</td>
                        <td style={{ textAlign: 'center' }}>
                          <span className={styles.statHighlight}>{row.n_fix_hr_weekly}</span>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <span className={styles.allowHighlight}>{row.n_fix_hr_monthly}</span>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <span className={styles.statHighlight}>{row.n_fix_hr_quaterly}</span>
                        </td>
                        <td>
                          <button
                            type="button"
                            className={styles.btnTrail}
                            title="Edit Record"
                            onClick={() => handleEditRecord(row.n_OT_fix_id)}
                          >
                            <Edit3 size={12} style={{ display: 'inline', marginRight: '4px' }} />
                            Edit
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
