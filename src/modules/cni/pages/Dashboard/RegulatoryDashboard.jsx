import React, { useState, useEffect } from 'react';
import { Plus, Search, ShieldAlert } from 'lucide-react';
import { useDashboardData } from '../../hooks/useDashboardData';
import { DashboardJumbotron } from './components/DashboardJumbotron';
import { DashboardFilters } from './components/DashboardFilters';
import { DashboardForm } from './components/DashboardForm';
import { DashboardTable } from './components/DashboardTable';
import { CniLoader, CniError } from '../../components/common';
import cniStyles from '../../styles/cni-premium.module.css';
import styles from '../../styles/dashboard.module.css';

// Legacy Tabs mapping based on /db/regulatoryAccess keys
const TABS = [
  { id: 'REG', label: 'India Commercial Laminates', key: 's_India_Comm_Lami', exactMatch: 'India_Commercial_Laminates' },
  { id: 'SPL', label: 'Co-Ex tubes Wada', key: 's_Seam_Plstc_Tube', exactMatch: 'Seamless_Plastic_Tubes' },
  { id: 'CL', label: 'China Laminates', key: 's_China_Lami', exactMatch: 'China_Laminates' },
  { id: 'NEL', label: 'Non-EPL Laminates', key: 's_Non_EPL_Lami', exactMatch: 'Non_EPL_Laminates' },
  { id: 'CNI', label: 'CNI', key: 's_Cni', exactMatch: 'CNI' },
  { id: 'POLND', label: 'Poland', key: 's_poland', exactMatch: 'Poland' }, // Assuming Poland has a key in legacy access response? The legacy html didn't show the exact key for Poland in `hideshow` Emp switch. Actually it omitted Poland and some others for Emp or they were added later. We will just check if they are present or if Admin.
  { id: 'assam', label: 'Assam', key: 's_assam', exactMatch: 'assam' },
  { id: 'Manpura', label: 'Co-Ex tubes Manpura', key: 's_Seam_Plstc_manpura', exactMatch: 'Seamless_Plastic_Manpura' },
];

export function RegulatoryDashboard() {
  const [activeTab, setActiveTab] = useState('REG');
  const [filters, setFilters] = useState(null);
  const [globalSearch, setGlobalSearch] = useState('');
  const [editRecordId, setEditRecordId] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // If editRecordId changes to a value, automatically open the form
  useEffect(() => {
    if (editRecordId !== null) {
      setIsFormOpen(true);
    }
  }, [editRecordId]);

  const { accessData, isLoadingAccess, recordsData, isLoadingRecords, isFetchingRecords } = useDashboardData(filters);

  if (isLoadingAccess) return <CniLoader />;
  if (!accessData || accessData.length === 0) {
    // If no access data, legacy hid everything except the 4 base tabs, and disabled form/action buttons.
    // For simplicity, we can render the base UI without edit permissions.
  }

  const access = accessData && accessData.length > 0 ? accessData[0] : null;

  // TEMPORARY BYPASS FOR TESTING: Give full access to all users
  const isAdmin = true; // localIsAdmin || (access && access.s_User_type === 'Admin');
  
  // Determine visible tabs
  const visibleTabs = TABS.filter(tab => {
    if (isAdmin) return true;
    if (access && access[tab.key] === tab.exactMatch) return true;
    // Base tabs that were shown when access record wasn't found in legacy
    if (!access && ['REG', 'SPL', 'CL', 'NEL'].includes(tab.id)) return true;
    return false;
  });

  const showForm = true; // isAdmin || (access && access.s_mainForm === 'mainForm');
  const showViewBy = true; // Action buttons

  // Filter the full dataset to the active tab
  const activeRecords = recordsData.filter(r => r.s_type_doc === activeTab);

  return (
    <div className={`container-fluid ${styles.dashboardContainer}`} style={{ padding: '2rem' }}>
      
      {/* Header Actions */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
        {isAdmin && (
          <button 
            className={cniStyles.btnSecondary} 
            onClick={() => window.location.href = '/regultoryAuthorize'}
          >
            <ShieldAlert size={16} /> Authorize Users
          </button>
        )}
      </div>

      <DashboardJumbotron />

      <DashboardFilters onFilterChange={setFilters} />

      {/* Toolbar: Search and Add New Record */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ position: 'relative', width: '100%', maxWidth: '400px' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '10px', color: 'var(--text-secondary)' }} />
          <input 
            type="text" 
            className={cniStyles.formControl}
            placeholder="Search across all columns..." 
            style={{ paddingLeft: '2.5rem', borderRadius: '50px' }}
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
          />
        </div>

        {showForm && (
          <button 
            className={cniStyles.btnPrimary}
            onClick={() => { setEditRecordId(null); setIsFormOpen(true); }}
          >
            <Plus size={18} /> Add New Record
          </button>
        )}
      </div>

      {showForm && isFormOpen && (
        <DashboardForm 
          editRecordId={editRecordId} 
          onClose={() => { setIsFormOpen(false); setEditRecordId(null); }}
        />
      )}

      {/* Tabs */}
      <div className={cniStyles.tabsContainer}>
        {visibleTabs.map(tab => (
          <button 
            key={tab.id} 
            className={`${cniStyles.tabBtn} ${activeTab === tab.id ? cniStyles.active : ''}`}
            onClick={(e) => { e.preventDefault(); setActiveTab(tab.id); }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Table Content */}
      <div style={{ marginTop: '1.5rem' }}>
        <DashboardTable 
          records={activeRecords}
          activeTab={activeTab}
          globalSearch={globalSearch}
          showActions={showViewBy}
          onEdit={(id) => setEditRecordId(id)}
          isLoading={isFetchingRecords}
        />
      </div>

    </div>
  );
}
