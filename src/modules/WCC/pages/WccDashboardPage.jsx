import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Plus, UserPlus, UserMinus, RefreshCw } from 'lucide-react';
import dashboardStyles from '../styles/WccDashboard.module.css';
import WccHeader from '../component/WccHeader';
import WccToast from '../component/WccToast';
import WccSummaryCards from '../component/WccSummaryCards';
import WccRequestTable from '../component/WccRequestTable';
import WccForwardedTable from '../component/WccForwardedTable';
import WccTrailModal from '../component/WccTrailModal';
import WccSubstituteModal from '../component/WccSubstituteModal';
import { useWcc } from '../context/useWcc';

export default function WccDashboardPage() {
  const navigate = useNavigate();
  const {
    userRole,
    userLevel,
    summaryCounts,
    fetchRequestList,
    fetchForwardedList,
    fetchUserLevel,
    get_reg_loc_lvl,
    toast,
    hideToast,
    showToast,
  } = useWcc();

  const [trailModalOpen, setTrailModalOpen] = useState(false);
  const [selectedTrailId, setSelectedTrailId] = useState(null);
  const [substituteModalOpen, setSubstituteModalOpen] = useState(false);

  const isInitiator =
    userRole === 'Inititior' ||
    userRole === 'In' ||
    String(userLevel) === '1';

  const isApprover =
    String(userLevel) === '2' ||
    String(userLevel) === '3' ||
    String(userLevel) === '4' ||
    userRole === 'HO accounts';

  const handleOpenTrail = (id) => {
    setSelectedTrailId(id);
    setTrailModalOpen(true);
  };

  const handleNewRequestClick = async () => {
    let role = userRole;
    let lvl = userLevel;

    if (!role || !lvl) {
      const res = await fetchUserLevel();
      role = res?.userRole || 'In';
      lvl = res?.userLevel || '1';
    }

    const isUserInitiator =
      role === 'Inititior' ||
      role === 'In' ||
      String(lvl) === '1';

    if (!isUserInitiator) {
      showToast('You are not an authorized person; only Initiator can initiate a form.', 'error');
      return;
    }

    // Call window.get_reg_loc_lvl() upon clicking New Request button to preserve legacy behavior
    if (typeof window.get_reg_loc_lvl === 'function') {
      await window.get_reg_loc_lvl();
    } else if (typeof get_reg_loc_lvl === 'function') {
      await get_reg_loc_lvl();
    }

    navigate('/wcc/new');
  };

  const handleRemoveSubstitute = () => {
    showToast('Substitute user removal requested', 'info');
  };

  return (
    <div>
      <WccHeader />
      <WccToast toast={toast} onClose={hideToast} />

      <main className={dashboardStyles.pageWrapper}>
        <div className={dashboardStyles.dashboardContainer}>
          {/* Top Bar: Summary Cards & Quick Action Buttons */}
          <div className={dashboardStyles.topBar}>
            {/* Show Summary counts for initiator or all */}
            {isInitiator && <WccSummaryCards counts={summaryCounts} />}

            {/* Action Buttons */}
            <div className={dashboardStyles.actionButtons}>
              {isInitiator && (
                <button
                  type="button"
                  className={dashboardStyles.btnPrimary}
                  onClick={handleNewRequestClick}
                >
                  <Plus size={16} /> New Request
                </button>
              )}
{/* 
              {isApprover && (
                <>
                  <button
                    type="button"
                    className={dashboardStyles.btnSuccess}
                    onClick={() => setSubstituteModalOpen(true)}
                  >
                    <UserPlus size={15} /> Add / Change Substitute
                  </button>

                  <button
                    type="button"
                    className={dashboardStyles.btnOutline}
                    onClick={handleRemoveSubstitute}
                  >
                    <UserMinus size={15} /> Remove Substitute
                  </button>
                </>
              )} */}

              <button
                type="button"
                className={dashboardStyles.btnOutline}
                onClick={() => {
                  fetchRequestList();
                  fetchForwardedList();
                  showToast('Refreshed data list', 'info');
                }}
                title="Refresh requests"
              >
                <RefreshCw size={14} /> Refresh
              </button>
            </div>
          </div>

          {/* Main List of Requests Table */}
          <WccRequestTable onOpenTrail={handleOpenTrail} />

          {/* Forwarded Requests Table */}
          <WccForwardedTable onOpenTrail={handleOpenTrail} />
        </div>
      </main>

      {/* Modals */}
      <WccTrailModal
        isOpen={trailModalOpen}
        onClose={() => {
          setTrailModalOpen(false);
          setSelectedTrailId(null);
        }}
        requestId={selectedTrailId}
      />

      <WccSubstituteModal
        isOpen={substituteModalOpen}
        onClose={() => setSubstituteModalOpen(false)}
      />
    </div>
  );
}
