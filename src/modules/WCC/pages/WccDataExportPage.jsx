import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import {
  FileSpreadsheet,
  Download,
  ArrowLeft,
  Search,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import styles from '../styles/WccDataExport.module.css';
import { BASE_URL } from '../constants/wccConstants';
import WccToast from '../component/WccToast';
import WccHeader from '../component/WccHeader';

export default function WccDataExportPage() {
  const navigate = useNavigate();

  // Initial Filter Type from SessionStorage or Default
  const [activeType, setActiveType] = useState(() => {
    return sessionStorage.getItem('wccType') || 'total';
  });

  const [allData, setAllData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [pageLength, setPageLength] = useState(100);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [toast, setToast] = useState(null);

  // 1. Fetch Data from API
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    fetch(`${BASE_URL}/workcompletionRoute/getWCCData`)
      .then((res) => res.json())
      .then((response) => {
        if (!isMounted) return;

        let dataArray = [];
        if (Array.isArray(response)) {
          dataArray = response;
        } else if (response && Array.isArray(response.data)) {
          dataArray = response.data;
        }

        setAllData(dataArray);
      })
      .catch((err) => {
        console.error('WCC API Error:', err);
        if (isMounted) {
          setToast({
            message: 'Failed to load WCC data from server',
            type: 'error',
          });
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Update Session Storage on type change
  const handleTypeChange = (type) => {
    setActiveType(type);
    sessionStorage.setItem('wccType', type);
    setCurrentPage(1);
  };

  // 2. Formatters & Calculators matching legacy logic exactly
  const formatName = (name) => {
    if (!name) return '';
    return String(name)
      .split('.')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  const getStatusName = (row) => {
    const level = Number(row.n_level);
    if (level === 5) {
      const completedDate = row.d_updated_date
        ? String(row.d_updated_date).split('T')[0]
        : '';
      return completedDate ? `Completed - ${completedDate}` : 'Completed';
    }

    if (level <= 4) {
      const approverName = formatName(row.s_approver);
      return approverName ? `In Process - ${approverName}` : 'In Process';
    }

    return '';
  };

  const getTotalAmount = (row) => {
    if (!row.s_asset_details) return 0;

    try {
      let assetDetails = row.s_asset_details;

      if (typeof assetDetails === 'string') {
        try {
          assetDetails = JSON.parse(assetDetails);
        } catch {
          const cleanedJson = assetDetails
            .replace(/\r/g, '\\r')
            .replace(/\n/g, '\\n')
            .replace(/\t/g, '\\t')
            .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '');
          assetDetails = JSON.parse(cleanedJson);
        }
      }

      if (!Array.isArray(assetDetails)) return 0;

      return assetDetails.reduce((sum, item) => {
        if (!item) return sum;
        let amount = item.totalAmount;
        if (amount === null || amount === undefined || amount === '') return sum;

        if (typeof amount === 'string') {
          amount = amount.replace(/,/g, '').trim();
        }

        const num = parseFloat(amount) || 0;
        return sum + num;
      }, 0);
    } catch (err) {
      console.error('Unable to calculate amount for WCC:', row.n_id, err);
      return 0;
    }
  };

  const formatAmount = (amount) => {
    const value = Number(amount) || 0;
    return value.toLocaleString('en-IN');
  };

  // 3. Filter Data (Excludes drafts n_sts === 2)
  const filteredData = useMemo(() => {
    const validData = allData.filter((row) => Number(row.n_sts) !== 2);

    let result = validData;
    if (activeType === 'completed') {
      result = validData.filter((row) => Number(row.n_level) === 5);
    } else if (activeType === 'pending') {
      result = validData.filter((row) => Number(row.n_level) < 5);
    }

    // Search query filter
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter((row) => {
        const id = String(row.n_id || '').toLowerCase();
        const loc = String(row.s_location || '').toLowerCase();
        const asset = String(row.s_asset || '').toLowerCase();
        const req = String(row.s_requestor_name || '').toLowerCase();
        const status = String(getStatusName(row)).toLowerCase();
        const amt = String(getTotalAmount(row)).toLowerCase();

        return (
          id.includes(q) ||
          loc.includes(q) ||
          asset.includes(q) ||
          req.includes(q) ||
          status.includes(q) ||
          amt.includes(q)
        );
      });
    }

    // Sorting
    if (sortConfig.key) {
      result = [...result].sort((a, b) => {
        let valA, valB;
        if (sortConfig.key === 'amount') {
          valA = getTotalAmount(a);
          valB = getTotalAmount(b);
        } else if (sortConfig.key === 'status') {
          valA = getStatusName(a);
          valB = getStatusName(b);
        } else if (sortConfig.key === 'requestor') {
          valA = formatName(a.s_requestor_name);
          valB = formatName(b.s_requestor_name);
        } else {
          valA = a[sortConfig.key] || '';
          valB = b[sortConfig.key] || '';
        }

        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [allData, activeType, searchTerm, sortConfig]);

  // Pagination Slice
  const totalPages = Math.ceil(filteredData.length / pageLength) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageLength;
    return filteredData.slice(start, start + pageLength);
  }, [filteredData, currentPage, pageLength]);

  // Sort Handler
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return <ArrowUpDown size={12} style={{ opacity: 0.5, marginLeft: 4 }} />;
    return sortConfig.direction === 'asc' ? (
      <ArrowUp size={12} style={{ marginLeft: 4 }} />
    ) : (
      <ArrowDown size={12} style={{ marginLeft: 4 }} />
    );
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
  };

  // 4. Download Excel matching legacy format exactly
  const downloadExcel = () => {
    if (!filteredData || filteredData.length === 0) {
      showToast('No data available to download.', 'warning');
      return;
    }

    const excelData = filteredData.map((row) => ({
      wccNumber: row.n_id || '',
      plant: row.s_location || '',
      assetDescription: row.s_asset || '',
      requesterName: row.s_requestor_name || '',
      statusName: getStatusName(row),
      totalAmount: getTotalAmount(row),
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'WCC Data');

    let fileName = 'WCC_Total_Requests.xlsx';
    if (activeType === 'completed') {
      fileName = 'WCC_Completed_Requests.xlsx';
    } else if (activeType === 'pending') {
      fileName = 'WCC_Pending_Requests.xlsx';
    }

    XLSX.writeFile(workbook, fileName);
  };

  const getHeadingText = () => {
    if (activeType === 'completed') return '▦ Completed Requests';
    if (activeType === 'pending') return '▦ Pending Requests';
    return '▦ Total Requests';
  };

  return (
    <div>
      <WccHeader />
      <div className={styles.container}>
        <WccToast toast={toast} onClose={() => setToast(null)} />

      {/* Top Bar */}
      <div className={styles.topBar}>
        <h1>
          <FileSpreadsheet size={24} /> WCC Data Export
        </h1>
        <button
          type="button"
          className={styles.backBtn}
          onClick={() => navigate('/wcc/wcc_dash')}
        >
          <ArrowLeft size={16} /> Back to Dashboard
        </button>
      </div>

      {/* Content Card */}
      <div className={styles.contentCard}>
        {/* Card Header */}
        <div className={styles.cardHeaderRow}>
          <div className={styles.titleArea}>
            <div className={styles.title}>{getHeadingText()}</div>

            {/* Filter Tabs */}
            <div className={styles.filterTabs}>
              <button
                type="button"
                className={`${styles.tabBtn} ${activeType === 'total' ? styles.active : ''}`}
                onClick={() => handleTypeChange('total')}
              >
                Total
              </button>
              <button
                type="button"
                className={`${styles.tabBtn} ${activeType === 'completed' ? styles.active : ''}`}
                onClick={() => handleTypeChange('completed')}
              >
                Completed
              </button>
              <button
                type="button"
                className={`${styles.tabBtn} ${activeType === 'pending' ? styles.active : ''}`}
                onClick={() => handleTypeChange('pending')}
              >
                Pending
              </button>
            </div>
          </div>

          <button className={styles.btnDownload} onClick={downloadExcel}>
            <Download size={16} /> Download Excel
          </button>
        </div>

        {/* Toolbar: Page length + Search */}
        <div className={styles.tableToolbar}>
          <div className={styles.pageLengthLabel}>
            Show
            <select
              className={styles.pageLengthSelect}
              value={pageLength}
              onChange={(e) => {
                setPageLength(parseInt(e.target.value, 10));
                setCurrentPage(1);
              }}
            >
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
            entries
          </div>

          <div className={styles.searchBox}>
            <Search size={16} color="#64748b" />
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Search in table..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
        </div>

        {/* Data Table */}
        <div className={styles.tableWrapper}>
          <table className={styles.atrTable}>
            <thead>
              <tr>
                <th style={{ width: '10%' }} onClick={() => requestSort('n_id')}>
                  WCC Number {getSortIcon('n_id')}
                </th>
                <th style={{ width: '12%' }} onClick={() => requestSort('s_location')}>
                  Plant {getSortIcon('s_location')}
                </th>
                <th style={{ width: '34%' }} onClick={() => requestSort('s_asset')}>
                  Asset Description {getSortIcon('s_asset')}
                </th>
                <th style={{ width: '16%' }} onClick={() => requestSort('requestor')}>
                  Requester Name {getSortIcon('requestor')}
                </th>
                <th style={{ width: '16%' }} onClick={() => requestSort('status')}>
                  Status {getSortIcon('status')}
                </th>
                <th style={{ width: '12%' }} onClick={() => requestSort('amount')}>
                  Amount (₹) {getSortIcon('amount')}
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className={styles.emptyRow}>
                    Loading WCC data...
                  </td>
                </tr>
              ) : paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={6} className={styles.emptyRow}>
                    No records found
                  </td>
                </tr>
              ) : (
                paginatedData.map((row) => {
                  const status = getStatusName(row);
                  const isCompleted = Number(row.n_level) === 5;
                  const totalAmt = getTotalAmount(row);

                  return (
                    <tr key={row.n_id}>
                      <td style={{ fontWeight: 600, color: '#1a5f8a' }}>
                        #{row.n_id}
                      </td>
                      <td>{row.s_location || '—'}</td>
                      <td>{row.s_asset || '—'}</td>
                      <td>{formatName(row.s_requestor_name)}</td>
                      <td>
                        <span
                          className={
                            isCompleted
                              ? styles.badgeCompleted
                              : styles.badgeProcess
                          }
                        >
                          {status}
                        </span>
                      </td>
                      <td style={{ fontWeight: 700 }}>
                        {formatAmount(totalAmt)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer & Pagination */}
        {!loading && filteredData.length > 0 && (
          <div className={styles.tableFooter}>
            <div>
              Showing {(currentPage - 1) * pageLength + 1} to{' '}
              {Math.min(currentPage * pageLength, filteredData.length)} of{' '}
              {filteredData.length} entries
            </div>

            <div className={styles.pagination}>
              <button
                className={styles.paginateButton}
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              >
                <ChevronLeft size={16} />
              </button>

              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let p = i + 1;
                if (totalPages > 5 && currentPage > 3) {
                  p = currentPage - 2 + i;
                  if (p > totalPages) p = totalPages - (4 - i);
                }
                return (
                  <button
                    key={p}
                    className={`${styles.paginateButton} ${
                      currentPage === p ? styles.active : ''
                    }`}
                    onClick={() => setCurrentPage(p)}
                  >
                    {p}
                  </button>
                );
              })}

              <button
                className={styles.paginateButton}
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
    </div>
  );
}
