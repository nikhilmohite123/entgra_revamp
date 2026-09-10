import React, { useState, useEffect } from 'react';
import styles from '../styles/editModal.module.css';
import { MODULE_LABELS, COUNTRY_OPTIONS, BASE_URL } from '../constants/ideaHubConstants';

export default function EditModal({ id, onClose, onSuccess, showToast, onOpenLightbox }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Form Fields
  const [formData, setFormData] = useState({
    team_member: '',
    feature: '',
    benefit: '',
    application: '',
    innovation_details: '',
    comments: '',
    company_name: '',
    country: '',
    location: '',
    links: '',
    specification: '',
    production_unit: '',
    price_per_thousand: '',
    module_type: 'material',
    main_module: ''
  });

  const [existingFiles, setExistingFiles] = useState([]);
  const [removedFileIds, setRemovedFileIds] = useState([]);
  const [newFiles, setNewFiles] = useState([]);
  const [contacts, setContacts] = useState([
    { n_cont_id: null, s_contact_name: '', s_phone: '', s_email: '', _removed: false }
  ]);
  const baseUrl = BASE_URL;

  // Load entry details
  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setErrorMsg('');

    fetch(`${baseUrl}/api/innovations/${id}`)
      .then((res) => res.json())
      .then((res) => {
        if (!res || !res.success || !res.data) {
          setErrorMsg(res?.message || 'Failed to load innovation details.');
          setLoading(false);
          return;
        }
        const d = res.data;
        setFormData({
          team_member: d.s_team_member || '',
          feature: d.t_feature || '',
          benefit: d.t_benifit || '',
          application: d.t_application || '',
          innovation_details: d.s_innovation_details || '',
          comments: d.s_comments || '',
          company_name: d.s_company_name || '',
          country: d.s_country || '',
          location: d.s_location || '',
          links: d.s_links || '',
          specification: d.s_specification || '',
          production_unit: d.s_production_unit || '',
          price_per_thousand: d.n_price_per_1000 != null ? d.n_price_per_1000 : '',
          module_type: d.s_module_type || 'material',
          main_module: d.s_main_module || ''
        });

        setExistingFiles(Array.isArray(d.files) ? d.files : []);
        setRemovedFileIds([]);
        setNewFiles([]);

        const apiContacts = Array.isArray(d.contacts) ? d.contacts : [];
        if (apiContacts.length > 0) {
          setContacts(apiContacts.map((c) => ({ ...c, _removed: false })));
        } else {
          setContacts([
            { n_cont_id: null, s_contact_name: '', s_phone: '', s_email: '', _removed: false }
          ]);
        }
        setLoading(false);
      })
      .catch(() => {
        setErrorMsg('Network error while loading innovation details.');
        setLoading(false);
      });
  }, [id]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !saving) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [saving, onClose]);

  if (!id) return null;

  const isOthers = formData.module_type === 'others';
  const isCommercial =
    (formData.main_module || '').toLowerCase().includes('commercialised') ||
    formData.specification ||
    formData.production_unit ||
    formData.price_per_thousand;
  const cfg = MODULE_LABELS[formData.module_type] || { label: formData.module_type };

  // File toggles
  const toggleRemoveExisting = (fileId) => {
    if (removedFileIds.includes(fileId)) {
      setRemovedFileIds(removedFileIds.filter((x) => x !== fileId));
    } else {
      setRemovedFileIds([...removedFileIds, fileId]);
    }
  };

  const handleNewFilesChange = (e) => {
    const filesArray = Array.from(e.target.files);
    const added = filesArray.map((file) => ({
      file,
      name: file.name,
      size: file.size,
      previewUrl: URL.createObjectURL(file)
    }));
    setNewFiles((prev) => [...prev, ...added]);
    e.target.value = '';
  };

  const removeNewFile = (idx) => {
    setNewFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  // Contacts handlers
  const handleAddContact = () => {
    setContacts((prev) => [
      ...prev,
      { n_cont_id: null, s_contact_name: '', s_phone: '', s_email: '', _removed: false }
    ]);
  };

  const handleRemoveContact = (idx) => {
    const active = contacts.filter((c) => !c._removed);
    if (active.length <= 1) return;
    setContacts((prev) =>
      prev.map((c, i) => (i === idx ? { ...c, _removed: true } : c))
    );
  };

  const handleUpdateContact = (idx, field, val) => {
    setContacts((prev) =>
      prev.map((c, i) => (i === idx ? { ...c, [field]: val } : c))
    );
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setErrorMsg('');

    // Required checks
    if (!formData.team_member.trim() || !formData.company_name.trim() || !formData.country || !formData.location.trim()) {
      setErrorMsg('Please fill in all mandatory fields.');
      return;
    }

    if (isOthers) {
      if (!formData.innovation_details.trim()) {
        setErrorMsg('Innovation Details are required.');
        return;
      }
    } else {
      if (!formData.feature.trim() || !formData.benefit.trim() || !formData.application.trim()) {
        setErrorMsg('Feature, Benefit, and Application are required.');
        return;
      }
    }

    // Validate Contacts
    const activeContacts = contacts.filter((c) => !c._removed);
    for (let c of activeContacts) {
      if (!c.s_contact_name.trim()) {
        setErrorMsg('Please enter a name for all contacts.');
        return;
      }
      if (!c.s_email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.s_email.trim())) {
        setErrorMsg('Please enter a valid email for all contacts.');
        return;
      }
    }

    setSaving(true);

    try {
      const fd = new FormData();
      const uid = localStorage.getItem('uid') || 'anonymous';
      fd.append('s_created_by', uid);
      fd.append('s_team_member', formData.team_member.trim());
      fd.append('s_company_name', formData.company_name.trim());
      fd.append('s_country', formData.country);
      fd.append('s_location', formData.location.trim());
      fd.append('s_links', formData.links.trim());

      if (isOthers) {
        fd.append('s_innovation_details', formData.innovation_details.trim());
        fd.append('s_comments', formData.comments.trim());
      } else {
        fd.append('t_feature', formData.feature.trim());
        fd.append('t_benifit', formData.benefit.trim());
        fd.append('t_application', formData.application.trim());
      }

      if (isCommercial) {
        fd.append('s_specification', formData.specification.trim());
        fd.append('s_production_unit', formData.production_unit.trim());
        fd.append('n_price_per_1000', formData.price_per_thousand !== '' ? formData.price_per_thousand : '');
      }

      fd.append('remove_file_ids', removedFileIds.join(','));

      const removedCids = contacts
        .filter((c) => c._removed && c.n_cont_id)
        .map((c) => c.n_cont_id);
      fd.append('remove_contact_ids', removedCids.join(','));

      fd.append(
        'contacts',
        JSON.stringify(
          activeContacts.map((c) => ({
            n_cont_id: c.n_cont_id || undefined,
            s_contact_name: c.s_contact_name.trim(),
            s_phone: (c.s_phone || '').trim(),
            s_email: c.s_email.trim()
          }))
        )
      );

      // Append new image files
      newFiles.forEach((item) => {
        fd.append('images', item.file, item.name);
      });

      const res = await fetch(`${baseUrl}/api/innovations/${id}`, {
        method: 'PUT',
        body: fd
      });
      const data = await res.json();

      if (data && data.success) {
        if (showToast) showToast('Entry updated successfully!', 'success');
        onSuccess();
        onClose();
      } else {
        setErrorMsg(data?.message || 'Update failed on server.');
      }
    } catch {
      setErrorMsg('Failed to update entry. Network error.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={saving ? undefined : onClose}>
      <div className={styles.editModal} onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className={styles.editModalHeader}>
          <div>
            <div className={styles.editModalBadge}>{cfg.label}</div>
            <h2 className={styles.editModalTitle}>Edit Innovation Entry</h2>
          </div>
          <button className={styles.editCloseBtn} onClick={onClose} disabled={saving}>
            ×
          </button>
        </div>

        {/* Modal Body */}
        <div className={styles.editModalBody}>
          {loading ? (
            <div className={styles.tableLoading}>
              <div className={styles.spinner}></div>
              <p>Loading innovation data…</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {errorMsg && <div className={styles.errorBanner}>{errorMsg}</div>}

              <div className={styles.formGroup}>
                <label>
                  Team Member <span className={styles.required}>*</span>
                </label>
                <input
                  type="text"
                  value={formData.team_member}
                  onChange={(e) => setFormData({ ...formData, team_member: e.target.value })}
                  required
                  placeholder="Enter team member name"
                />
              </div>

              {!isOthers ? (
                <>
                  <div className={styles.formGroup}>
                    <label>
                      Feature <span className={styles.required}>*</span>
                    </label>
                    <textarea
                      rows={3}
                      value={formData.feature}
                      onChange={(e) => setFormData({ ...formData, feature: e.target.value })}
                      placeholder="Enter Feature"
                      required
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>
                      Benefit <span className={styles.required}>*</span>
                    </label>
                    <textarea
                      rows={3}
                      value={formData.benefit}
                      onChange={(e) => setFormData({ ...formData, benefit: e.target.value })}
                      placeholder="Enter Benefit"
                      required
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>
                      Application <span className={styles.required}>*</span>
                    </label>
                    <textarea
                      rows={3}
                      value={formData.application}
                      onChange={(e) => setFormData({ ...formData, application: e.target.value })}
                      placeholder="Enter Application"
                      required
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className={styles.formGroup}>
                    <label>
                      Innovation Details <span className={styles.required}>*</span>
                    </label>
                    <textarea
                      rows={4}
                      value={formData.innovation_details}
                      onChange={(e) =>
                        setFormData({ ...formData, innovation_details: e.target.value })
                      }
                      placeholder="Enter Innovation Details"
                      required
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Comments</label>
                    <textarea
                      rows={3}
                      value={formData.comments}
                      onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
                      placeholder="Enter Comments"
                    />
                  </div>
                </>
              )}

              {/* Current Images */}
              {existingFiles.length > 0 && (
                <div className={styles.formGroup}>
                  <label>Current Images (Click × to mark for removal)</label>
                  <div className={styles.existingImagesGrid}>
                    {existingFiles.map((f) => {
                      const isMarked = removedFileIds.includes(f.n_file_id);
                      return (
                        <div
                          key={f.n_file_id}
                          className={`${styles.existingImgItem} ${
                            isMarked ? styles.existingImgItemMarkedRemove : ''
                          }`}
                        >
                          <img
                            src={`${baseUrl}${f.s_file_path}`}
                            alt="Current attachment"
                            onClick={() => onOpenLightbox(`${baseUrl}${f.s_file_path}`)}
                          />
                          <button
                            type="button"
                            className={styles.removeExisting}
                            onClick={() => toggleRemoveExisting(f.n_file_id)}
                            title={isMarked ? 'Undo Remove' : 'Remove Image'}
                          >
                            ×
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Add New Images */}
              <div className={styles.formGroup}>
                <label>
                  Add More Images <span className={styles.optional}>(Optional)</span>
                </label>
                <div className={styles.uploadZone}>
                  <label className={styles.uploadBtn}>
                    + Upload Images
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleNewFilesChange}
                    />
                  </label>
                  <span className={styles.uploadHint}>JPG, PNG, GIF, WebP</span>
                </div>

                {newFiles.length > 0 && (
                  <div className={styles.imagePreviewGrid}>
                    {newFiles.map((item, idx) => (
                      <div key={idx} className={styles.previewItem}>
                        <img src={item.previewUrl} alt="Preview" />
                        <button
                          type="button"
                          className={styles.previewRemove}
                          onClick={() => removeNewFile(idx)}
                          title="Remove"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Company & Country */}
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>
                    Company Name <span className={styles.required}>*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.company_name}
                    onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                    required
                    placeholder="Enter company name"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>
                    Country <span className={styles.required}>*</span>
                  </label>
                  <div className={styles.selectWrapper}>
                    <select
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      required
                    >
                      <option value="" disabled>
                        Select country
                      </option>
                      {COUNTRY_OPTIONS.map((c) => (
                        <option key={c.value} value={c.value}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                    <span className={styles.selectArrow}>⌄</span>
                  </div>
                </div>
              </div>

              {/* Location & Links */}
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>
                    Location <span className={styles.required}>*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    required
                    placeholder="Enter location"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Links</label>
                  <input
                    type="url"
                    value={formData.links}
                    onChange={(e) => setFormData({ ...formData, links: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
              </div>

              {/* Commercial Fields */}
              {isCommercial && (
                <div className={styles.commercialFieldsBox}>
                  <div className={styles.commercialSectionLabel}>
                    <span className={styles.commercialSectionIcon}>🏭</span>
                    Commercialised Innovation Details
                  </div>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>Specification (Key In)</label>
                      <input
                        type="text"
                        value={formData.specification}
                        onChange={(e) =>
                          setFormData({ ...formData, specification: e.target.value })
                        }
                        placeholder="Enter specification"
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Production Unit / Location</label>
                      <input
                        type="text"
                        value={formData.production_unit}
                        onChange={(e) =>
                          setFormData({ ...formData, production_unit: e.target.value })
                        }
                        placeholder="Enter production unit"
                      />
                    </div>
                  </div>
                  <div className={styles.formGroup} style={{ maxWidth: '260px' }}>
                    <label>Price per 1000 (USD)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.price_per_thousand}
                      onChange={(e) =>
                        setFormData({ ...formData, price_per_thousand: e.target.value })
                      }
                      placeholder="0.00"
                    />
                  </div>
                </div>
              )}

              {/* Contacts Section */}
              <div className={styles.formDivider}>
                <span>Contact Information</span>
              </div>

              <div className={styles.contactList}>
                {contacts.map((c, i) => {
                  if (c._removed) return null;
                  const activeContacts = contacts.filter((x) => !x._removed);
                  const visIdx = activeContacts.indexOf(c) + 1;

                  return (
                    <div key={c.n_cont_id || i} className={styles.contactCard}>
                      <div className={styles.contactCardHeader}>
                        <span className={styles.contactCardLabel}>Contact {visIdx}</span>
                        {activeContacts.length > 1 && (
                          <button
                            type="button"
                            className={styles.contactRemoveBtn}
                            onClick={() => handleRemoveContact(i)}
                            title="Remove Contact"
                          >
                            ×
                          </button>
                        )}
                      </div>

                      <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                          <label>
                            Name <span className={styles.required}>*</span>
                          </label>
                          <input
                            type="text"
                            value={c.s_contact_name}
                            onChange={(e) =>
                              handleUpdateContact(i, 's_contact_name', e.target.value)
                            }
                            placeholder="Full name"
                            required
                          />
                        </div>

                        <div className={styles.formGroup}>
                          <label>Phone</label>
                          <input
                            type="tel"
                            value={c.s_phone || ''}
                            onChange={(e) =>
                              handleUpdateContact(i, 's_phone', e.target.value)
                            }
                            placeholder="Phone number"
                          />
                        </div>
                      </div>

                      <div className={styles.formGroup}>
                        <label>
                          Email <span className={styles.required}>*</span>
                        </label>
                        <input
                          type="email"
                          value={c.s_email}
                          onChange={(e) =>
                            handleUpdateContact(i, 's_email', e.target.value)
                          }
                          placeholder="contact@company.com"
                          required
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                type="button"
                className={styles.addContactBtn}
                onClick={handleAddContact}
              >
                <span>+</span> Add Another Contact
              </button>
            </form>
          )}
        </div>

        {/* Modal Footer */}
        <div className={styles.editModalFooter}>
          <button className={styles.btnCancel} onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button
            className={styles.btnSave}
            onClick={handleSubmit}
            disabled={saving || loading}
          >
            {saving ? (
              <>
                <div className={styles.btnLoaderSm}></div>
                <span>Saving...</span>
              </>
            ) : (
              <span>Save Changes</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
