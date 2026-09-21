import React, { useState, useMemo } from 'react';
import { ChevronDown, ChevronRight, Edit2, Trash2, Download } from 'lucide-react';
import { useDashboardData } from '../../../hooks/useDashboardData';
import styles from '../../../styles/cni-premium.module.css';

export function DashboardTable({ records, activeTab, globalSearch, showActions, onEdit, isLoading }) {
  const { removeFileMutation, tdsClickMutation, ghsSdsClickMutation } = useDashboardData();
  const [collapsedGroups, setCollapsedGroups] = useState({});

  const toggleGroup = (groupName) => {
    setCollapsedGroups(prev => ({
      ...prev,
      [groupName]: !prev[groupName]
    }));
  };

  const groupedData = useMemo(() => {
    if (!records || records.length === 0) return [];
    let filteredRecords = records;
    let searchWords = [];

    if (globalSearch.trim()) {
      searchWords = globalSearch.trim().toLowerCase().split(/\s+/);
      filteredRecords = records.filter(record => {
        const searchableStr = [
          record.s_struture_name, record.s_gsm, record.s_thikness,
          record.s_type, record.s_optics, record.s_txt_apprnce,
          record.s_moisture, record.s_oxygen_barrier, record.s_sustanable_cert,
          record.s_mfg_status
        ].join(' ').toLowerCase();
        return searchWords.every(word => searchableStr.includes(word));
      });
    }

    const groups = {};
    const order = [];

    filteredRecords.forEach(record => {
      const typeText = record.s_type || '';
      if (!groups[typeText]) {
        groups[typeText] = [];
        order.push(typeText);
      }

      let matchCount = 0;
      if (searchWords.length > 0) {
        const thicknessText = (record.s_thikness || '').toLowerCase();
        searchWords.forEach(w => {
          if (thicknessText.includes(w)) matchCount++;
        });
      }
      
      groups[typeText].push({ ...record, score: matchCount });
    });

    order.sort();

    return order.map(groupName => {
      const items = groups[groupName];
      items.sort((a, b) => b.score - a.score);
      return { groupName, items };
    });

  }, [records, globalSearch]);

  if (isLoading) {
    return <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading Regulatory Data...</div>;
  }

  if (groupedData.length === 0) {
    return (
      <div className={styles.surface} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
        No matching records found. Try adjusting your filters or search terms.
      </div>
    );
  }

  return (
    <div className={styles.tableContainer}>
      <table className={styles.table}>
        <thead>
          <tr>
            {showActions && <th style={{ width: '100px', textAlign: 'center' }}>Action</th>}
            <th>Structure Name</th>
            <th>GSM</th>
            <th>Thickness (µ)</th>
            <th>Type</th>
            <th>TDS / GHS SDS</th>
            <th>Appearance</th>
            <th>Key Property</th>
            <th>H₂O barrier (&lt;)</th>
            <th>O₂ barrier (&lt;)</th>
            <th>Sustainable cert</th>
            <th>Manufacturing Status</th>
          </tr>
        </thead>
        <tbody>
          {groupedData.map(group => {
            const isCollapsed = collapsedGroups[group.groupName] !== false;

            return (
              <React.Fragment key={group.groupName}>
                <tr 
                  className={styles.groupHeader}
                  onClick={() => toggleGroup(group.groupName)}
                >
                  <td colSpan={13} style={{ padding: '1rem', borderBottom: '1px solid var(--border-glass)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {isCollapsed ? <ChevronRight size={18} /> : <ChevronDown size={18} />}
                      {group.groupName || 'Uncategorized'} <span style={{ fontSize: '0.8rem', opacity: 0.8, fontWeight: 500 }}>({group.items.length} records)</span>
                    </div>
                  </td>
                </tr>

                {!isCollapsed && group.items.map(record => {
                  const showTds = record.s_tds_new_name;
                  const showGhs = record.s_ghssds_new_name;
                  
                  const mSign = record.s_moisture_sign || '';
                  const mVal = record.s_moisture || '';
                  const moistureStr = (!mSign && !mVal) || (mSign==='null' && mVal==='null') ? '' : `${mSign==='null'?'':mSign}${mVal==='null'?'':mVal}`;
                  
                  const oSign = record.s_oxygen_barrier_sign || '';
                  const oVal = record.s_oxygen_barrier || '';
                  const oxygenStr = (!oSign && !oVal) || (oSign==='null' && oVal==='null') ? '' : `${oSign==='null'?'':oSign}${oVal==='null'?'':oVal}`;
                  
                  const showBarrier = ['REG', 'CL', 'SPL', 'CNI', 'NEL', 'POLND', 'Manpura', 'assam'].includes(activeTab);

                  let sustCertLinks = [];
                  if (record.s_sust_cert_path) {
                    try {
                      if (record.s_sust_cert_path.includes(",'")) {
                        record.s_sust_cert_path.split(",'").forEach((pathStr, i) => {
                          if (pathStr) {
                            const arr = JSON.parse(pathStr.trim());
                            if (Array.isArray(arr) && arr[i]) {
                              arr.forEach(f => sustCertLinks.push(f));
                            }
                          }
                        });
                      } else {
                        const parsed = JSON.parse(record.s_sust_cert_path);
                        if (Array.isArray(parsed)) {
                          sustCertLinks = parsed;
                        } else {
                          sustCertLinks = [parsed];
                        }
                      }
                    } catch (e) {
                      // ignore parse errors
                    }
                  }

                  return (
                    <tr key={record.n_reg_attch_id}>
                      {showActions && (
                        <td style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>
                          <button 
                            className={styles.btnAction} 
                            onClick={() => onEdit(record.n_reg_attch_id)} 
                            title="Edit Record"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button 
                            className={`${styles.btnAction} ${styles.btnActionDanger}`} 
                            onClick={() => {
                              if (window.confirm("Are you sure you want to delete this record?")) {
                                removeFileMutation.mutate(record.n_reg_attch_id);
                              }
                            }} 
                            title="Delete Record"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      )}
                      <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{record.s_struture_name}</td>
                      <td>{record.s_gsm}</td>
                      <td>{record.s_thikness}</td>
                      <td>{record.s_type}</td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          {showTds && (
                            <a href={`/${record.s_tds_path}/${record.s_tds_new_name}`} target="_blank" rel="noreferrer" onClick={() => tdsClickMutation.mutate()} style={{ textDecoration: 'none' }}>
                              <span className={styles.btnSecondary} style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', width: '100%' }}>
                                <Download size={14} /> TDS
                              </span>
                            </a>
                          )}
                          {showGhs && (
                            <a href={`/${record.s_ghssds_path}/${record.s_ghssds_new_name}`} target="_blank" rel="noreferrer" onClick={() => ghsSdsClickMutation.mutate()} style={{ textDecoration: 'none' }}>
                              <span className={styles.btnSecondary} style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', width: '100%' }}>
                                <Download size={14} /> GHS SDS
                              </span>
                            </a>
                          )}
                        </div>
                      </td>
                      <td>{record.s_optics}</td>
                      <td>{record.s_txt_apprnce === 'null' ? ' ' : record.s_txt_apprnce}</td>
                      <td style={{ textAlign: 'center' }}>{showBarrier ? moistureStr : ''}</td>
                      <td style={{ textAlign: 'center' }}>{showBarrier ? oxygenStr : ''}</td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <span style={{ fontWeight: 600 }}>{record.s_sustanable_cert}</span>
                          {sustCertLinks.map((f, idx) => (
                            <a key={idx} href={`/${f.path}/${f.name}`} target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
                              <span className={styles.btnSecondary} style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}>
                                <Download size={14} /> Cert
                              </span>
                            </a>
                          ))}
                        </div>
                      </td>
                      <td>
                        <span style={{ 
                          padding: '0.3rem 0.6rem', 
                          borderRadius: '50px', 
                          fontSize: '0.75rem', 
                          fontWeight: 600,
                          backgroundColor: record.s_mfg_status === 'Running' ? 'rgba(99, 181, 47, 0.15)' : 'rgba(220, 53, 69, 0.1)',
                          color: record.s_mfg_status === 'Running' ? 'var(--secondary-dark)' : 'var(--text-secondary)'
                        }}>
                          {record.s_mfg_status === 'null' ? 'N/A' : record.s_mfg_status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
