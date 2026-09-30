import React, { useState, useEffect } from 'react';
import { X, Send, UserCheck, MessageSquare } from 'lucide-react';
import styles from '../styles/WccModals.module.css';
import { BASE_URL } from '../constants/wccConstants';
import { useWcc } from '../context/useWcc';

export default function WccForwardModal({
  isOpen,
  onClose,
  onForwardSubmit,
  loading = false,
}) {
  const { showToast } = useWcc();
  const [forwarderList, setForwarderList] = useState([]);
  const [selectedForwarder, setSelectedForwarder] = useState('');
  const [forwarderRemark, setForwarderRemark] = useState('');

  useEffect(() => {
    if (!isOpen) return;

    fetch(`${BASE_URL}/workcompletionRoute/get_forwarder`)
      .then((res) => res.json())
      .then((data) => {
        if (data && Array.isArray(data.data)) {
          setForwarderList(data.data);
        }
      })
      .catch((err) => {
        console.error('Error fetching forwarders:', err);
      });
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedForwarder.trim()) {
      showToast('Please select a forwarder recipient', 'error');
      return;
    }
    if (!forwarderRemark.trim()) {
      showToast('Please enter a remark for the forwarder', 'error');
      return;
    }

    onForwardSubmit(selectedForwarder, forwarderRemark);
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>
            <Send size={18} color="#0284c7" />
            Forward Work Completion Request
          </h3>
          <button onClick={onClose} className={styles.closeBtn} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={styles.modalBody}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Select Forwarder Recipient *</label>
              <input
                type="text"
                list="forwarderContactList"
                className={styles.formControl}
                placeholder="Type or select email / user..."
                value={selectedForwarder}
                onChange={(e) => setSelectedForwarder(e.target.value)}
                required
              />
              <datalist id="forwarderContactList">
                {forwarderList.map((contact, idx) => (
                  <option key={idx} value={contact.S_EMAIL_ID}>
                    {contact.S_EMP_NAME ? `${contact.S_EMP_NAME} (${contact.S_EMAIL_ID})` : contact.S_EMAIL_ID}
                  </option>
                ))}
              </datalist>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Remark for Forwarder *</label>
              <textarea
                className={styles.formControl}
                style={{ height: '80px', resize: 'vertical' }}
                placeholder="Enter instructions or context for forwarder..."
                value={forwarderRemark}
                onChange={(e) => setForwarderRemark(e.target.value)}
                required
              />
            </div>
          </div>

          <div className={styles.modalFooter}>
            <button type="button" className={styles.closeBtn} onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-info"
              style={{
                backgroundColor: '#0284c7',
                color: '#ffffff',
                border: 'none',
                padding: '8px 18px',
                borderRadius: '6px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Send size={14} /> {loading ? 'Forwarding...' : 'Forward Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
