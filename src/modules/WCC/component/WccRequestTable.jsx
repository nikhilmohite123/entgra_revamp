import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Eye,
  Edit2,
  Trash2,
  Search,
  ChevronLeft,
  ChevronRight,
  GitCommit,
} from 'lucide-react';
import tableStyles from '../styles/WccTables.module.css';
import dashboardStyles from '../styles/WccDashboard.module.css';
import { formatAmount, formatName } from '../constants/wccConstants';
import { useWcc } from '../context/useWcc';

export default function WccRequestTable({ onOpenTrail }) {
  const navigate = useNavigate();
  const { requests, loading, deleteRequest, uid, loginId } = useWcc();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter requests by search term
  const filteredRequests = useMemo(() => {
    if (!searchTerm.trim()) return requests;
    const q = searchTerm.toLowerCase();

    return requests.filter((r) => {
      const id = String(r.n_id || '').toLowerCase();
      const loc = String(r.s_location || '').toLowerCase();
      const asset = String(r.s_asset || '').toLowerCase();
      const approver = String(r.s_approver || '').toLowerCase();
      return (
        id.includes(q) ||
        loc.includes(q) ||
        asset.includes(q) ||
        approver.includes(q)
      );
    });
  }, [requests, searchTerm]);

  // Pagination
  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage) || 1;
  const paginatedRequests = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredRequests.slice(start, start + itemsPerPage);
  }, [filteredRequests, currentPage, itemsPerPage]);

  const renderStatus = (row) => {
    const level = Number(row.n_level);
    let completedDate = '';
    if (row.d_date_capitalisation) {
      completedDate = row.d_date_capitalisation.split('T')[0];
    }

    if (level <= 4) {
      return (
        <span className={`${tableStyles.badge} ${tableStyles.badgeInProcess}`}>
          In Process &bull; {formatName(row.s_approver)}
        </span>
      );
    } else if (level === 5) {
      return (
        <span className={`${tableStyles.badge} ${tableStyles.badgeCompleted}`}>
          Completed {completedDate ? `&bull; ${completedDate}` : ''}
        </span>
      );
    }
    return <span className={tableStyles.badge}>—</span>;
  };

  return (
    <div className={dashboardStyles.sectionCard}>
      {/* Table Header / Search */}
      <div className={dashboardStyles.sectionHeader}>
        <h3 className={dashboardStyles.sectionTitle}>
          <FileText size={18} color="#062b67" /> List of Work Completion Requests
        </h3>

        <div className={dashboardStyles.searchBox}>
          <Search size={16} color="#64748b" />
          <input
            type="text"
            className={dashboardStyles.searchInput}
            placeholder="Search by ID, Plant, Asset, Approver..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
      </div>

      {/* Table Body */}
      {loading ? (
        <div className={dashboardStyles.emptyState}>
          <span>Loading requests...</span>
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className={dashboardStyles.emptyState}>
          <span>No work completion requests found.</span>
        </div>
      ) : (
        <div className={tableStyles.tableResponsive}>
          <table className={tableStyles.table}>
            <thead>
              <tr>
                <th style={{ width: '60px', textAlign: 'center' }}>Trail</th>
                <th>WCC Number</th>
                <th>Plant / Unit</th>
                <th>Asset Description</th>
                <th>Status</th>
                <th>Amount (₹)</th>
                <th style={{ width: '100px', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedRequests.map((row) => {
                const isCurrentApprover =
                  (row.s_approver === uid || row.s_approver === loginId) &&
                  String(row.s_activity) !== '16';

                return (
                  <tr key={row.n_id}>
                    {/* Trail */}
                    <td style={{ textAlign: 'center' }}>
                      <button
                        type="button"
                        className={`${tableStyles.btnAction} ${tableStyles.trail}`}
                        onClick={() => onOpenTrail(row.n_id)}
                        title="View Work Trail"
                      >
                        <GitCommit size={15} />
                      </button>
                    </td>

                    {/* WCC Number */}
                    <td style={{ fontWeight: 700, color: '#062b67' }}>#{row.n_id}</td>

                    {/* Plant */}
                    <td>{row.s_location || row.s_unit || '—'}</td>

                    {/* Asset Desc */}
                    <td>{row.s_asset || '—'}</td>

                    {/* Status */}
                    <td>{renderStatus(row)}</td>

                    {/* Amount */}
                    <td style={{ fontWeight: 700 }}>
                      ₹{formatAmount(row.totalAmountSum)}
                    </td>

                    {/* Actions */}
                    <td>
                      <div className={tableStyles.actionsCell} style={{ justifyContent: 'center' }}>
                        {isCurrentApprover ? (
                          <>
                            <button
                              type="button"
                              onClick={() => navigate(`/wcc/edit/${row.n_id}`)}
                              className={`${tableStyles.btnAction} ${tableStyles.edit}`}
                              title="Edit Request"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteRequest(row.n_id)}
                              className={`${tableStyles.btnAction} ${tableStyles.delete}`}
                              title="Delete Request"
                            >
                              <Trash2 size={14} />
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            onClick={() => navigate(`/wcc/view/${row.n_id}`)}
                            className={`${tableStyles.btnAction} ${tableStyles.view}`}
                            title="View Request"
                          >
                            <Eye size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Footer */}
      {!loading && filteredRequests.length > 0 && (
        <div className={tableStyles.tableFooter}>
          <span>
            Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
            {Math.min(currentPage * itemsPerPage, filteredRequests.length)} of{' '}
            {filteredRequests.length} entries
          </span>

          <div className={tableStyles.pagination}>
            <button
              className={tableStyles.pageBtn}
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft size={14} />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                className={`${tableStyles.pageBtn} ${
                  currentPage === page ? tableStyles.active : ''
                }`}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            ))}

            <button
              className={tableStyles.pageBtn}
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
