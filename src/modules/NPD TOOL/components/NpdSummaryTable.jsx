import React from 'react';
import styles from '../styles/npdSummary.module.css';

export default function NpdSummaryTable({ summaryData, selectedCategory, onImageClick }) {
  // Export table data to CSV/Excel
  const exportToExcel = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'Project No,Region,Component,Weight,Business Background,Pot Vol (Mn Tubes/Yr),Status,Tool Inv Detail,Technical Contact,Expected Completion,Capex Approved Amount\n';

    summaryData.forEach((row) => {
      const line = [
        `"${row.s_project_no || ''}"`,
        `"${row.s_region || ''}"`,
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
    link.setAttribute('download', `export_${selectedCategory}_${new Date().toLocaleDateString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      {/* Toolbar row with Export Button */}
      <div className={styles.toolbarRow}>
        <span className="fw-bold text-secondary">
          Showing Component Summary: <span className="text-primary">{selectedCategory}</span> ({summaryData.length} records)
        </span>
        <button type="button" className={styles.exportBtn} onClick={exportToExcel}>
          Export Table
        </button>
      </div>

      {/* Summary Table Container */}
      <div className={styles.tableContainer} id="form_data">
        <table className={styles.tblNpdComp} id="tbl_npd_comp">
          <thead>
            <tr>
              <th>Project no</th>
              <th>Region</th>
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
            {summaryData.length === 0 ? (
              <tr>
                <td colSpan={13} className="text-center py-4 text-muted">
                  No summary records available for this component category.
                </td>
              </tr>
            ) : (
              summaryData.map((row, index) => {
                const filePaths = row.s_npd_new_file_name ? row.s_npd_new_file_name.split(',') : [];
                const fileNames = row.s_npd_og_file_name ? row.s_npd_og_file_name.split(',') : [];
                const filePathBase = row.s_path ? `${row.s_path}/` : '';
                const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'];

                return (
                  <tr key={row.n_npdtracking_id || index}>
                    {/* Project No link */}
                    <td className="text-center">
                      <a
                        href={`/npdsinglepageprojectview?id=${row.n_npdtracking_id}`}
                        className="fw-bold text-primary text-decoration-none"
                        onClick={(e) => {
                          e.preventDefault();
                          window.location.href = `/npdsinglepageprojectview?id=${row.n_npdtracking_id}`;
                        }}
                      >
                        {row.s_project_no || 'N/A'}
                      </a>
                    </td>

                    <td className="text-center">{row.s_region || 'N/A'}</td>
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

                    {/* Image / Attachment preview */}
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
