import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Clock, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import styles from '../styles/overtime.module.css';
import { BASE_URL, get12hrsformat } from '../constants/overtimeConstants';

const OT_REASONS = [
  'Rework',
  'Recruitment Pending',
  'Client Working',
  'Internal Meeting',
  'Absenteeism',
  'Work Exigencies',
  'Planned Additional Work',
  'Training',
  'Outdoor work',
  'Others',
];

export default function OtRequisitionPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const uid = localStorage.getItem('uid') || '';
  const otIdFromUrl = searchParams.get('id') || '';

  // Header State
  const [supervisorName, setSupervisorName] = useState('');
  const [unitName, setUnitName] = useState('');
  const [supervisorDept, setSupervisorDept] = useState('');
  const [plantId, setPlantId] = useState('');
  const [otDate, setOtDate] = useState('');
  const [minDate, setMinDate] = useState('');
  const [headerCreated, setHeaderCreated] = useState(false);
  const [currentOtId, setCurrentOtId] = useState(otIdFromUrl);

  // Child Data State
  const [empDataList, setEmpDataList] = useState([]);
  const [childTableList, setChildTableList] = useState([]);
  const [submittingHeader, setSubmittingHeader] = useState(false);
  const [submittingChild, setSubmittingChild] = useState(false);

  // New Child Row Inputs
  const [selectedEmpId, setSelectedEmpId] = useState('');
  const [deptName, setDeptName] = useState('');
  const [hodList, setHodList] = useState('');
  const [otReason, setOtReason] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [description, setDescription] = useState('');
  const [actualHrs, setActualHrs] = useState(''); // diff_min
  const [totalOtHrsUse, setTotalOtHrsUse] = useState(''); // diff_min + othr
  const [totOtHourAllow, setTotOtHourAllow] = useState('960'); // Monthly allowed

  // Dynamic limits from emp_ot_hrs
  const [data2Limits, setData2Limits] = useState(null); // n_fix_hr_monthly, n_fix_hr_quaterly, etc.
  const [data3Wk, setData3Wk] = useState(0);
  const [data4Qrtr, setData4Qrtr] = useState(0);
  const [data5Month, setData5Month] = useState(0);
  const [baseOthr, setBaseOthr] = useState(0);

  // 1. Fetch Employee List for Dropdown
  const getEmpName = useCallback(async (unit, dept, plant) => {
    try {
      const payload = {
        unit_name: unit,
        dept_name: dept,
        plant: plant,
        uid: localStorage.getItem('uid') || '',
      };
      const response = await fetch(`${BASE_URL}/otPro/get_emp_nameforot`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (response.ok) {
        const result = await response.json();
        setEmpDataList(Array.isArray(result) ? result : []);
      }
    } catch (err) {
      console.error('Error fetching emp list:', err);
    }
  }, []);

  // 2. Fetch Child Table List
  const fetchTableOfEmp = useCallback(async (id) => {
    if (!id) return;
    try {
      const response = await fetch(`${BASE_URL}/otPro/tabl_of_emp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ id }).toString(),
      });
      if (response.ok) {
        const result = await response.json();
        setChildTableList(Array.isArray(result) ? result : []);
      }
    } catch (err) {
      console.error('Error fetching child table:', err);
    }
  }, []);

  // 3. Contractor / Header Data by ID
  const getContractorDataById = useCallback(
    async (id) => {
      try {
        const response = await fetch(`${BASE_URL}/otPro/get_Contractor_dataById`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ot_id: id }),
        });
        if (response.ok) {
          const result = await response.json();
          const first = result?.[0];
          if (first) {
            setSupervisorName(first.s_supervisor_name || '');
            setUnitName(first.s_plant_name || '');
            setPlantId(first.n_plant_id || '');
            setSupervisorDept(first.s_department || '');
            setOtDate(first.s_OT_date || '');
            setHeaderCreated(true);
            setCurrentOtId(id);

            getEmpName(first.s_plant_name, first.s_department, first.n_plant_id);
            fetchTableOfEmp(id);
          }
        }
      } catch (err) {
        console.error('Error fetching contractor data by id:', err);
      }
    },
    [getEmpName, fetchTableOfEmp]
  );

  // 4. Initial User Login Data when no ID
  const getUserLoginData = useCallback(async () => {
    try {
      const response = await fetch(`${BASE_URL}/otPro/get_user_loginData`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ uid }).toString(),
      });
      if (response.ok) {
        const result = await response.json();
        const obj = result?.[0];
        if (obj) {
          setSupervisorName(obj.s_email_id || '');
          setUnitName(obj.s_plant_name || '');
          setSupervisorDept(obj.s_department || '');
          setPlantId(obj.n_plant_id || '');
          setHeaderCreated(false);

          // Calculate default claimed date & min date (-7 days)
          const dt = new Date();
          dt.setDate(dt.getDate() - 7);
          const day = ('0' + dt.getDate()).slice(-2);
          const mnth = ('0' + (dt.getMonth() + 1)).slice(-2);
          const yr = dt.getFullYear();
          const defaultDate = `${yr}-${mnth}-${day}`;
          setOtDate(defaultDate);
          setMinDate(defaultDate);
        }
      }
    } catch (err) {
      console.error('Error fetching login data:', err);
    }
  }, [uid]);

  // 5. Delete Header Without Child
  const deleteHeaderWithoutChild = useCallback(async () => {
    try {
      await fetch(
        `${BASE_URL}/otPro/delete_header_without_child?supervisorname=${encodeURIComponent(uid)}`
      );
    } catch (err) {
      console.error('Error in delete_header_without_child:', err);
    } finally {
      getUserLoginData();
    }
  }, [uid, getUserLoginData]);

  // On Mount
  useEffect(() => {
    if (otIdFromUrl) {
      getContractorDataById(otIdFromUrl);
    } else {
      deleteHeaderWithoutChild();
    }
  }, [otIdFromUrl, getContractorDataById, deleteHeaderWithoutChild]);

  // 6. Submit Header (add_supervisorandemp_data)
  const handleAddSupervisorAndEmpData = async () => {
    if (!otDate) {
      return alert('Please Enter OT Date...');
    }

    const date1 = new Date(otDate);
    const date2 = new Date();
    const diffTime = Math.abs(date2 - date1);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (parseInt(diffDays, 10) > 6) {
      return alert('Claimed date is not available for apply OT...');
    }

    const data = {
      supervisorname: supervisorName,
      unitname: unitName,
      supervisor_dept: supervisorDept,
      unitid: plantId,
      otdate: otDate,
    };

    setSubmittingHeader(true);
    try {
      const response = await fetch(`${BASE_URL}/otPro/add_supervisor_detail`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (response.ok) {
        const result = await response.json();
        if (result?.ot_id) {
          setCurrentOtId(result.ot_id);
          setHeaderCreated(true);
          setSearchParams({ id: result.ot_id });
          getEmpName(unitName, supervisorDept, plantId);
          fetchTableOfEmp(result.ot_id);
        }
      }
    } catch (err) {
      console.error('Error adding supervisor details:', err);
    } finally {
      setSubmittingHeader(false);
    }
  };

  // 7. Select Employee Change (emp_OT_hrs)
  const handleEmpChange = async (e) => {
    const empId = e.target.value;
    setSelectedEmpId(empId);

    if (!empId) {
      setDeptName('');
      setHodList('');
      return;
    }

    const indx = empDataList.findIndex((item) => item.n_emp_id == empId);
    if (indx === -1) return;

    const empObj = empDataList[indx];
    const plants = (empObj.s_hod_name || '').split(',');
    setDeptName(empObj.s_department || '');
    setHodList(plants.join(','));

    // Date calculations
    const d = new Date(otDate);
    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    const day = d.getDate();
    const curDate = `${day}-${month}-${year}`;

    try {
      const payload = {
        empid: empId,
        unit: plantId,
        dept: empObj.s_department,
        year,
        month,
        cur_date: curDate,
      };

      const response = await fetch(`${BASE_URL}/otPro/emp_ot_hrs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const result = await response.json();
        const data1 = result?.[0];
        const data2 = result?.[1]?.[0];
        const data3 = result?.[2]?.length ? result[2][0].wk_hrs : 0;
        const data4 = result?.[3]?.length ? result[3][0].qrtr_hrs : 0;
        const data5 = result?.[4]?.length ? result[4][0].month_hrs : 0;

        setData2Limits(data2 || null);
        setData3Wk(data3);
        setData4Qrtr(data4);
        setData5Month(data5);

        let othrVal = 0;
        if (data1?.[0]?.hrs != null) {
          othrVal = data1[0].hrs;
        }
        setBaseOthr(othrVal);
        setTotalOtHrsUse(othrVal);

        if (data2?.n_fix_hr_monthly) {
          setTotOtHourAllow(data2.n_fix_hr_monthly);
        }
      }
    } catch (err) {
      console.error('Error fetching emp_ot_hrs:', err);
    }
  };

  // 8. Time Calculation & Limit Checks (ot_hour)
  const calculateOtHours = (startVal, endVal) => {
    if (!startVal || !endVal) return;

    const startParts = startVal.split(':');
    const endParts = endVal.split(':');

    const startDate = new Date(0, 0, 0, startParts[0], startParts[1], 0);
    const endDate = new Date(0, 0, 0, endParts[0], endParts[1], 0);
    let diff = endDate.getTime() - startDate.getTime();

    let hours = Math.floor(diff / 1000 / 60 / 60);
    diff -= hours * (1000 * 60 * 60);
    const minutes = Math.floor(diff / 1000 / 60);

    if (hours < 0) hours += 24;

    const diffMin = parseInt(hours * 60 + minutes, 10);
    const qurtHr = Number(diffMin) + Number(data4Qrtr);
    const monthHr = Number(diffMin) + Number(data5Month);

    if (diffMin > 240) {
      setEndTime('');
      setActualHrs('');
      setTotalOtHrsUse(baseOthr);
      alert("You can't do OT more than 4 hours..");
      return;
    } else if (data2Limits && qurtHr > data2Limits.n_fix_hr_quaterly) {
      setEndTime('');
      setActualHrs('');
      setTotalOtHrsUse(baseOthr);
      alert('you are exceeding your Quater OT Limit');
      return;
    } else if (data2Limits && monthHr > data2Limits.n_fix_hr_monthly) {
      setEndTime('');
      setActualHrs('');
      setTotalOtHrsUse(baseOthr);
      alert('you are exceeding your Monthly OT Limit');
      return;
    } else {
      const otCalculation = Number(diffMin) + Number(baseOthr);
      setTotalOtHrsUse(otCalculation);
      setActualHrs(diffMin);
    }
  };

  // 9. Add Child Record (add_ot_child)
  const handleAddOtChild = async () => {
    if (!selectedEmpId) return alert('Select Employee Name');
    if (!otReason) return alert('Please select Reason of OT');
    if (!startTime) return alert('Select Start time');
    if (!endTime) return alert('Please select End time');

    const empObj = empDataList.find((e) => e.n_emp_id == selectedEmpId);
    const empDisplayName = empObj ? `${empObj.s_emp_name}--${empObj.n_emp_id}` : selectedEmpId;

    const payload = {
      empname: selectedEmpId,
      name: empDisplayName,
      dept: deptName,
      ot_date: otDate,
      otreason: otReason,
      otstarttime: startTime,
      otendtime: endTime,
      desc: description,
      ot_hr: actualHrs,
      ot_hrs_allow: totOtHourAllow,
      total_OT_hrs: totalOtHrsUse,
      hod: hodList,
      ot_header: currentOtId,
      supervisorname: supervisorName,
      unitid: plantId,
    };

    setSubmittingChild(true);
    try {
      const response = await fetch(`${BASE_URL}/otPro/add_emp_ot_detail`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.message === 'Mail Sent to HOD') {
          // Reset row fields
          setSelectedEmpId('');
          setDeptName('');
          setOtReason('');
          setStartTime('');
          setEndTime('');
          setDescription('');
          setTotalOtHrsUse('');
          setActualHrs('');
          setTotOtHourAllow('960');
          fetchTableOfEmp(currentOtId);
        } else if (result.message === 'Multiple Record') {
          alert("You can't apply OT for multiple times for same date.");
        } else {
          alert('Mail not sent... Please check');
        }
      }
    } catch (err) {
      console.error('Error submitting emp OT detail:', err);
    } finally {
      setSubmittingChild(false);
    }
  };

  // 10. Remove Emp Record (remove_emp_data)
  const handleRemoveEmpData = async (childId) => {
    if (!window.confirm('Are you sure you want to cancel this record?')) return;
    try {
      const response = await fetch(`${BASE_URL}/otPro/remove_emp_data`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ id: childId }).toString(),
      });
      const result = await response.json();
      if (result.message === 'Success') {
        alert('Record cancelled....');
      }
    } catch (err) {
      console.error('Error removing emp data:', err);
    } finally {
      fetchTableOfEmp(currentOtId);
    }
  };

  return (
    <div className={styles.pageContainer}>
      {/* Top Header */}
      <div className={styles.topBar}>
        <div className={styles.titleArea}>
          <h1>
            <Clock size={26} color="#0284c7" />
            Overtime Requisition Form
          </h1>
          <p>Submit and record overtime requests for your department employees</p>
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
            Section Head & Requisition Details
          </div>
        </div>

        <div className={styles.panelBody}>
          {/* Section 1: Header Inputs */}
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Section Head</label>
              <input
                type="text"
                className={styles.formInput}
                value={supervisorName}
                readOnly
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Unit Name</label>
              <input
                type="text"
                className={styles.formInput}
                value={unitName}
                readOnly
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Claim OT Date</label>
              <input
                type="date"
                className={styles.formInput}
                value={otDate}
                min={minDate}
                disabled={headerCreated}
                onChange={(e) => setOtDate(e.target.value)}
              />
            </div>

            {!headerCreated && (
              <div className={styles.formGroup}>
                <button
                  type="button"
                  id="add_headr"
                  className={`${styles.btnAction} ${styles.btnApply}`}
                  style={{ height: '38px', justifyContent: 'center' }}
                  onClick={handleAddSupervisorAndEmpData}
                  disabled={submittingHeader}
                >
                  <Plus size={16} />
                  {submittingHeader ? 'Processing...' : 'Enter & Proceed for OT'}
                </button>
              </div>
            )}
          </div>

          {/* Section 2: Child Table Section (Shown after header creation) */}
          {headerCreated && (
            <div id="div_child" style={{ marginTop: '24px' }}>
              <h4 style={{ fontSize: '15px', fontWeight: 600, color: '#0f172a', marginBottom: '12px' }}>
                Employee Overtime Entries
              </h4>

              <div className={styles.tableWrapper}>
                <table className={styles.otTable}>
                  <thead>
                    <tr>
                      <th style={{ minWidth: '200px' }}>Employee Name</th>
                      <th style={{ minWidth: '130px' }}>Department</th>
                      <th style={{ minWidth: '160px' }}>Reason For OT</th>
                      <th style={{ minWidth: '110px' }}>OT Start Time</th>
                      <th style={{ minWidth: '110px' }}>OT End Time</th>
                      <th style={{ minWidth: '180px' }}>Description</th>
                      <th style={{ minWidth: '130px' }}>Total OT Used (Min)</th>
                      <th style={{ minWidth: '140px' }}>Monthly OT Allow (Min)</th>
                      <th style={{ minWidth: '90px' }}>Action</th>
                    </tr>

                    {/* Entry Row */}
                    <tr className={styles.entryRow}>
                      <td>
                        <select
                          className={styles.tableSelect}
                          value={selectedEmpId}
                          onChange={handleEmpChange}
                        >
                          <option value="">-- Select Employee --</option>
                          {empDataList.map((emp) => (
                            <option key={emp.n_emp_id} value={emp.n_emp_id}>
                              {emp.s_emp_name} -- {emp.n_emp_id}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <input
                          type="text"
                          className={styles.tableInput}
                          value={deptName}
                          readOnly
                          placeholder="Dept"
                        />
                      </td>
                      <td>
                        <select
                          className={styles.tableSelect}
                          value={otReason}
                          onChange={(e) => setOtReason(e.target.value)}
                        >
                          <option value="">Select Reason for OT</option>
                          {OT_REASONS.map((r) => (
                            <option key={r} value={r}>
                              {r}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <input
                          type="time"
                          className={styles.tableInput}
                          value={startTime}
                          onChange={(e) => setStartTime(e.target.value)}
                          onBlur={() => calculateOtHours(startTime, endTime)}
                        />
                      </td>
                      <td>
                        <input
                          type="time"
                          className={styles.tableInput}
                          value={endTime}
                          onChange={(e) => setEndTime(e.target.value)}
                          onBlur={() => calculateOtHours(startTime, endTime)}
                        />
                      </td>
                      <td>
                        <textarea
                          className={styles.tableTextarea}
                          value={description}
                          placeholder="Description..."
                          onChange={(e) => setDescription(e.target.value)}
                        />
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span className={styles.statHighlight}>
                          {totalOtHrsUse !== '' ? totalOtHrsUse : '-'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span className={styles.allowHighlight}>{totOtHourAllow}</span>
                      </td>
                      <td>
                        <button
                          type="button"
                          className={`${styles.btnAction} ${styles.btnApply}`}
                          style={{ padding: '6px 12px', fontSize: '12px' }}
                          onClick={handleAddOtChild}
                          disabled={submittingChild}
                        >
                          {submittingChild ? 'Saving...' : 'Submit'}
                        </button>
                      </td>
                    </tr>
                  </thead>

                  <tbody id="tbody_create_team">
                    {childTableList.length === 0 ? (
                      <tr>
                        <td colSpan="9" className={styles.emptyState}>
                          No overtime entries added yet for this requisition.
                        </td>
                      </tr>
                    ) : (
                      childTableList.map((row, idx) => (
                        <tr key={row.n_child_id || idx}>
                          <td><strong>{row.s_emp_name}</strong></td>
                          <td>{row.s_emp_dept}</td>
                          <td>{row.s_OT_reason}</td>
                          <td>{get12hrsformat(row.d_start_time)}</td>
                          <td>{get12hrsformat(row.d_end_time)}</td>
                          <td>{row.s_description || '-'}</td>
                          <td style={{ textAlign: 'center' }}>
                            <span className={styles.statHighlight}>{row.n_ot_hrs}</span>
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <span className={styles.allowHighlight}>{row.n_allow_ot_hr}</span>
                          </td>
                          <td>
                            <button
                              type="button"
                              className={styles.btnCancel}
                              title="Cancel Record"
                              onClick={() => handleRemoveEmpData(row.n_child_id)}
                            >
                              Cancel
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
