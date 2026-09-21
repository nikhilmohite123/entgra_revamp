import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Database,
  Upload,
  Download,
  AlertTriangle,
  Plus,
  Edit3,
  Trash2,
  Search,
  FileSpreadsheet,
  RefreshCw,
  X,
  CheckCircle2,
} from 'lucide-react';
import styles from '../styles/overtime.module.css';
import { BASE_URL } from '../constants/overtimeConstants';

export default function OtMasterPage() {
  const uid = localStorage.getItem('uid') || '';

  // Location / Master Dropdowns
  const [locationRawData, setLocationRawData] = useState([]);
  const [regions, setRegions] = useState([]);

  // Form (Add / Edit) State
  const [empAutoId, setEmpAutoId] = useState('');
  const [formRegion, setFormRegion] = useState('');
  const [formPlantId, setFormPlantId] = useState('');
  const [empId, setEmpId] = useState('');
  const [empName, setEmpName] = useState('');
  const [empDepart, setEmpDepart] = useState('');
  const [hod, setHod] = useState('');
  const [empEmail, setEmpEmail] = useState('');
  const [empRole, setEmpRole] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Filter Bar State
  const [filterRegion, setFilterRegion] = useState('');
  const [filterPlantId, setFilterPlantId] = useState('');
  const [filterRole, setFilterRole] = useState('');

  // Table Data State
  const [userList, setUserList] = useState([]);
  const [loadingList, setLoadingList] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [pageSize, setPageSize] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);

  // File Upload State
  const [uploadFile, setUploadFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  // 1. Fetch Locations for Dropdowns
  const fetchLocations = useCallback(async () => {
    try {
      const res = await fetch(`${BASE_URL}/global/GETLOCATION`, {
        method: 'POST',
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setLocationRawData(data);
          const uniqueRegions = [...new Set(data.map((item) => item.S_REGION).filter(Boolean))];
          setRegions(uniqueRegions);
        }
      }
    } catch (err) {
      console.error('Error fetching locations:', err);
    }
  }, []);

  // Filtered plants for form dropdown based on formRegion
  const formPlants = useMemo(() => {
    if (!formRegion) {
      return locationRawData.map((loc) => ({
        id: loc.N_LOCATION_ID,
        name: loc.S_LOCATION,
      }));
    }
    return locationRawData
      .filter((loc) => loc.S_REGION === formRegion)
      .map((loc) => ({
        id: loc.N_LOCATION_ID,
        name: loc.S_LOCATION,
      }));
  }, [locationRawData, formRegion]);

  // Filtered plants for filter toolbar based on filterRegion
  const filterPlants = useMemo(() => {
    if (!filterRegion) {
      return locationRawData.map((loc) => ({
        id: loc.N_LOCATION_ID,
        name: loc.S_LOCATION,
      }));
    }
    return locationRawData
      .filter((loc) => loc.S_REGION === filterRegion)
      .map((loc) => ({
        id: loc.N_LOCATION_ID,
        name: loc.S_LOCATION,
      }));
  }, [locationRawData, filterRegion]);

  // 2. Fetch User Master Data
  const fetchUserMaster = useCallback(
    async (regionVal = filterRegion, plantVal = filterPlantId, roleVal = filterRole) => {
      setLoadingList(true);
      try {
        const params = new URLSearchParams();
        params.append('region', regionVal || '');
        params.append('plant_id', plantVal || '');
        params.append('role', roleVal || '');

        const res = await fetch(`${BASE_URL}/otPro/get_usermaster`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: params.toString(),
        });

        if (res.ok) {
          const data = await res.json();
          setUserList(Array.isArray(data) ? data : []);
          setCurrentPage(1);
        }
      } catch (err) {
        console.error('Error fetching user master data:', err);
      } finally {
        setLoadingList(false);
      }
    },
    [filterRegion, filterPlantId, filterRole]
  );

  // Initial Load
  useEffect(() => {
    fetchLocations();
    fetchUserMaster('', '', '');
  }, [fetchLocations, fetchUserMaster]);

  // 3. Reset / Cancel Form
  const handleResetForm = () => {
    setEmpAutoId('');
    setFormRegion('');
    setFormPlantId('');
    setEmpId('');
    setEmpName('');
    setEmpDepart('');
    setHod('');
    setEmpEmail('');
    setEmpRole('');
    setIsEditMode(false);
  };

  // 4. Populate Form for Edit
  const handleEditUser = async (id) => {
    try {
      const params = new URLSearchParams();
      params.append('emp_auto_id', String(id));

      const res = await fetch(`${BASE_URL}/otPro/getuserbyid`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString(),
      });

      if (res.ok) {
        const data = await res.json();
        const userdata = Array.isArray(data) ? data[0] : data;
        if (userdata) {
          setEmpAutoId(userdata.n_OT_user_id || '');
          setEmpId(userdata.n_emp_id || '');
          setEmpName(userdata.s_emp_name || '');
          setEmpDepart(userdata.s_department || '');
          setHod(userdata.s_hod_name || '');
          setEmpEmail(userdata.s_email_id || '');
          setEmpRole(userdata.s_role || '');
          setFormRegion(userdata.s_region || '');
          setFormPlantId(userdata.n_plant_id ? String(userdata.n_plant_id) : '');
          setIsEditMode(true);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }
    } catch (err) {
      console.error('Error fetching user by ID:', err);
      alert('Error fetching user details.');
    }
  };

  // 5. Delete User by ID
  const handleDeleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to delete this master record?')) {
      return;
    }

    try {
      const params = new URLSearchParams();
      params.append('emp_auto_id', String(id));

      const res = await fetch(`${BASE_URL}/otPro/delete_by_id`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString(),
      });

      if (res.ok) {
        alert('Data Deleted Successfully');
        fetchUserMaster();
      } else {
        alert('Failed to delete data.');
      }
    } catch (err) {
      console.error('Error deleting user:', err);
      alert('Some error occurred while deleting.');
    }
  };

  // 6. Add / Update Validation helper
  const validateForm = () => {
    if (empRole === 'emp' && !hod && !empId) {
      alert("HOD's email id or emp id should not be blank");
      return false;
    }
    if (empRole === 'user' && !empEmail) {
      alert('user email id should not be blank');
      return false;
    }

    const checkScript = (str) => typeof str === 'string' && str.toLowerCase().includes('<script>');
    if (
      checkScript(formPlantId) ||
      checkScript(empId) ||
      checkScript(empName) ||
      checkScript(hod) ||
      checkScript(empDepart)
    ) {
      alert('Script Tag is not allowed in Input fields');
      return false;
    }

    return true;
  };

  // 7. Add OT Master User
  const handleAddUser = async (e) => {
    e?.preventDefault();
    if (!validateForm()) return;

    const selectedPlant = formPlants.find((p) => String(p.id) === String(formPlantId));
    const plantName = selectedPlant ? selectedPlant.name : '';

    const payload = {
      region: formRegion,
      plant_name: plantName,
      plant_id: formPlantId,
      emp_id: empId,
      emp_name: empName,
      emp_depart: empDepart,
      hod: hod,
      emp_email: empEmail,
      emp_role: empRole,
    };

    setFormSubmitting(true);
    try {
      const params = new URLSearchParams(payload);
      const res = await fetch(`${BASE_URL}/otPro/add_ot_user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString(),
      });

      const result = await res.json();
      alert(result.message || 'Data Added Successfully');
      handleResetForm();
      fetchUserMaster();
    } catch (err) {
      console.error('Error adding user:', err);
      alert('Some error occurred: ' + err);
    } finally {
      setFormSubmitting(false);
    }
  };

  // 8. Update OT Master User
  const handleUpdateUser = async (e) => {
    e?.preventDefault();
    if (!validateForm()) return;

    const selectedPlant = formPlants.find((p) => String(p.id) === String(formPlantId));
    const plantName = selectedPlant ? selectedPlant.name : '';

    const payload = {
      emp_auto_id: empAutoId,
      region: formRegion,
      plant_name: plantName,
      plant_id: formPlantId,
      emp_id: empId,
      emp_name: empName,
      emp_depart: empDepart,
      hod: hod,
      emp_email: empEmail,
      emp_role: empRole,
    };

    setFormSubmitting(true);
    try {
      const params = new URLSearchParams(payload);
      const res = await fetch(`${BASE_URL}/otPro/update_ot_user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString(),
      });

      const result = await res.json();
      alert(result.message || 'Data Updated Successfully');
      handleResetForm();
      fetchUserMaster();
    } catch (err) {
      console.error('Error updating user:', err);
      alert('Some error occurred: ' + err);
    } finally {
      setFormSubmitting(false);
    }
  };

  // 9. Handle CSV File Upload
  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!uploadFile) {
      alert('Please select a CSV file to upload.');
      return;
    }

    if (!uploadFile.name.toLowerCase().endsWith('.csv')) {
      alert('You can upload only CSV files.');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', uploadFile);

      const res = await fetch(`${BASE_URL}/uploadfile`, {
        method: 'POST',
        body: formData,
      });

      const text = await res.text();
      alert(text || 'File uploaded successfully.');
      setUploadFile(null);
      // Reset input element
      const fileInput = document.getElementById('csv_file_input');
      if (fileInput) fileInput.value = '';
      fetchUserMaster();
    } catch (err) {
      console.error('Error uploading file:', err);
      alert('Error uploading file: ' + err);
    } finally {
      setUploading(false);
    }
  };

  // 10. Sample CSV Download
  const handleDownloadSampleCsv = () => {
    const headers = 'Emp ID,Emp Name,Plant ID,Plant Name,Region,Email ID,Department,HOD ID,Role';
    const sampleRow = '1001,John Doe,1,Mumbai,WEST,john.doe,IT,manager.abc,emp';
    const csvContent = `${headers}\r\n${sampleRow}\r\n`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'Sample_OT_master.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // 11. Filtered & Paginated Rows
  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return userList;
    const q = searchQuery.toLowerCase().trim();
    return userList.filter((u) => {
      return (
        String(u.n_emp_id || '').toLowerCase().includes(q) ||
        String(u.s_emp_name || '').toLowerCase().includes(q) ||
        String(u.n_plant_id || '').toLowerCase().includes(q) ||
        String(u.s_plant_name || '').toLowerCase().includes(q) ||
        String(u.s_region || '').toLowerCase().includes(q) ||
        String(u.s_email_id || '').toLowerCase().includes(q) ||
        String(u.s_department || '').toLowerCase().includes(q) ||
        String(u.s_hod_name || '').toLowerCase().includes(q) ||
        String(u.s_role || '').toLowerCase().includes(q)
      );
    });
  }, [userList, searchQuery]);

  const paginatedUsers = useMemo(() => {
    if (pageSize === -1) return filteredUsers;
    const start = (currentPage - 1) * pageSize;
    return filteredUsers.slice(start, start + pageSize);
  }, [filteredUsers, currentPage, pageSize]);

  const totalPages = pageSize === -1 ? 1 : Math.max(1, Math.ceil(filteredUsers.length / pageSize));

  // 12. Export filtered users to CSV
  const handleExportUsersCsv = () => {
    if (filteredUsers.length === 0) {
      alert('No data available to export.');
      return;
    }

    const headers = ['Emp ID', 'Emp Name', 'Plant ID', 'Plant Name', 'Region', 'Email ID', 'Department', "HOD's Email ID", 'Role'];
    const rows = [headers.join(',')];

    filteredUsers.forEach((u) => {
      const escapeCsv = (val) => {
        if (val === null || val === undefined) return '""';
        return `"${String(val).replace(/"/g, '""')}"`;
      };

      const line = [
        escapeCsv(u.n_emp_id),
        escapeCsv(u.s_emp_name),
        escapeCsv(u.n_plant_id),
        escapeCsv(u.s_plant_name),
        escapeCsv(u.s_region),
        escapeCsv(u.s_email_id),
        escapeCsv(u.s_department),
        escapeCsv(u.s_hod_name),
        escapeCsv(u.s_role),
      ];
      rows.push(line.join(','));
    });

    const csvString = '\uFEFF' + rows.join('\r\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'OT_Master_Data.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className={styles.pageContainer}>
      {/* Top Bar */}
      <div className={styles.topBar}>
        <div className={styles.titleArea}>
          <h1>
            <Database size={26} color="#0284c7" />
            Overtime Master Data
          </h1>
          <p>Manage employees, HOD mappings, unit allocations, and CSV bulk import</p>
        </div>

        <div className={styles.actionButtons}>
          <Link to="/overtime" className={`${styles.btnAction} ${styles.btnApply}`}>
            <ArrowLeft size={16} />
            Back to Overtime Portal
          </Link>
        </div>
      </div>

      {/* Main Grid: Left Form/Upload & Right Data Table */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '24px',
          alignItems: 'start',
        }}
      >
        {/* LEFT COLUMN: Bulk Upload & Add/Edit Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* CSV Bulk Upload Card */}
          <div className={styles.panelCard}>
            <div className={styles.panelHeader}>
              <div className={styles.panelHeaderTitle}>
                <Upload size={18} />
                Bulk Upload CSV
              </div>
            </div>

            <div className={styles.panelBody}>
              <form onSubmit={handleFileUpload}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Select CSV File</label>
                  <input
                    type="file"
                    id="csv_file_input"
                    accept=".csv"
                    className={styles.formInput}
                    onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                  />
                </div>

                <button
                  type="submit"
                  className={`${styles.btnAction} ${styles.btnApply}`}
                  style={{ width: '100%', justifyContent: 'center', height: '38px', marginTop: '8px' }}
                  disabled={uploading || !uploadFile}
                >
                  {uploading ? (
                    <>
                      <RefreshCw size={14} className={styles.spin} />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload size={14} />
                      Upload CSV File
                    </>
                  )}
                </button>
              </form>

              <div style={{ marginTop: '16px', fontSize: '13px' }}>
                <button
                  type="button"
                  onClick={handleDownloadSampleCsv}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    color: '#0284c7',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: 600,
                    padding: 0,
                  }}
                >
                  <Download size={14} />
                  Download Sample CSV Format
                </button>
              </div>

              {/* Warning / Instruction Box */}
              <div
                style={{
                  marginTop: '16px',
                  padding: '12px',
                  backgroundColor: '#fff1f2',
                  border: '1px solid #fecdd3',
                  borderRadius: '6px',
                  fontSize: '12px',
                  color: '#9f1239',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, marginBottom: '6px' }}>
                  <AlertTriangle size={15} color="#e11d48" />
                  Format Requirements for CSV:
                </div>
                <ol style={{ margin: 0, paddingLeft: '18px', lineHeight: '1.5' }}>
                  <li>
                    If your email is <strong>abc.xyz@eplglobal.com</strong>, enter only <strong>abc.xyz</strong>.
                  </li>
                  <li>
                    If multiple HODs exist, separate their IDs with a comma (<strong>,</strong>).
                  </li>
                </ol>
              </div>
            </div>
          </div>

          {/* Add / Edit Employee Master Form */}
          <div className={styles.panelCard}>
            <div className={styles.panelHeader}>
              <div className={styles.panelHeaderTitle}>
                {isEditMode ? <Edit3 size={18} /> : <Plus size={18} />}
                {isEditMode ? 'Update Employee Master' : 'Add Employee Master'}
              </div>
              {isEditMode && (
                <button
                  type="button"
                  onClick={handleResetForm}
                  className={styles.btnAction}
                  style={{ padding: '4px 8px', fontSize: '11px', backgroundColor: '#f1f5f9', color: '#475569' }}
                >
                  <X size={12} />
                  Cancel Edit
                </button>
              )}
            </div>

            <div className={styles.panelBody}>
              <form onSubmit={isEditMode ? handleUpdateUser : handleAddUser}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Region</label>
                  <select
                    className={styles.formInput}
                    value={formRegion}
                    onChange={(e) => {
                      setFormRegion(e.target.value);
                      setFormPlantId('');
                    }}
                  >
                    <option value="">-- Select Region --</option>
                    {regions.map((reg) => (
                      <option key={reg} value={reg}>
                        {reg}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Plant Name</label>
                  <select
                    className={styles.formInput}
                    value={formPlantId}
                    onChange={(e) => setFormPlantId(e.target.value)}
                  >
                    <option value="">-- Select Plant --</option>
                    {formPlants.map((plant) => (
                      <option key={plant.id} value={plant.id}>
                        {plant.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Emp ID</label>
                  <input
                    type="text"
                    className={styles.formInput}
                    placeholder="Enter Employee ID"
                    value={empId}
                    onChange={(e) => setEmpId(e.target.value)}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Emp Name</label>
                  <input
                    type="text"
                    className={styles.formInput}
                    placeholder="Enter Employee Name"
                    value={empName}
                    onChange={(e) => setEmpName(e.target.value)}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Department</label>
                  <input
                    type="text"
                    className={styles.formInput}
                    placeholder="Enter Department"
                    value={empDepart}
                    onChange={(e) => setEmpDepart(e.target.value)}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>HOD ID</label>
                  <input
                    type="text"
                    className={styles.formInput}
                    placeholder="Enter HOD ID (e.g. manager.id)"
                    value={hod}
                    onChange={(e) => setHod(e.target.value)}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Email ID</label>
                  <input
                    type="text"
                    className={styles.formInput}
                    placeholder="Enter Email Username (e.g. abc.xyz)"
                    value={empEmail}
                    onChange={(e) => setEmpEmail(e.target.value)}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Role</label>
                  <select
                    className={styles.formInput}
                    value={empRole}
                    onChange={(e) => setEmpRole(e.target.value)}
                  >
                    <option value="">-- Select Role --</option>
                    <option value="emp">EMP</option>
                    <option value="user">USER</option>
                  </select>
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                  {isEditMode ? (
                    <>
                      <button
                        type="submit"
                        className={`${styles.btnAction} ${styles.btnApply}`}
                        style={{ flex: 1, justifyContent: 'center' }}
                        disabled={formSubmitting}
                      >
                        {formSubmitting ? 'Updating...' : 'Update Record'}
                      </button>
                      <button
                        type="button"
                        className={styles.btnAction}
                        style={{ backgroundColor: '#e2e8f0', color: '#334155' }}
                        onClick={handleResetForm}
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      type="submit"
                      className={`${styles.btnAction} ${styles.btnApply}`}
                      style={{ width: '100%', justifyContent: 'center' }}
                      disabled={formSubmitting}
                    >
                      {formSubmitting ? 'Adding...' : 'Add Record'}
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Filter Toolbar & Master Data Table */}
        <div style={{ gridColumn: 'span 2' }}>
          <div className={styles.panelCard}>
            <div className={styles.panelHeader}>
              <div className={styles.panelHeaderTitle}>
                <Database size={18} />
                Master User Directory
              </div>
              <span className={styles.badgeCount}>{filteredUsers.length}</span>
            </div>

            <div className={styles.panelBody}>
              {/* Filter Row */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: '12px',
                  alignItems: 'flex-end',
                  marginBottom: '16px',
                  padding: '14px',
                  backgroundColor: '#f8fafc',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                }}
              >
                <div className={styles.formGroup} style={{ margin: 0 }}>
                  <label className={styles.formLabel}>Region</label>
                  <select
                    className={styles.formInput}
                    value={filterRegion}
                    onChange={(e) => {
                      setFilterRegion(e.target.value);
                      setFilterPlantId('');
                    }}
                  >
                    <option value="">-- All Regions --</option>
                    {regions.map((reg) => (
                      <option key={reg} value={reg}>
                        {reg}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.formGroup} style={{ margin: 0 }}>
                  <label className={styles.formLabel}>Plant Name</label>
                  <select
                    className={styles.formInput}
                    value={filterPlantId}
                    onChange={(e) => setFilterPlantId(e.target.value)}
                  >
                    <option value="">-- All Plants --</option>
                    {filterPlants.map((plant) => (
                      <option key={plant.id} value={plant.id}>
                        {plant.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.formGroup} style={{ margin: 0 }}>
                  <label className={styles.formLabel}>Role</label>
                  <select
                    className={styles.formInput}
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value)}
                  >
                    <option value="">-- All Roles --</option>
                    <option value="emp">EMP</option>
                    <option value="user">USER</option>
                  </select>
                </div>

                <div>
                  <button
                    type="button"
                    className={`${styles.btnAction} ${styles.btnApply}`}
                    style={{ height: '38px', width: '100%', justifyContent: 'center' }}
                    onClick={() => fetchUserMaster(filterRegion, filterPlantId, filterRole)}
                    disabled={loadingList}
                  >
                    {loadingList ? (
                      <>
                        <RefreshCw size={14} className={styles.spin} />
                        Loading...
                      </>
                    ) : (
                      <>
                        <Search size={14} />
                        Get Data
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Table Toolbar */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '12px',
                  marginBottom: '14px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    className={`${styles.btnAction} ${styles.btnReport}`}
                    onClick={handleExportUsersCsv}
                    disabled={filteredUsers.length === 0}
                  >
                    <FileSpreadsheet size={15} />
                    Export CSV
                  </button>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#475569' }}>
                    <span>Show</span>
                    <select
                      className={styles.formInput}
                      style={{ width: 'auto', padding: '4px 8px', height: '32px' }}
                      value={pageSize}
                      onChange={(e) => {
                        setPageSize(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                    >
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                      <option value={-1}>All</option>
                    </select>
                    <span>entries</span>
                  </div>
                </div>

                <div style={{ position: 'relative', minWidth: '240px' }}>
                  <Search
                    size={16}
                    color="#94a3b8"
                    style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }}
                  />
                  <input
                    type="text"
                    className={styles.formInput}
                    style={{ paddingLeft: '32px', height: '36px' }}
                    placeholder="Search master data..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                  />
                </div>
              </div>

              {/* Master Data Table */}
              <div className={styles.tableResponsive} style={{ overflowX: 'auto', minHeight: '300px' }}>
                <table className={styles.dataTable} id="tbl_master">
                  <thead>
                    <tr>
                      <th style={{ minWidth: '80px' }}>Emp ID</th>
                      <th style={{ minWidth: '140px' }}>Emp Name</th>
                      <th style={{ minWidth: '70px' }}>Plant ID</th>
                      <th style={{ minWidth: '120px' }}>Plant Name</th>
                      <th style={{ minWidth: '90px' }}>Region</th>
                      <th style={{ minWidth: '130px' }}>Email ID</th>
                      <th style={{ minWidth: '120px' }}>Department</th>
                      <th style={{ minWidth: '130px' }}>HOD's Email ID</th>
                      <th style={{ minWidth: '80px' }}>Role</th>
                      <th style={{ minWidth: '90px', textAlign: 'center' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingList ? (
                      <tr>
                        <td colSpan={10} style={{ textAlign: 'center', padding: '36px', color: '#64748b' }}>
                          <RefreshCw size={24} className={styles.spin} style={{ marginBottom: '8px' }} />
                          <div>Loading Master Data...</div>
                        </td>
                      </tr>
                    ) : paginatedUsers.length === 0 ? (
                      <tr>
                        <td colSpan={10} style={{ textAlign: 'center', padding: '36px', color: '#64748b' }}>
                          No master data records found.
                        </td>
                      </tr>
                    ) : (
                      paginatedUsers.map((user) => (
                        <tr key={user.n_OT_user_id}>
                          <td style={{ fontWeight: 600, color: '#0369a1' }}>{user.n_emp_id}</td>
                          <td style={{ fontWeight: 500 }}>{user.s_emp_name}</td>
                          <td>{user.n_plant_id}</td>
                          <td>{user.s_plant_name}</td>
                          <td>{user.s_region}</td>
                          <td>{user.s_email_id}</td>
                          <td>{user.s_department}</td>
                          <td>{user.s_hod_name}</td>
                          <td style={{ textTransform: 'uppercase', fontWeight: 600 }}>{user.s_role}</td>
                          <td style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>
                            <div style={{ display: 'inline-flex', gap: '6px' }}>
                              <button
                                type="button"
                                className={styles.btnAction}
                                style={{
                                  padding: '4px 8px',
                                  fontSize: '12px',
                                  backgroundColor: '#0284c7',
                                  color: '#ffffff',
                                }}
                                title="Edit Record"
                                onClick={() => handleEditUser(user.n_OT_user_id)}
                              >
                                <Edit3 size={13} />
                              </button>
                              <button
                                type="button"
                                className={styles.btnAction}
                                style={{
                                  padding: '4px 8px',
                                  fontSize: '12px',
                                  backgroundColor: '#e11d48',
                                  color: '#ffffff',
                                }}
                                title="Delete Record"
                                onClick={() => handleDeleteUser(user.n_OT_user_id)}
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {filteredUsers.length > 0 && (
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: '16px',
                    flexWrap: 'wrap',
                    gap: '10px',
                    fontSize: '13px',
                    color: '#64748b',
                  }}
                >
                  <div>
                    Showing {pageSize === -1 ? 1 : Math.min((currentPage - 1) * pageSize + 1, filteredUsers.length)} to{' '}
                    {pageSize === -1 ? filteredUsers.length : Math.min(currentPage * pageSize, filteredUsers.length)} of{' '}
                    {filteredUsers.length} entries
                  </div>

                  {pageSize !== -1 && totalPages > 1 && (
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        type="button"
                        className={styles.btnAction}
                        style={{ padding: '6px 12px', fontSize: '12px', backgroundColor: '#f1f5f9', color: '#1e293b' }}
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                      >
                        Previous
                      </button>

                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          padding: '0 12px',
                          fontWeight: 600,
                          color: '#0f172a',
                        }}
                      >
                        {currentPage} / {totalPages}
                      </span>

                      <button
                        type="button"
                        className={styles.btnAction}
                        style={{ padding: '6px 12px', fontSize: '12px', backgroundColor: '#f1f5f9', color: '#1e293b' }}
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                      >
                        Next
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
