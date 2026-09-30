import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Share2, Edit2, Trash2, Eye, GitCommit } from 'lucide-react';
import tableStyles from '../styles/WccTables.module.css';
import dashboardStyles from '../styles/WccDashboard.module.css';
import { formatAmount, formatName } from '../constants/wccConstants';
import { useWcc } from '../context/useWcc';

export default function WccForwardedTable({ onOpenTrail }) {
  const navigate = useNavigate();
  const { forwardedRequests, deleteRequest } = useWcc();

  if (!forwardedRequests || forwardedRequests.length === 0) {
    return null; // Hidden if no forwarded requests
  }

  return (
    <div className={dashboardStyles.sectionCard} style={{ marginTop: '1.5rem' }}>
      <div className={dashboardStyles.sectionHeader}>
        <h3 className={dashboardStyles.sectionTitle} style={{ color: '#0284c7' }}>
          <Share2 size={18} /> Requests Forwarded to You
        </h3>
      </div>

      <div className={tableStyles.tableResponsive}>
        <table className={tableStyles.table}>
          <thead>
            <tr>
              <th style={{ width: '60px', textAlign: 'center' }}>Trail</th>
              <th>WCC Number</th>
              <th>Plant / Unit</th>
              <th>Identification for Asset / Requestor</th>
              <th>Status</th>
              <th>Amount (₹)</th>
              <th style={{ width: '100px', textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {forwardedRequests.map((row) => {
              const isActionable = String(row.s_activity) === '16';

              return (
                <tr key={row.n_id}>
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

                  <td style={{ fontWeight: 700, color: '#062b67' }}>#{row.n_id}</td>
                  <td>{row.s_unit || row.s_location || '—'}</td>
                  <td>{row.s_asset || '—'}</td>

                  <td>
                    <span className={`${tableStyles.badge} ${tableStyles.badgeInProcess}`}>
                      In Process &bull; {formatName(row.s_approver)}
                    </span>
                  </td>

                  <td style={{ fontWeight: 700 }}>₹{formatAmount(row.totalAmountSum)}</td>

                  <td>
                    <div className={tableStyles.actionsCell} style={{ justifyContent: 'center' }}>
                      {isActionable ? (
                        <>
                          <button
                            type="button"
                            onClick={() => navigate(`/wcc/edit/${row.n_id}`)}
                            className={`${tableStyles.btnAction} ${tableStyles.edit}`}
                            title="Edit Forwarded Request"
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
                          title="View Forwarded Request"
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
    </div>
  );
}
