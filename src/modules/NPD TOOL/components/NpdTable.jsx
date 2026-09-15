import React, { useState } from 'react';
import styles from '../styles/npdTrack.module.css';

export default function NpdTable({
  projects,
  userCountry,
  isAdmin,
  canExport,
  selectedRegion,
  setSelectedRegion,
  selectedFY,
  setSelectedFY,
  onEditProject,
  onImageClick,
  forIdeaHub
}) {
  const [searchTerm, setSearchTerm] = useState('');

  // Filter projects by search term
  const filteredProjects = projects.filter((row) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      (row.s_project_no && row.s_project_no.toLowerCase().includes(term)) ||
      (row.s_project_name && row.s_project_name.toLowerCase().includes(term)) ||
      (row.s_region && row.s_region.toLowerCase().includes(term)) ||
      (row.s_component && row.s_component.toLowerCase().includes(term)) ||
      (row.s_owner && row.s_owner.toLowerCase().includes(term)) ||
      (row.s_status && row.s_status.toLowerCase().includes(term))
    );
  });

  // Export table to Excel format
  const exportToExcel = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'Project No,Region,Project Name,Component,Weight,Business Background,Pot Vol (Mn Tubes/Yr),Status,Tool Inv Detail,Technical Contact,Expected Completion,Capex Approved Amount\n';

    filteredProjects.forEach((row) => {
      const line = [
        `"${row.s_project_no || ''}"`,
        `"${row.s_region || ''}"`,
        `"${row.s_project_name || ''}"`,
        `"${row.s_component || ''}"`,
        `"${row.s_weight || ''}"`,
        `"${(row.s_business_back || '').replace(/"/g, '""')}"`,
        `"${row.s_value || ''}"`,
        `"${row.s_status || ''}"`,
        `"${row.s_tool_inv_detail || ''}"`,
        `"${row.s_owner || ''}"`,
        `"${row.s_expected_com || ''}"`,
        `"${row.s_capex_app_amount || ''}"`,
      ].join(',');
      csvContent += line + '\n';
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `npd_export_${new Date().toLocaleDateString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusClass = (status) => {
    if (status === 'ALIVE') return styles.statusAlive;
    if (status === 'CANCELLED') return styles.statusCancelled;
    if (status === 'COMMERCIAL') return styles.statusCommercial;
    return styles.statusDefault;
  };

  return (
    <div>
      {/* Search and Filters Toolbar */}
      <div className={styles.searchHeadDiv} id="search_head_div">
        {/* Region Filter */}
        <div className={styles.filterGroup}>
          <label className={styles.inputGroupText}>
            <i className="bi bi-funnel"></i>
          </label>
          <select
            className={styles.selectInput}
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
          >
            <option value="ALL">ALL Regions</option>
            <option value="AMESA">AMESA</option>
            <option value="EAP">EAP</option>
            <option value="EU">EUROPE</option>
            <option value="AMERICAS">AMERICAS</option>
          </select>
        </div>

        {/* Fiscal Year Filter */}
        <div className={styles.filterGroup}>
          <label className={styles.inputGroupText}>
            <i className="bi bi-calendar3"></i>
          </label>
          <select
            className={styles.selectInput}
            value={selectedFY}
            onChange={(e) => setSelectedFY(e.target.value)}
          >
            <option value="ALL">ALL FYs</option>
            <option value="2425">2024-25</option>
            <option value="2526">2025-26</option>
            <option value="2627">2026-27</option>
          </select>
        </div>

        {/* Export Table Button */}
        {canExport && (
          <button type="button" className={styles.exportBtn} onClick={exportToExcel}>
            Export table
          </button>
        )}

        {/* Custom Search Box */}
        <input
          type="text"
          className={styles.customSearchBox}
          placeholder="Search projects..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Table Container */}
      <div className={styles.tableContainer} id="form_data">
        <table className={styles.tblNpd} id="tbl_npd">
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
                <td colSpan={14} className="text-center py-4 text-muted">
                  No projects found matching the criteria.
                </td>
              </tr>
            ) : (
              filteredProjects.map((row, index) => {
                const isDisabled = !isAdmin && row.s_country !== userCountry;
                const statusClass = getStatusClass(row.s_project_alive_status);

                const filePaths = row.s_npd_new_file_name ? row.s_npd_new_file_name.split(',') : [];
                const fileNames = row.s_npd_og_file_name ? row.s_npd_og_file_name.split(',') : [];
                const filePathBase = row.s_path ? `${row.s_path}/` : '';
                const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'];

                return (
                  <tr key={row.n_npdtracking_id || index}>
                    {/* Project No & Edit icon */}
                    <td className="text-center">
                      <a
                        className={statusClass}
                        href={`/npd_tool/npdsinglepageprojectview?id=${row.n_npdtracking_id}`}
                        onClick={(e) => {
                          e.preventDefault();
                          window.location.href = `/npd_tool/npdsinglepageprojectview?id=${row.n_npdtracking_id}&region=${selectedRegion}&fyrange=${selectedFY}`;
                        }}
                      >
                        {row.s_project_no || 'N/A'}
                      </a>
                      {!forIdeaHub && (
                        <div className="mt-1">
                          <i
                            className={`fa fa-edit ${isDisabled ? styles.editBtnDisabled : styles.editBtn}`}
                            title={isDisabled ? 'Editing restricted for this country' : 'Edit Project'}
                            onClick={() => {
                              if (!isDisabled) {
                                onEditProject(row.n_npdtracking_id);
                              }
                            }}
                          />
                        </div>
                      )}
                    </td>

                    <td className="text-center">{row.s_region || 'N/A'}</td>
                    <td>{row.s_project_name || 'N/A'}</td>
                    <td className="text-center">{row.s_component || 'N/A'}</td>
                    <td className="text-center">{row.s_weight || '-'}</td>
                    <td>{row.s_business_back || '-'}</td>
                    <td className="text-center">{row.s_value || '-'}</td>
                    <td className="text-center">{row.s_status || '-'}</td>
                    <td className="text-center">{row.s_tool_inv_detail || '-'}</td>
                    <td>{row.s_owner || '-'}</td>
                    <td className="text-center">{row.s_expected_com || '-'}</td>
                    <td className="text-end">
                      {row.s_capex_app_amount
                        ? Number(row.s_capex_app_amount).toFixed(2)
                        : '-'}
                    </td>

                    {/* Image / Attachment column */}
                    <td className="text-center">
                      {filePaths.length === 0 ? (
                        <span className="text-muted small">No file</span>
                      ) : (
                        filePaths.map((file, fIdx) => {
                          const fileName = fileNames[fIdx] || file;
                          const ext = file.split('.').pop().toLowerCase();
                          const fullPath = filePathBase + file;

                          if (imageExtensions.includes(ext)) {
                            return (
                              <img
                                key={fIdx}
                                src={fullPath}
                                alt={fileName}
                                className={styles.previewImage}
                                onClick={() => onImageClick(fullPath)}
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                }}
                              />
                            );
                          }
                          return (
                            <a
                              key={fIdx}
                              href={fullPath}
                              download={fileName}
                              className="d-block small text-decoration-none my-1"
                            >
                              {fileName} <i className="fa fa-download ms-1"></i>
                            </a>
                          );
                        })
                      )}
                    </td>

                    {/* Updated Date */}
                    <td className="text-center">
                      {row.d_updated_date ? row.d_updated_date.split('T')[0] : '-'}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
