import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/npdSetting.module.css';
import NpdHeader from '../components/NpdHeader';
import { npdToast } from '../components/NpdToast';
import { BASE_URL } from '../constants/npdConstants';

export default function NpdSettingPage() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [canExport, setCanExport] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);

  const selectedRegion = localStorage.getItem('selectedRegion') || 'ALL';
  const selectedFYYear = localStorage.getItem('selectedFYYear') || 'ALL';
  const baseUrl = BASE_URL;

  // 1. Initial Load: fetch projects and check export authorization
  useEffect(() => {
    fetchNpdData(selectedRegion, selectedFYYear);
    checkExportAuthorization(selectedRegion);
  }, [selectedRegion, selectedFYYear]);

  // Check Excel export authorization
  const checkExportAuthorization = async (region) => {
    try {
      const uid = localStorage.getItem('uid');
      const isAdmin =
        localStorage.getItem('isAdmin') === '1' ||
        localStorage.getItem('is_admin') === '1' ||
        localStorage.getItem('isAdmin') === 'true';

      const regParam = region === 'ALL' ? '' : region;
      const response = await fetch(`${baseUrl}/npd/check_exceldownload_autho?s_region=${regParam}`);
      if (response.ok) {
        const result = await response.json();
        const authorized = result.data?.some((item) => item.s_emp_id === uid);
        if (authorized || isAdmin) {
          setCanExport(true);
        } else {
          setCanExport(false);
        }
      }
    } catch (err) {
      console.error('Error checking excel authorization:', err);
    }
  };

  // Fetch NPD data
  const fetchNpdData = async (region = 'ALL', fyRange = 'ALL') => {
    setLoading(true);
    try {
      const response = await fetch(`${baseUrl}/npd/get_npd_data`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ region, fyRange }),
      });

      if (response.ok) {
        const result = await response.json();
        const rawData = result.data || [];

        // Deduplicate records by n_npdtracking_id
        const uniqueData = [];
        const seenIds = new Set();
        const initialSelected = [];

        rawData.forEach((item) => {
          if (!seenIds.has(item.n_npdtracking_id)) {
            seenIds.add(item.n_npdtracking_id);
            uniqueData.push(item);

            // Check if selected for landing page
            if (
              item.is_selected === '1' ||
              item.is_selected === 1

            ) {
              initialSelected.push(item.n_npdtracking_id);
            }
          }
        });

        setProjects(uniqueData);
        setSelectedIds(initialSelected);
      }
    } catch (err) {
      console.error('Error fetching NPD setting data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Toggle checkbox selection for landing page
  const handleCheckboxChange = (id) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  // Add to landing page (corresponds to legacy add_to_main)
  const handleAddToMain = async () => {
    if (selectedIds.length === 0) {
      npdToast.warning('Please select at least 1 project.');
      return;
    }

    try {
      let response;
      try {
        response = await fetch(`${baseUrl}/npd/updateCheckboxStatus`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(selectedIds),
        });
      } catch {
        // Fallback endpoint
        response = await fetch(`${baseUrl}/npd/upadte_creatical_project`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(selectedIds),
        });
      }

      if (response && response.ok) {
        npdToast.success('Selection saved successfully!');
      } else {
        npdToast.error('Error saving selection. Please try again.');
      }
    } catch (err) {
      console.error('Error updating landing page projects:', err);
      npdToast.error('Error saving selection. Please try again.');
    }
  };

  // Export table to Excel (corresponds to legacy exportTbl)
  const exportTable = () => {
    const filename = `export_${new Date().toLocaleDateString().replace(/\//g, '-')}.xls`;
    const headers = [
      'Project No',
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
      tableHtml += `<th style="background-color: #2b6cb0; color: #ffffff; font-weight: bold;">${h}</th>`;
    });
    tableHtml += '</tr></thead><tbody>';

    filteredProjects.forEach((row) => {
      tableHtml += '<tr>';
      tableHtml += `<td>${row.s_project_no || ''}</td>`;
      tableHtml += `<td>${row.s_region || ''}</td>`;
      tableHtml += `<td>${row.s_project_name || ''}</td>`;
      tableHtml += `<td>${row.s_component || ''}</td>`;
      tableHtml += `<td>${row.s_weight || ''}</td>`;
      tableHtml += `<td>${(row.s_business_back || '').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</td>`;
      tableHtml += `<td>${row.s_value || ''}</td>`;
      tableHtml += `<td>${row.s_status || ''}</td>`;
      tableHtml += `<td>${row.s_tool_inv_detail || ''}</td>`;
      tableHtml += `<td>${row.s_owner || ''}</td>`;
      tableHtml += `<td>${row.s_expected_com || ''}</td>`;
      tableHtml += `<td>${row.s_capex_app_amount ? parseFloat(row.s_capex_app_amount).toFixed(2) : ''}</td>`;
      tableHtml += `<td>${row.d_updated_date ? row.d_updated_date.split('T')[0] : ''}</td>`;
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

  // Status color logic matching legacy code
  const getProjectColor = (aliveStatus) => {
    if (aliveStatus === 'ALIVE') return 'blue';
    if (aliveStatus === 'CANCELLED') return 'red';
    if (aliveStatus === 'COMMERCIAL') return 'green';
    return 'blue';
  };

  // Project navigation to single project view
  const handleProjectClick = (id) => {
    navigate(`/npd_tool/npdsinglepageprojectview?id=${id}&region=${selectedRegion}&fyrange=${selectedFYYear}`);
  };

  // Render media thumbnail / download links
  const renderMediaCell = (row) => {
    const filePaths = row.s_npd_new_file_name ? row.s_npd_new_file_name.split(',') : [];
    const fileNames = row.s_npd_og_file_name ? row.s_npd_og_file_name.split(',') : [];
    const filePathBase = row.s_path ? `${row.s_path}/` : '';
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'];

    if (filePaths.length === 0) return '-';

    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
        {filePaths.map((file, index) => {
          const fileName = fileNames[index] || file;
          const fileExtension = file.split('.').pop().toLowerCase();
          const cleanFile = file.trim();
          const fullPath = cleanFile.startsWith('http')
            ? cleanFile
            : `${baseUrl}${filePathBase}${cleanFile}`;

          if (imageExtensions.includes(fileExtension)) {
            return (
              <img
                key={index}
                src={fullPath}
                alt={fileName}
                className={styles.previewThumb}
                style={{
                  width: '60px',
                  height: '60px',
                  objectFit: 'cover',
                  cursor: 'pointer',
                  borderRadius: '4px',
                  border: '1px solid #ddd',
                }}
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
                style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', color: '#0056b3' }}
              >
                <span>{fileName}</span>
                <i className="bi bi-download"></i>
              </a>
            );
          }
        })}
      </div>
    );
  };

  // Client-side search across multiple fields
  const filteredProjects = projects.filter((item) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      (item.s_project_no && item.s_project_no.toLowerCase().includes(term)) ||
      (item.s_project_name && item.s_project_name.toLowerCase().includes(term)) ||
      (item.s_region && item.s_region.toLowerCase().includes(term)) ||
      (item.s_component && item.s_component.toLowerCase().includes(term)) ||
      (item.s_status && item.s_status.toLowerCase().includes(term)) ||
      (item.s_owner && item.s_owner.toLowerCase().includes(term)) ||
      (item.s_business_back && item.s_business_back.toLowerCase().includes(term))
    );
  });

  return (
    <div className={styles.settingContainer}>
      {/* NPD Common Header */}
      <NpdHeader />

      {/* Main Content Area */}
      <div className={styles.contentWrapper}>
        {/* Action Top Bar (Search Box, Add to Landing Page, Export Table) */}
        <div className={styles.topBar}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <button
              type="button"
              className={styles.actionBtn}
              onClick={handleAddToMain}
              style={{
                backgroundColor: '#2b6cb0',
                color: '#fff',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '6px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Add to landing page
            </button>

            {canExport && (
              <button
                type="button"
                className={styles.exportBtn}
                onClick={exportTable}
                style={{
                  backgroundColor: '#28a745',
                  color: '#fff',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Export table
              </button>
            )}
          </div>

          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              borderRadius: '21px',
              padding: '8px 16px',
              fontSize: '0.95rem',
              maxWidth: '300px',
              width: '100%',
              border: '2px solid rgba(58, 148, 204, 0.842)',
              outline: 'none',
              background: 'white',
            }}
          />
        </div>

        {/* NPD Table */}
        <div className={styles.tableContainer}>
          {loading ? (
            <div className={styles.spinner} style={{ padding: '40px', textAlign: 'center', color: '#1e9aff' }}>
              <i className="fa fa-spinner fa-spin me-2" style={{ fontSize: '24px' }}></i> Loading NPD Data...
            </div>
          ) : (
            <table className={styles.npdTable} id="tbl_npd">
              <thead>
                <tr>
                  <th>Project no</th>
                  <th>Region</th>
                  <th>Project Name</th>
                  <th>Component</th>
                  <th>Weight</th>
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
                    <td colSpan="14" style={{ textAlign: 'center', padding: '30px', color: '#6c757d' }}>
                      No NPD projects found.
                    </td>
                  </tr>
                ) : (
                  filteredProjects.map((row) => {
                    const isChecked = selectedIds.includes(row.n_npdtracking_id);
                    const color = getProjectColor(row.s_project_alive_status);

                    return (
                      <tr key={row.n_npdtracking_id}>
                        <td style={{ textAlign: 'center' }}>
                          <div>
                            <span
                              className={styles.projectLink}
                              style={{ color, cursor: 'pointer', fontWeight: 600, textDecoration: 'underline' }}
                              onClick={() => handleProjectClick(row.n_npdtracking_id)}
                            >
                              {row.s_project_no || 'N/A'}
                            </span>
                          </div>
                          <div style={{ marginTop: '8px' }}>
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleCheckboxChange(row.n_npdtracking_id)}
                              style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                              data-id={row.n_npdtracking_id}
                            />
                          </div>
                        </td>
                        <td>{row.s_region || '-'}</td>
                        <td>{row.s_project_name || '-'}</td>
                        <td>{row.s_component || '-'}</td>
                        <td>{row.s_weight || '-'}</td>
                        <td style={{ maxWidth: '280px', whiteSpace: 'normal', wordBreak: 'break-word' }}>
                          {row.s_business_back || '-'}
                        </td>
                        <td style={{ textAlign: 'right' }}>{row.s_value || '-'}</td>
                        <td style={{ textAlign: 'center' }}>{row.s_status || '-'}</td>
                        <td>{row.s_tool_inv_detail || '-'}</td>
                        <td>{row.s_owner || '-'}</td>
                        <td style={{ textAlign: 'center' }}>{row.s_expected_com || '-'}</td>
                        <td style={{ textAlign: 'right' }}>
                          {row.s_capex_app_amount ? parseFloat(row.s_capex_app_amount).toFixed(2) : '-'}
                        </td>
                        <td style={{ textAlign: 'center' }}>{renderMediaCell(row)}</td>
                        <td style={{ textAlign: 'center' }}>
                          {row.d_updated_date ? row.d_updated_date.split('T')[0] : '-'}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Image Overlay Modal */}
      {selectedImage && (
        <div
          className={styles.imageOverlay}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1050,
            cursor: 'zoom-out',
          }}
          onClick={() => setSelectedImage(null)}
        >
          <img
            src={selectedImage}
            alt="Zoomed view"
            style={{
              maxWidth: '85%',
              maxHeight: '85%',
              borderRadius: '8px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
            }}
          />
        </div>
      )}
    </div>
  );
}
