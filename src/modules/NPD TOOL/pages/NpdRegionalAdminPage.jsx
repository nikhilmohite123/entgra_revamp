import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Download, Search, AlertCircle, CheckCircle2 } from 'lucide-react';
import styles from '../styles/npdRegionalAdmin.module.css';
import NpdHeader from '../components/NpdHeader';
import { npdToast } from '../components/NpdToast';
import { BASE_URL } from '../constants/npdConstants';

export default function NpdRegionalAdminPage() {
  const navigate = useNavigate();

  // State management
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [canExport, setCanExport] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Region and FY from localStorage (matching legacy triggerFilter & loadInitialFilters)
  const selectedRegion = localStorage.getItem('selectedRegion') || 'ALL';
  const selectedFYYear = localStorage.getItem('selectedFYYear') || 'ALL';
  const baseUrl = BASE_URL;

  // 1. Check Excel download authorization (legacy check_exceldownload_autho)
  const checkExportAuthorization = useCallback(async (region) => {
    try {
      const u_id = localStorage.getItem('uid') || '';
      const isAdmin =
        localStorage.getItem('isAdmin') === '1' ||
        localStorage.getItem('is_admin') === '1' ||
        localStorage.getItem('isAdmin') === 'true';

      const regParam = region === 'ALL' ? '' : region;
      let response;
      try {
        response = await fetch(`${baseUrl}/npd/check_exceldownload_autho?s_region=${encodeURIComponent(regParam)}`);
      } catch {
        response = await fetch(`/bpmn/npd/check_exceldownload_autho?s_region=${encodeURIComponent(regParam)}`);
      }

      if (response && response.ok) {
        const result = await response.json();
        const authorized = result.data?.some((item) => item.s_emp_id === u_id);
        setCanExport(Boolean(authorized || isAdmin));
      } else {
        setCanExport(isAdmin);
      }
    } catch (err) {
      console.error('Error checking excel download authorization:', err);
      // Fallback check if user is admin
      const isAdmin =
        localStorage.getItem('isAdmin') === '1' ||
        localStorage.getItem('is_admin') === '1';
      setCanExport(isAdmin);
    }
  }, []);

  // 2. Fetch NPD Data (legacy get_npd_data)
  const fetchNpdData = useCallback(async (region = 'ALL', fyRange = 'ALL') => {
    setLoading(true);
    try {
      const payload = { region, fyRange };
      let response;
      try {
        response = await fetch(`${baseUrl}/npd/get_npd_data`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } catch {
        response = await fetch(`/bpmn/npd/get_npd_data`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      if (response && response.ok) {
        const result = await response.json();
        const rawList = Array.isArray(result.data) ? result.data : [];

        // Deduplicate rows by n_npdtracking_id matching legacy script
        const uniqueData = [];
        const seenIds = new Set();
        const initialCriticalIds = [];

        rawList.forEach((item) => {
          if (!seenIds.has(item.n_npdtracking_id)) {
            seenIds.add(item.n_npdtracking_id);
            uniqueData.push(item);

            // Pre-select if marked as critical (is_critical === '1' in legacy)
            if (item.is_critical === '1' || item.is_critical === 1) {
              initialCriticalIds.push(item.n_npdtracking_id);
            }
          }
        });

        setProjects(uniqueData);
        setSelectedIds(initialCriticalIds);
      } else {
        setProjects([]);
      }
    } catch (err) {
      console.error('Error fetching NPD data:', err);
      npdToast.error('Something went wrong while fetching data!');
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // On mount and when region/fiscal year changes
  useEffect(() => {
    fetchNpdData(selectedRegion, selectedFYYear);
    checkExportAuthorization(selectedRegion);
  }, [selectedRegion, selectedFYYear, fetchNpdData, checkExportAuthorization]);

  // 3. Handle checkbox toggling (legacy validateCheckboxSelection)
  const handleCheckboxChange = (id) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  // 4. Add as Critical submission (legacy add_to_main)
  const handleAddAsCritical = async () => {
    if (selectedIds.length === 0) {
      npdToast.warning('Please select at least 1 project.');
      return;
    }

    setIsSaving(true);
    try {
      let response;
      // Try array payload first as in legacy JSON.stringify(ids)
      try {
        response = await fetch(`${baseUrl}/npd/upadte_creatical_project`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(selectedIds),
        });
      } catch {
        response = await fetch(`/bpmn/npd/upadte_creatical_project`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(selectedIds),
        });
      }

      // If array payload is rejected, try { ids: selectedIds }
      if (!response || !response.ok) {
        response = await fetch(`${baseUrl}/npd/upadte_creatical_project`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ids: selectedIds }),
        });
      }

      if (response && response.ok) {
        npdToast.success('Selection saved successfully!');
        // Refresh data
        fetchNpdData(selectedRegion, selectedFYYear);
      } else {
        npdToast.error('Error saving selection. Please try again.');
      }
    } catch (err) {
      console.error('Error updating critical project status:', err);
      npdToast.error('Error saving selection. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // 5. Export table to Excel (legacy exportTbl & tablesToExcel)
  const handleExportTable = () => {
    const filename = `export_${new Date().toLocaleDateString().replace(/\//g, '-')}.xls`;
    const headers = [
      'Project no',
      'Region',
      'Project Name',
      'Component',
      'Weight',
      'Business Background',
      'Pot. Vol. (Mn Tubes/Yr)',
      'Status',
      'Tool Inv. Detail',
      'Technical Contact',
      'Expected Completion',
      'Capex Approved Amount (USD\'000)',
      'Updated Date',
    ];

    let tableHtml = '<table border="1"><thead><tr>';
    headers.forEach((h) => {
      tableHtml += `<th style="background-color: #2b6cb0; color: #ffffff; font-weight: 600; padding: 10px; text-align: center;">${h}</th>`;
    });
    tableHtml += '</tr></thead><tbody>';

    filteredProjects.forEach((row) => {
      const cleanBack = (row.s_business_back || '')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
      const capex = row.s_capex_app_amount ? parseFloat(row.s_capex_app_amount).toFixed(2) : '';
      const updateDate = row.d_updated_date ? row.d_updated_date.split('T')[0] : '';

      tableHtml += '<tr>';
      tableHtml += `<td style="text-align: center;">${row.s_project_no || ''}</td>`;
      tableHtml += `<td>${row.s_region || ''}</td>`;
      tableHtml += `<td>${row.s_project_name || ''}</td>`;
      tableHtml += `<td>${row.s_component || ''}</td>`;
      tableHtml += `<td>${row.s_weight || ''}</td>`;
      tableHtml += `<td>${cleanBack}</td>`;
      tableHtml += `<td style="text-align: right;">${row.s_value || ''}</td>`;
      tableHtml += `<td style="text-align: center;">${row.s_status || ''}</td>`;
      tableHtml += `<td>${row.s_tool_inv_detail || ''}</td>`;
      tableHtml += `<td>${row.s_owner || ''}</td>`;
      tableHtml += `<td style="text-align: center;">${row.s_expected_com || ''}</td>`;
      tableHtml += `<td style="text-align: right;">${capex}</td>`;
      tableHtml += `<td style="text-align: center;">${updateDate}</td>`;
      tableHtml += '</tr>';
    });
    tableHtml += '</tbody></table>';

    const excelTemplate = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
        <head>
          <!--[if gte mso 9]>
          <xml>
            <x:ExcelWorkbook>
              <x:ExcelWorksheets>
                <x:ExcelWorksheet>
                  <x:Name>Sheet1</x:Name>
                  <x:WorksheetOptions>
                    <x:DisplayGridlines/>
                  </x:WorksheetOptions>
                </x:ExcelWorksheet>
              </x:ExcelWorksheets>
            </x:ExcelWorkbook>
          </xml>
          <![endif]-->
          <meta http-equiv="content-type" content="text/plain; charset=UTF-8"/>
        </head>
        <body>
          ${tableHtml}
        </body>
      </html>
    `;

    const blob = new Blob([excelTemplate], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 6. Navigation to single project view (legacy get_data_to_display)
  const handleProjectClick = (id) => {
    navigate(`/npd_tool/npdsinglepageprojectview?id=${id}&region=${selectedRegion}&fyrange=${selectedFYYear}`);
  };

  // 7. Status link color mapping matching legacy
  const getProjectLinkClass = (aliveStatus) => {
    if (aliveStatus === 'ALIVE') return styles.projectLinkBlue;
    if (aliveStatus === 'CANCELLED') return styles.projectLinkRed;
    if (aliveStatus === 'COMMERCIAL') return styles.projectLinkGreen;
    return styles.projectLinkBlue;
  };

  // 8. Render Image / File Download (legacy render block)
  const renderMediaCell = (row) => {
    const filePaths = row.s_npd_new_file_name ? row.s_npd_new_file_name.split(',') : [];
    const fileNames = row.s_npd_og_file_name ? row.s_npd_og_file_name.split(',') : [];
    const filePathBase = row.s_path ? `${row.s_path}/` : '';
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'];

    if (filePaths.length === 0) {
      return <span style={{ color: '#94a3b8', fontSize: '12px' }}>-</span>;
    }

    return (
      <div className={styles.imageCell}>
        {filePaths.map((file, index) => {
          const fileName = fileNames[index] || file;
          const cleanFile = file.trim();
          const ext = cleanFile.split('.').pop().toLowerCase();
          const fullPath = cleanFile.startsWith('http')
            ? cleanFile
            : `${baseUrl}${filePathBase}${cleanFile}`;

          if (imageExtensions.includes(ext)) {
            return (
              <img
                key={index}
                src={fullPath}
                alt={fileName}
                className={styles.previewThumb}
                title="Click to zoom preview"
                onClick={() => setSelectedImage(fullPath)}
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            );
          } else {
            return (
              <a
                key={index}
                href={fullPath}
                download={fileName}
                target="_blank"
                rel="noreferrer"
                className={styles.fileDownloadLink}
                title={`Download ${fileName}`}
              >
                <span>{fileName}</span>
                <i className="fa fa-download"></i>
              </a>
            );
          }
        })}
      </div>
    );
  };

  // 9. Client-side Search filter (legacy customSearchBox)
  const filteredProjects = useMemo(() => {
    if (!searchTerm) return projects;
    const term = searchTerm.toLowerCase().trim();

    return projects.filter((item) => {
      const pNo = (item.s_project_no || '').toLowerCase();
      const pName = (item.s_project_name || '').toLowerCase();
      const pReg = (item.s_region || '').toLowerCase();
      const pComp = (item.s_component || '').toLowerCase();
      const pStat = (item.s_status || '').toLowerCase();
      const pOwner = (item.s_owner || '').toLowerCase();
      const pBack = (item.s_business_back || '').toLowerCase();

      return (
        pNo.includes(term) ||
        pName.includes(term) ||
        pReg.includes(term) ||
        pComp.includes(term) ||
        pStat.includes(term) ||
        pOwner.includes(term) ||
        pBack.includes(term)
      );
    });
  }, [projects, searchTerm]);

  return (
    <div className={styles.pageContainer}>
      {/* Reusable Main NPD Navigation Header */}
      <NpdHeader />

      {/* Subheader with Page Title */}
      <div className={styles.subHeaderBar}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <h3 className={styles.pageHeading}>
            <ShieldCheck size={22} color="#007bff" />
            NPD TRACKING TOOL Setting
          </h3>
          <span className={styles.badgeRegional}>Regional Admin</span>
        </div>
        <div className={styles.selectedBadge}>
          {selectedIds.length} Critical Project{selectedIds.length === 1 ? '' : 's'} Selected
        </div>
      </div>

      {/* Main Container */}
      <div className={styles.mainContainer} id="mainContainer">
        {/* Search & Actions Toolbar */}
        <div className={styles.searchHeadDiv} id="search_head_div">
          <div className={styles.buttonGroup}>
            {/* Add as Critical Button (legacy add_to_main) */}
            <button
              type="button"
              className={styles.btnAddCritical}
              onClick={handleAddAsCritical}
              disabled={isSaving}
              id="add_critical_btn"
            >
              <CheckCircle2 size={16} />
              {isSaving ? 'Saving...' : 'Add as Critical'}
            </button>

            {/* Export Table Button (legacy exportTbl) */}
            {canExport && (
              <button
                type="button"
                className={styles.btnExport}
                onClick={handleExportTable}
                id="export_button"
              >
                <Download size={16} />
                Export table
              </button>
            )}
          </div>

          {/* Search Box (legacy customSearchBox) */}
          <div className={styles.searchWrap}>
            <Search size={16} className={styles.searchIcon} />
            <input
              type="text"
              id="customSearchBox"
              className={styles.customSearchBox}
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Table Container */}
        <div className={styles.tableContainer} id="form_data">
          {loading ? (
            <div className={styles.loadingBox}>
              <i className="fa fa-spinner fa-spin fa-2x mb-2" style={{ color: '#2b6cb0' }}></i>
              <span>Loading NPD Setting Data...</span>
            </div>
          ) : (
            <table className={styles.tblNpd} id="tbl_npd">
              <thead>
                <tr>
                  <th>Project no</th>
                  <th>Region</th>
                  <th>Project Name</th>
                  <th>Component</th>
                  <th>Weighat</th>
                  <th>Business Background</th>
                  <th>Pot. Vol. (Mn Tubes/Yr)</th>
                  <th>Status</th>
                  <th>Tool Inv. Detail</th>
                  <th>Technical Contact</th>
                  <th>Expected Completion</th>
                  <th>Capex Approved Amount (USD'000)</th>
                  <th>Image</th>
                  <th>Updated Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredProjects.length === 0 ? (
                  <tr>
                    <td colSpan="14" className={styles.emptyState}>
                      <AlertCircle size={20} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />
                      No NPD projects found.
                    </td>
                  </tr>
                ) : (
                  filteredProjects.map((row) => {
                    const isChecked = selectedIds.includes(row.n_npdtracking_id);
                    const linkColorClass = getProjectLinkClass(row.s_project_alive_status);
                    const capexAmt = row.s_capex_app_amount
                      ? parseFloat(row.s_capex_app_amount).toFixed(2)
                      : '-';
                    const dateFormatted = row.d_updated_date
                      ? row.d_updated_date.split('T')[0]
                      : '-';

                    return (
                      <tr key={row.n_npdtracking_id}>
                        {/* Project no & Checkbox */}
                        <td>
                          <div className={styles.projectCell}>
                            <span
                              className={`${styles.projectLink} ${linkColorClass}`}
                              onClick={() => handleProjectClick(row.n_npdtracking_id)}
                              title="View project specification"
                            >
                              {row.s_project_no || 'N/A'}
                            </span>
                            <input
                              type="checkbox"
                              className={styles.criticalCheckbox}
                              checked={isChecked}
                              onChange={() => handleCheckboxChange(row.n_npdtracking_id)}
                              data-id={row.n_npdtracking_id}
                              title="Select as Critical Project"
                            />
                          </div>
                        </td>

                        <td style={{ textAlign: 'center' }}>{row.s_region || '-'}</td>
                        <td>{row.s_project_name || '-'}</td>
                        <td style={{ textAlign: 'center' }}>{row.s_component || '-'}</td>
                        <td style={{ textAlign: 'center' }}>{row.s_weight || '-'}</td>
                        <td>
                          <div className={styles.businessBackCell}>
                            {row.s_business_back || '-'}
                          </div>
                        </td>
                        <td style={{ textAlign: 'right' }}>{row.s_value || '-'}</td>
                        <td style={{ textAlign: 'center' }}>{row.s_status || '-'}</td>
                        <td>{row.s_tool_inv_detail || '-'}</td>
                        <td>{row.s_owner || '-'}</td>
                        <td style={{ textAlign: 'center' }}>{row.s_expected_com || '-'}</td>
                        <td style={{ textAlign: 'right' }}>{capexAmt}</td>
                        <td style={{ textAlign: 'center' }}>{renderMediaCell(row)}</td>
                        <td style={{ textAlign: 'center' }}>{dateFormatted}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Full Image Zoom Modal Overlay (legacy openImage) */}
      {selectedImage && (
        <div
          className={styles.imageOverlay}
          onClick={() => setSelectedImage(null)}
          title="Click anywhere to close preview"
        >
          <img
            src={selectedImage}
            alt="Enlarged preview"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
