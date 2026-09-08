import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from '../styles/TablePage.module.css';
import SvgSprite from '../components/SvgSprite';
import IdeaHubHeader from '../components/IdeaHubHeader';
import IdeaHubFooter from '../components/IdeaHubFooter';
import ViewModal from '../components/ViewModal';
import EditModal from '../components/EditModal';
import DeleteModal from '../components/DeleteModal';
import Lightbox from '../components/Lightbox';
import Toast from '../components/Toast';
import { TableSkeleton } from '../../../components/common/Skeleton/InstagramSkeleton';
import StateFeedback from '../../../components/common/Feedback/StateFeedback';
import {
  MODULE_LABELS,
  CATEGORY_LABELS,
  COUNTRY_OPTIONS,
  buildRefNo,
  esc,
} from '../constants/ideaHubConstants';
import { useIdeaHub } from '../context/useIdeaHub';
import { ENV } from '../../../config/env';

export default function TablePage() {
  const { moduleType } = useParams();
  const navigate = useNavigate();

  const {
    selectedCategory,
    activeCategoryObj,
    userRole,
    isAccessNDP,
    userProfile,
  } = useIdeaHub();

  const currentModule = moduleType || 'material';
  const moduleCfg = MODULE_LABELS[currentModule] || {
    id: currentModule,
    label: currentModule,
    title: `${currentModule} Innovation Ideas`,
  };

  // Data State
  const [allRows, setAllRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCountry, setFilterCountry] = useState('');

  // Modal States
  const [viewRowData, setViewRowData] = useState(null);
  const [editId, setEditId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [lightboxSrc, setLightboxSrc] = useState(null);

  // Toast State
  const [toast, setToast] = useState({ message: '', type: 'success' });

  const showToast = useCallback((msg, type = 'success') => {
    setToast({ message: msg, type });
    setTimeout(() => {
      setToast({ message: '', type: 'success' });
    }, 3200);
  }, []);

  // Fetch Table Data directly on page
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    const uid = userProfile.rawUid || localStorage.getItem('uid') || 'anonymous';
    const mainModule = activeCategoryObj ? activeCategoryObj.short : '';

    try {
      const url = new URL(`${ENV.API_BASE_URL}/api/innovations/innovations`, window.location.origin);
      url.searchParams.append('s_module_type', currentModule);
      if (mainModule) url.searchParams.append('s_main_module', mainModule);
      if (uid) url.searchParams.append('username', uid);
      if (isAccessNDP) url.searchParams.append('special', '1');

      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error(`Failed to fetch innovation ideas (Status: ${response.status})`);
      }

      const res = await response.json();
      if (res && res.success && Array.isArray(res.data)) {
        setAllRows(res.data);
      } else {
        setAllRows([]);
      }
    } catch (err) {
      console.error('Failed to fetch innovations:', err);
      setError(err.message || 'Unable to connect to server. Please try again.');
      setAllRows([]);
    } finally {
      setLoading(false);
    }
  }, [currentModule, activeCategoryObj, userProfile.rawUid, isAccessNDP]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filtered rows
  const filteredRows = useMemo(() => {
    const q = searchTerm.toLowerCase().trim();

    return allRows.filter((r) => {
      if (filterCountry && r.s_country !== filterCountry) return false;

      if (q) {
        const contactStr = (r.contacts || [])
          .map((c) => [c.s_contact_name, c.s_email, c.s_phone].filter(Boolean).join(' '))
          .join(' ');
        const haystack = [
          r.s_team_member,
          r.s_company_name,
          r.s_country,
          r.s_location,
          r.s_comments,
          r.s_links,
          r.t_feature,
          r.t_benifit,
          r.t_application,
          r.s_innovation_details,
          contactStr,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();

        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [allRows, filterCountry, searchTerm]);

  const catObj = activeCategoryObj || CATEGORY_LABELS[selectedCategory] || CATEGORY_LABELS[1];
  const isCommercial = catObj?.short === 'Commercialised';
  const isOthers = currentModule === 'others';
  const currentUid = userProfile.rawUid || localStorage.getItem('uid') || '';

  return (
    <div className={styles.ideaHubContainer}>
      <SvgSprite />

      {/* Toast */}
      <Toast message={toast.message} type={toast.type} />

      {/* Header */}
      <IdeaHubHeader
        currentModule={currentModule}
        selectedCategory={selectedCategory}
        onAddEntry={() => {
          navigate(`/idea_hub/form?module=${currentModule}`);
        }}
      />

      {/* Table Main View */}
      <main className={styles.tableMain}>
        {/* Category Banner */}
        {catObj && (
          <div
            className={`${styles.catBanner} ${
              catObj.num === 1
                ? styles.catBannerCat1
                : catObj.num === 2
                ? styles.catBannerCat2
                : styles.catBannerCat3
            }`}
          >
            <span className={styles.catBannerIcon}>
              <svg width="22" height="22">
                <use href={catObj.iconId} />
              </svg>
            </span>
            <div className={styles.catBannerText}>
              <span className={styles.catBannerTitle}>{catObj.full}</span>
              <span className={styles.catBannerSub}>Module: {moduleCfg.label}</span>
            </div>
          </div>
        )}

        {/* Topbar: Module pill, Title, Search and Country filters */}
        <div className={styles.tableTopbar}>
          <div className={styles.tableTopbarLeft}>
            <div className={styles.modulePill}>{moduleCfg.label}</div>
            <h2 className={styles.tableTitle}>{moduleCfg.title}</h2>
          </div>

          <div className={styles.tableTopbarRight}>
            {/* Search Box */}
            <div className={styles.searchBox}>
              <span className={styles.searchIcon}>⌕</span>
              <input
                type="text"
                placeholder="Search innovations…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Country Filter */}
            <div className={styles.searchSelectWrap}>
              <select
                value={filterCountry}
                onChange={(e) => setFilterCountry(e.target.value)}
              >
                <option value="">All Countries</option>
                {COUNTRY_OPTIONS.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
              <span className={styles.selectArrow}>⌄</span>
            </div>

            {/* Record Count */}
            {!loading && !error && (
              <div className={styles.recordCount}>
                {filteredRows.length} {filteredRows.length === 1 ? 'entry' : 'entries'}
              </div>
            )}
          </div>
        </div>

        {/* Table / Skeleton / State handling */}
        <div className={styles.tableWrapper}>
          {loading ? (
            /* 1. Instagram-Style Shimmer Table Skeleton Loader */
            <TableSkeleton rows={7} />
          ) : error ? (
            /* 2. Error State with Retry Button */
            <StateFeedback
              type="error"
              title="Failed to Load Innovations"
              message={error}
              actionLabel="Retry Loading"
              onAction={fetchData}
            />
          ) : filteredRows.length === 0 ? (
            /* 3. Empty State with CTA */
            <StateFeedback
              type="empty"
              title={searchTerm || filterCountry ? 'No matching innovations' : 'No innovations submitted yet'}
              message={
                searchTerm || filterCountry
                  ? 'Try adjusting your search criteria or clearing your filters.'
                  : 'Be the first to submit a cutting-edge innovation for this module!'
              }
              actionLabel="Add New Entry"
              onAction={() => navigate(`/idea_hub/form?module=${currentModule}`)}
            />
          ) : (
            /* 4. Success State: Interactive Data Table */
            <div className={styles.tableScrollArea}>
              <table className={styles.dataTable}>
                <thead>
                  <tr>
                    <th style={{ minWidth: '130px' }}>Ref No.</th>
                    <th style={{ minWidth: '140px' }}>Team Member</th>

                    {!isOthers ? (
                      <>
                        <th style={{ minWidth: '200px' }}>Feature</th>
                        <th style={{ minWidth: '200px' }}>Benefit</th>
                        <th style={{ minWidth: '200px' }}>Application</th>
                      </>
                    ) : (
                      <>
                        <th style={{ minWidth: '220px' }}>Innovation Details</th>
                        <th style={{ minWidth: '140px' }}>Comments</th>
                      </>
                    )}

                    <th style={{ minWidth: '120px' }}>Images</th>
                    <th style={{ minWidth: '130px' }}>Company</th>
                    <th style={{ minWidth: '90px' }}>Country</th>
                    <th style={{ minWidth: '120px' }}>Location</th>
                    <th style={{ minWidth: '140px' }}>Contact Name</th>
                    <th style={{ minWidth: '180px' }}>Contact Email</th>
                    <th style={{ minWidth: '120px' }}>Contact Phone</th>
                    <th style={{ minWidth: '120px' }}>Links</th>

                    {isCommercial && (
                      <>
                        <th style={{ minWidth: '160px' }}>Specification</th>
                        <th style={{ minWidth: '160px' }}>Production Unit</th>
                        <th style={{ minWidth: '130px' }}>Price/1000 (USD)</th>
                      </>
                    )}

                    <th style={{ minWidth: '110px' }}>Submitted</th>
                    <th style={{ minWidth: '110px' }}>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredRows.map((row) => {
                    const files = Array.isArray(row.files) ? row.files : [];
                    
                    // Robust contact extraction (array, JSON string, or root fields)
                    let contacts = [];
                    if (Array.isArray(row.contacts) && row.contacts.length > 0) {
                      contacts = row.contacts;
                    } else if (typeof row.contacts === 'string' && row.contacts.trim().startsWith('[')) {
                      try {
                        contacts = JSON.parse(row.contacts);
                      } catch {
                        contacts = [];
                      }
                    }

                    // Fallback to top-level contact fields if contacts array is empty
                    if (contacts.length === 0 && (row.s_contact_name || row.s_email || row.s_phone || row.s_contact_email || row.s_contact_phone)) {
                      contacts = [
                        {
                          s_contact_name: row.s_contact_name || '',
                          s_email: row.s_email || row.s_contact_email || '',
                          s_phone: row.s_phone || row.s_contact_phone || '',
                        },
                      ];
                    }

                    const date = row.d_created_at
                      ? new Date(row.d_created_at).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })
                      : '—';
                    const refNo = buildRefNo(row);
                    const canModify =
                      userRole === 1 || String(currentUid) === String(row.s_created_by);

                    return (
                      <tr key={row.n_id}>
                        {/* Ref No */}
                        <td>
                          <span
                            className={styles.cellRef}
                            onClick={() => setViewRowData(row)}
                            title="Click to view full innovation details"
                          >
                            {refNo}
                          </span>
                        </td>

                        {/* Team Member */}
                        <td>
                          <span className={styles.cellTruncate}>{esc(row.s_team_member)}</span>
                        </td>

                        {/* Feature / Benefit / Application OR Details / Comments */}
                        {!isOthers ? (
                          <>
                            <td>
                              <span className={styles.cellTruncate} title={row.t_feature || ''}>
                                {row.t_feature || '—'}
                              </span>
                            </td>
                            <td>
                              <span className={styles.cellTruncate} title={row.t_benifit || ''}>
                                {row.t_benifit || '—'}
                              </span>
                            </td>
                            <td>
                              <span
                                className={styles.cellTruncate}
                                title={row.t_application || ''}
                              >
                                {row.t_application || '—'}
                              </span>
                            </td>
                          </>
                        ) : (
                          <>
                            <td>
                              <span
                                className={styles.cellTruncate}
                                title={row.s_innovation_details || ''}
                              >
                                {row.s_innovation_details || '—'}
                              </span>
                            </td>
                            <td>
                              <span
                                className={styles.cellTruncate}
                                title={row.s_comments || ''}
                              >
                                {row.s_comments || '—'}
                              </span>
                            </td>
                          </>
                        )}

                        {/* Images */}
                        <td>
                          <div className={styles.cellImages}>
                            {files.length > 0 ? (
                              files.map((f, i) => {
                                const path = f.s_file_path || '';
                                const imgUrl = path.startsWith('http')
                                  ? path
                                  : `${ENV.API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
                                return (
                                  <img
                                    key={f.n_file_id || i}
                                    className={styles.cellImgThumb}
                                    src={imgUrl}
                                    alt="Thumbnail"
                                    onClick={() => setLightboxSrc(imgUrl)}
                                  />
                                );
                              })
                            ) : (
                              <span className={styles.cellNoImg}>—</span>
                            )}
                          </div>
                        </td>

                        {/* Company */}
                        <td>
                          <span className={styles.cellTruncate}>{esc(row.s_company_name)}</span>
                        </td>

                        {/* Country */}
                        <td>
                          <span className={styles.countryBadge}>{esc(row.s_country)}</span>
                        </td>

                        {/* Location */}
                        <td>
                          <span className={styles.cellTruncate}>{esc(row.s_location)}</span>
                        </td>

                        {/* 1. Contact Name Column */}
                        <td>
                          <div className={styles.subCell}>
                            {contacts.length > 0
                              ? contacts.map((c, idx) => (
                                  <div key={idx} className={styles.subCellVal}>
                                    {esc(c.s_contact_name || c.name || '—')}
                                  </div>
                                ))
                              : <span className={styles.subCellVal}>—</span>}
                          </div>
                        </td>

                        {/* 2. Contact Email Column */}
                        <td>
                          <div className={styles.subCell}>
                            {contacts.length > 0
                              ? contacts.map((c, idx) => {
                                  const email = c.s_email || c.email;
                                  return (
                                    <div key={idx} className={styles.subCellVal}>
                                      {email ? (
                                        <a href={`mailto:${esc(email)}`} className={styles.contactEmailLink}>
                                          {email}
                                        </a>
                                      ) : (
                                        '—'
                                      )}
                                    </div>
                                  );
                                })
                              : <span className={styles.subCellVal}>—</span>}
                          </div>
                        </td>

                        {/* 3. Contact Phone Column */}
                        <td>
                          <div className={styles.subCell}>
                            {contacts.length > 0
                              ? contacts.map((c, idx) => {
                                  const phone = c.s_phone || c.phone;
                                  return (
                                    <div key={idx} className={styles.subCellVal}>
                                      {phone ? (
                                        <a href={`tel:${esc(phone)}`} className={styles.contactPhoneLink}>
                                          {esc(phone)}
                                        </a>
                                      ) : (
                                        '—'
                                      )}
                                    </div>
                                  );
                                })
                              : <span className={styles.subCellVal}>—</span>}
                          </div>
                        </td>

                        {/* Links */}
                        <td>
                          {row.s_links ? (
                            <a
                              href={row.s_links}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={styles.cellTruncate}
                              style={{ maxWidth: '120px' }}
                            >
                              {row.s_links}
                            </a>
                          ) : (
                            '—'
                          )}
                        </td>

                        {/* Commercial Fields */}
                        {isCommercial && (
                          <>
                            <td>
                              <span className={styles.cellTruncate}>
                                {esc(row.s_specification || '—')}
                              </span>
                            </td>
                            <td>
                              <span className={styles.cellTruncate}>
                                {esc(row.s_production_unit || '—')}
                              </span>
                            </td>
                            <td>
                              <span className={styles.cellPrice}>
                                {row.n_price_per_1000 != null
                                  ? `$${parseFloat(row.n_price_per_1000).toFixed(2)}`
                                  : '—'}
                              </span>
                            </td>
                          </>
                        )}

                        {/* Submitted Date */}
                        <td className={styles.cellDate}>{date}</td>

                        {/* Actions */}
                        <td>
                          {canModify ? (
                            <div className={styles.actionBtns}>
                              <button
                                className={styles.btnEdit}
                                onClick={() => setEditId(row.n_id)}
                              >
                                Edit
                              </button>
                              <button
                                className={styles.btnDel}
                                onClick={() => setDeleteId(row.n_id)}
                              >
                                Delete
                              </button>
                            </div>
                          ) : (
                            '--'
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* View Details Modal */}
      {viewRowData && (
        <ViewModal
          row={viewRowData}
          onClose={() => setViewRowData(null)}
          onOpenLightbox={(src) => setLightboxSrc(src)}
        />
      )}

      {/* Edit Modal */}
      {editId && (
        <EditModal
          id={editId}
          onClose={() => setEditId(null)}
          onSuccess={() => fetchData()}
          showToast={showToast}
          onOpenLightbox={(src) => setLightboxSrc(src)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <DeleteModal
          isOpen={Boolean(deleteId)}
          targetId={deleteId}
          onClose={() => setDeleteId(null)}
          onSuccess={(deletedId) => {
            setAllRows((prev) => prev.filter((r) => r.n_id !== deletedId));
          }}
          showToast={showToast}
        />
      )}

      {/* Image Lightbox */}
      {lightboxSrc && (
        <Lightbox src={lightboxSrc} onClose={() => setLightboxSrc(null)} />
      )}

      {/* Footer */}
      <IdeaHubFooter />
    </div>
  );
}
