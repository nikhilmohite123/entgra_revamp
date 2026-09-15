import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from '../styles/tablePage.module.css';
import SvgSprite from '../components/SvgSprite';
import IdeaHubHeader from '../components/IdeaHubHeader';
import IdeaHubFooter from '../components/IdeaHubFooter';
import ViewModal from '../components/ViewModal';
import EditModal from '../components/EditModal';
import DeleteModal from '../components/DeleteModal';
import Lightbox from '../components/Lightbox';
import Toast from '../components/Toast';
import {
  MODULE_LABELS,
  CATEGORY_LABELS,
  COUNTRY_OPTIONS,
  buildRefNo,
  esc,
  BASE_URL
} from '../constants/ideaHubConstants';

export default function TablePage() {
  const { moduleType } = useParams();
  const navigate = useNavigate();

  const currentModule = moduleType || 'material';
  const moduleCfg = MODULE_LABELS[currentModule] || {
    id: currentModule,
    label: currentModule,
    title: `${currentModule} Innovation Ideas`
  };

  const baseUrl = BASE_URL;
  // State
  const [selectedCategory, setSelectedCategory] = useState(1);
  const [allRows, setAllRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCountry, setFilterCountry] = useState('');
  const [userRole, setUserRole] = useState(0); // 1 = Admin, 0 = Normal
  const [isAccessNDP, setIsAccessNDP] = useState(false);

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

  // Restore category from sessionStorage
  useEffect(() => {
    try {
      const saved = JSON.parse(sessionStorage.getItem('selectedCategory') || 'null');
      if (saved && saved.num) {
        setSelectedCategory(saved.num);
      }
    } catch {
      // ignore
    }
  }, []);

  // Check NPD Auth and User Role
  useEffect(() => {
    const uid = localStorage.getItem('uid') || '';
    if (uid) {
      fetch(`${baseUrl}/api/innovations/checkid?username=${encodeURIComponent(uid)}`)
        .then((res) => res.json())
        .then((res) => {
          if (res) {
            setIsAccessNDP(!!res.authorized);
            setUserRole(res.role == 1 ? 1 : 0);
          }
        })
        .catch(() => {
          setIsAccessNDP(false);
          setUserRole(0);
        });
    }
  }, []);

  // Fetch Table Data
  const fetchData = useCallback(() => {
    setLoading(true);
    const uid = localStorage.getItem('uid') || 'anonymous';
    let url = `${baseUrl}/api/innovations?s_module_type=${encodeURIComponent(currentModule)}`;

    try {
      const savedCat = JSON.parse(sessionStorage.getItem('selectedCategory') || 'null');
      if (savedCat && savedCat.short) {
        url += `&s_main_module=${encodeURIComponent(savedCat.short)}`;
      }
    } catch {
      // ignore
    }

    url += `&username=${encodeURIComponent(uid)}&special=${isAccessNDP}`;

    fetch(url)
      .then((res) => res.json())
      .then((res) => {
        setLoading(false);
        if (res && res.success && Array.isArray(res.data)) {
          setAllRows(res.data);
        } else {
          setAllRows([]);
        }
      })
      .catch(() => {
        setLoading(false);
        setAllRows([]);
      });
  }, [currentModule, isAccessNDP]);

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
          contactStr
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();

        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [allRows, filterCountry, searchTerm]);

  const catObj = CATEGORY_LABELS[selectedCategory] || CATEGORY_LABELS[1];
  const isCommercial = catObj.short === 'Commercialised';
  const isOthers = currentModule === 'others';
  const currentUid = localStorage.getItem('uid') || '';

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
                placeholder="Search…"
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
            <div className={styles.recordCount}>
              {filteredRows.length} {filteredRows.length === 1 ? 'entry' : 'entries'}
            </div>
          </div>
        </div>

        {/* Data Table Wrapper */}
        <div className={styles.tableWrapper}>
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
                const contacts = Array.isArray(row.contacts) ? row.contacts : [];
                const date = row.d_created_at
                  ? new Date(row.d_created_at).toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric'
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
                          <span
                            className={styles.cellTruncate}
                            title={row.t_feature || ''}
                          >
                            {row.t_feature || '—'}
                          </span>
                        </td>
                        <td>
                          <span
                            className={styles.cellTruncate}
                            title={row.t_benifit || ''}
                          >
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
                          files.map((f, i) => (
                            <img
                              key={f.n_file_id || i}
                              className={styles.cellImgThumb}
                              src={`${baseUrl}${f.s_file_path}`}
                              alt="Thumbnail"
                              onClick={() => setLightboxSrc(`${baseUrl}${f.s_file_path}`)}
                            />
                          ))
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

                    {/* Contact Name */}
                    <td className={styles.subCell}>
                      {contacts.length > 0
                        ? contacts.map((c, idx) => (
                            <div key={idx} className={styles.subCellVal}>
                              {esc(c.s_contact_name || '—')}
                            </div>
                          ))
                        : '—'}
                    </td>

                    {/* Contact Email */}
                    <td className={styles.subCell}>
                      {contacts.length > 0
                        ? contacts.map((c, idx) => (
                            <div key={idx} className={styles.subCellVal}>
                              {c.s_email ? (
                                <a href={`mailto:${esc(c.s_email)}`}>{c.s_email}</a>
                              ) : (
                                '—'
                              )}
                            </div>
                          ))
                        : '—'}
                    </td>

                    {/* Contact Phone */}
                    <td className={styles.subCell}>
                      {contacts.length > 0
                        ? contacts.map((c, idx) => (
                            <div key={idx} className={styles.subCellVal}>
                              {esc(c.s_phone || '—')}
                            </div>
                          ))
                        : '—'}
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

          {/* Loading state */}
          {loading && (
            <div className={styles.tableLoading}>
              <div className={styles.spinner}></div>
              <p>Loading innovation data…</p>
            </div>
          )}

          {/* Empty state */}
          {!loading && filteredRows.length === 0 && (
            <div className={styles.tableEmpty}>
              <div className={styles.emptyIcon}>📋</div>
              <p className={styles.emptyTitle}>No entries yet</p>
              <p className={styles.emptySub}>
                Click <strong>+ Add Entry</strong> in the top bar to submit the first
                innovation.
              </p>
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
          isOpen={!!deleteId}
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
        <Lightbox
          src={lightboxSrc}
          onClose={() => setLightboxSrc(null)}
        />
      )}

      {/* Footer */}
      <IdeaHubFooter />
    </div>
  );
}
