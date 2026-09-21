import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, RotateCcw, Activity } from 'lucide-react';
import { useLogs } from '../../hooks/useLogs';
import { useCniPermissions } from '../../hooks/useCniPermissions';
import { CniLoader } from '../../components/common';
import cniStyles from '../../styles/cni-premium.module.css';

const AUTHORIZED_USERS = [
  'shubhangi.avhad', 'hariharan.k', 'gurunath.pv', 
  'sonal.pandit', 'kavita.shepal', 'dms.support2'
];

export function LogManagementPage() {
  const navigate = useNavigate();
  const { user } = useCniPermissions();

  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [selectedUser, setSelectedUser] = useState('');
  const [filteredReports, setFilteredReports] = useState([]);

  const { users, reports, isLoading } = useLogs();

  useEffect(() => {
    // Legacy Authorization contract preservation
    if (user && !AUTHORIZED_USERS.includes(user)) {
      alert('You are Not Authorized For This Module');
      navigate('/cni/dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!fromDate || !toDate) {
      alert('Please select both from and to dates');
      return;
    }

    const start = new Date(fromDate).toISOString().split('T')[0];
    const end = new Date(toDate).toISOString().split('T')[0];

    const results = reports.filter(item => {
      if (!item.timestamp || !item.message) return false;
      
      const logDate = item.timestamp.split(' ')[0];
      const byUser = item.message.USER;

      const withinDateRange = logDate >= start && logDate <= end;
      const matchesUser = selectedUser ? byUser === selectedUser : true;

      return withinDateRange && matchesUser;
    });

    setFilteredReports(results);
  };

  const handleReset = () => {
    setFromDate('');
    setToDate('');
    setSelectedUser('');
    setFilteredReports([]);
  };

  if (isLoading) return <CniLoader />;

  return (
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      <div className={cniStyles.dashboardCard}>
        <div className={cniStyles.cardHeader} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <Activity size={24} style={{ color: 'var(--primary)' }} />
          <h3 className={cniStyles.cardTitle} style={{ margin: 0 }}>Log Management Report</h3>
        </div>
        
        <div className={cniStyles.cardBody}>
          <form onSubmit={handleSubmit} style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', alignItems: 'end' }}>
              <div>
                <label className={cniStyles.formLabel}>From Date</label>
                <input 
                  className={cniStyles.formControl}
                  type="date" 
                  value={fromDate} 
                  onChange={(e) => setFromDate(e.target.value)} 
                />
              </div>
              
              <div>
                <label className={cniStyles.formLabel}>To Date</label>
                <input 
                  className={cniStyles.formControl}
                  type="date" 
                  value={toDate} 
                  onChange={(e) => setToDate(e.target.value)} 
                />
              </div>
              
              <div>
                <label className={cniStyles.formLabel}>User</label>
                <select 
                  className={cniStyles.formControl} 
                  value={selectedUser} 
                  onChange={(e) => setSelectedUser(e.target.value)}
                >
                  <option value="">All Users</option>
                  {users.map((u, i) => (
                    <option key={i} value={u.s_emp_name?.toLowerCase()}>
                      {u.s_emp_name?.toLowerCase()}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button type="submit" className={cniStyles.btnPrimary} style={{ flex: 1, padding: '0.75rem' }}>
                  <Search size={18} /> Search
                </button>
                <button type="button" className={cniStyles.btnSecondary} onClick={handleReset} style={{ padding: '0.75rem' }}>
                  <RotateCcw size={18} />
                </button>
              </div>
            </div>
          </form>

          {filteredReports.length > 0 ? (
            <div className={cniStyles.tableContainer}>
              <table className={cniStyles.table}>
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Location</th>
                    <th>IP Address</th>
                    <th>URL</th>
                    <th>User Role</th>
                    <th>Timestamp</th>
                    <th>Message</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReports.map((r, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 600, color: 'var(--primary)' }}>{r.message?.USER}</td>
                      <td>{r.message?.LOCATION}</td>
                      <td>{r.message?.IP}</td>
                      <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={r.message?.URL}>{r.message?.URL}</td>
                      <td>
                        <span style={{ padding: '4px 10px', background: 'var(--bg-tertiary)', borderRadius: '50px', fontSize: '0.8rem', fontWeight: 600 }}>
                          {r.message?.ROLE}
                        </span>
                      </td>
                      <td style={{ whiteSpace: 'nowrap', fontSize: '0.85rem' }}>{r.timestamp}</td>
                      <td>{r.message?.MESS}</td>
                      <td>{r.message?.MESS_BODY}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
             (fromDate && toDate) ? (
               <div style={{ padding: '3rem', textAlign: 'center', background: 'var(--bg-tertiary)', borderRadius: '8px', color: 'var(--text-secondary)' }}>
                 No logs found for the selected criteria.
               </div>
             ) : null
          )}
        </div>
      </div>
    </div>
  );
}
