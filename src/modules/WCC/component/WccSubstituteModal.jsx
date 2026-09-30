import React, { useState, useEffect } from 'react';
import { X, UserPlus, Calendar } from 'lucide-react';
import styles from '../styles/WccModals.module.css';
import { BASE_URL, getTodayDate } from '../constants/wccConstants';
import { useWcc } from '../context/useWcc';

export default function WccSubstituteModal({ isOpen, onClose }) {
  const { uid, showToast } = useWcc();
  const [usersList, setUsersList] = useState([]);
  const [username, setUsername] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [isAvailable, setIsAvailable] = useState('0');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    // Fetch contact persons / forwarder users for substitute selection
    fetch(`${BASE_URL}/workcompletionRoute/get_forwarder`)
      .then((res) => res.json())
      .then((data) => {
        if (data && Array.isArray(data.data)) {
          setUsersList(data.data);
        }
      })
      .catch((err) => {
        console.error('Error fetching users for substitute:', err);
      });
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!username) {
      showToast('Please select a substitute user', 'error');
      return;
    }
    if (!fromDate || !toDate) {
      showToast('Please select from and to dates', 'error');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        s_loginuser: uid,
        username,
        is_availbl: isAvailable,
        f_date: fromDate,
        t_date: toDate,
        currnt_date: getTodayDate(),
      };

      const response = await fetch(`${BASE_URL}/workcompletionRoute/Add_RemoveSubstitute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result && result.error_message === 'Request not found or not in pending status.') {
        showToast(
          'This user has already added a substitute user for a specific date. Until that date, you cannot change the substitute user.',
          'error'
        );
      } else {
        showToast('Substitute user saved successfully!', 'success');
        onClose();
      }
    } catch (err) {
      console.error('Error submitting substitute:', err);
      showToast('Failed to assign substitute', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>
            <UserPlus size={18} color="#062b67" />
            Add / Change Substitute User
          </h3>
          <button onClick={onClose} className={styles.closeBtn} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={styles.modalBody}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Select Substitute User *</label>
              <select
                className={styles.formControl}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              >
                <option value="">-- Choose User --</option>
                {usersList.map((u, i) => (
                  <option key={i} value={u.S_EMAIL_ID}>
                    {u.S_EMAIL_ID} {u.S_EMP_NAME ? `(${u.S_EMP_NAME})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>From Date *</label>
                <input
                  type="date"
                  className={styles.formControl}
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>To Date *</label>
                <input
                  type="date"
                  className={styles.formControl}
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          <div className={styles.modalFooter}>
            <button type="button" className={styles.closeBtn} onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{
                backgroundColor: '#062b67',
                color: '#ffffff',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '6px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {loading ? 'Saving...' : 'Save Substitute'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
