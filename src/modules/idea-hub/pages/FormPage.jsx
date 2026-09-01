import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import styles from '../styles/ideaHub.module.css';
import SvgSprite from '../components/SvgSprite';
import IdeaHubHeader from '../components/IdeaHubHeader';
import IdeaHubFooter from '../components/IdeaHubFooter';
import {
  MODULE_LABELS,
  CATEGORY_LABELS,
  COUNTRY_OPTIONS
} from '../constants/ideaHubConstants';

export default function FormPage() {
  const { moduleType } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Resolve module type from param or query param
  const moduleParam = (moduleType || searchParams.get('module') || 'material').toLowerCase();
  const module = MODULE_LABELS[moduleParam] ? moduleParam : 'material';
  const config = MODULE_LABELS[module];

  // State
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isCommercial, setIsCommercial] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [validationPopup, setValidationPopup] = useState(null); // { title, message }

  // Form Fields
  const [teamMember, setTeamMember] = useState('');
  const [feature, setFeature] = useState('');
  const [benefit, setBenefit] = useState('');
  const [application, setApplication] = useState('');
  const [innovationDetails, setInnovationDetails] = useState('');
  const [comments, setComments] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [country, setCountry] = useState('');
  const [location, setLocation] = useState('');
  const [specification, setSpecification] = useState('');
  const [productionUnit, setProductionUnit] = useState('');
  const [pricePerThousand, setPricePerThousand] = useState('');
  const [links, setLinks] = useState('');

  // Uploaded Files
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);

  // Contacts
  const [contacts, setContacts] = useState([
    { s_contact_name: '', s_phone: '', s_email: '' }
  ]);

  const baseUrl=`http://192.168.1.3:9003`;

  // Restore category & check commercial mode
  useEffect(() => {
    try {
      const cat = JSON.parse(sessionStorage.getItem('selectedCategory') || 'null');
      if (cat) {
        setSelectedCategory(cat.num);
        setIsCommercial(cat.num === 1 || (cat.short || '').toLowerCase().includes('commercialised'));
      }
    } catch {
      // ignore
    }
  }, []);

  // Pre-fill user profile
  useEffect(() => {
    const uid = localStorage.getItem('uid') || '';
    const storedEmpName = localStorage.getItem('empName') || '';

    const initialName = (storedEmpName || uid || 'User')
      .replace(/[.]+/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());

    setTeamMember(initialName);

    if (uid) {
      fetch(`${baseUrl}/api/innovations/userdetail`, {
        headers: { 'x-uid': uid }
      })
        .then((res) => res.json())
        .then((res) => {
          if (res && res.success && res.data && res.data.s_emp_name) {
            setTeamMember(res.data.s_emp_name);
          }
        })
        .catch(() => {
          // keep fallback
        });
    }
  }, []);

  // File Upload Handlers
  const handleAddFiles = (files) => {
    const newItems = [];
    Array.from(files).forEach((file) => {
      if (file.type.startsWith('image/')) {
        if (!uploadedFiles.some((f) => f.name === file.name && f.size === file.size)) {
          newItems.push({
            file,
            name: file.name,
            size: file.size,
            previewUrl: URL.createObjectURL(file)
          });
        }
      }
    });
    setUploadedFiles((prev) => [...prev, ...newItems]);
  };

  const handleRemoveFile = (index) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Contacts Handlers
  const handleAddContact = () => {
    setContacts((prev) => [...prev, { s_contact_name: '', s_phone: '', s_email: '' }]);
  };

  const handleRemoveContact = (index) => {
    if (contacts.length <= 1) return;
    setContacts((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdateContact = (index, field, value) => {
    setContacts((prev) =>
      prev.map((c, i) => (i === index ? { ...c, [field]: value } : c))
    );
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    // Field validations
    if (!companyName.trim() || !country || !location.trim()) {
      setErrorMsg('Please fill in all mandatory fields.');
      return;
    }

    if (module === 'others') {
      if (!innovationDetails.trim()) {
        setErrorMsg('Innovation Details are required.');
        return;
      }
    } else {
      if (!feature.trim() || !benefit.trim() || !application.trim()) {
        setErrorMsg('Feature, Benefit, and Application are required.');
        return;
      }
    }

    if (isCommercial) {
      if (!specification.trim() || !productionUnit.trim() || pricePerThousand === '') {
        setErrorMsg('Please fill in all commercial details.');
        return;
      }
    }

    // Contacts validation
    if (!contacts.length) {
      setErrorMsg('Please add at least one contact.');
      return;
    }

    for (let c of contacts) {
      if (!c.s_contact_name.trim()) {
        setErrorMsg('Please enter a name for all contacts.');
        return;
      }
      if (!c.s_email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.s_email.trim())) {
        setErrorMsg('Please enter a valid email address for all contacts.');
        return;
      }
    }

    setLoading(true);

    try {
      const fd = new FormData();
      const uid = localStorage.getItem('uid') || 'anonymous';

      fd.append('s_module_type', module);
      fd.append('s_team_member', teamMember);
      fd.append('s_company_name', companyName.trim());
      fd.append('s_country', country);
      fd.append('s_location', location.trim());
      fd.append('s_links', links.trim());
      fd.append('s_created_by', uid);

      if (module === 'others') {
        fd.append('s_innovation_details', innovationDetails.trim());
        fd.append('s_comments', comments.trim());
      } else {
        fd.append('t_feature', feature.trim());
        fd.append('t_benifit', benefit.trim());
        fd.append('t_application', application.trim());
        if (comments.trim()) {
          fd.append('s_comments', comments.trim());
        }
      }

      if (isCommercial) {
        fd.append('s_specification', specification.trim());
        fd.append('s_production_unit', productionUnit.trim());
        fd.append('n_price_per_1000', pricePerThousand);
      }

      let mainModule = '';
      try {
        const savedCat = JSON.parse(sessionStorage.getItem('selectedCategory') || 'null');
        mainModule = savedCat ? savedCat.short : '';
      } catch {
        // ignore
      }
      fd.append('s_main_module', mainModule);

      fd.append(
        'contacts',
        JSON.stringify(
          contacts.map((c) => ({
            s_contact_name: c.s_contact_name.trim(),
            s_phone: (c.s_phone || '').trim(),
            s_email: c.s_email.trim()
          }))
        )
      );

      uploadedFiles.forEach((item) => {
        fd.append('images', item.file, item.name);
      });

      const res = await fetch(`${baseUrl}/api/innovations`, {
        method: 'POST',
        body: fd
      });
      const data = await res.json();

      setLoading(false);

      if (data && data.success) {
        setIsSubmitted(true);
      } else {
        setErrorMsg(data?.message || 'Submission failed. Please try again.');
      }
    } catch {
      setLoading(false);
      setErrorMsg('Server error. Please try again later.');
    }
  };

  const isOthers = module === 'others';

  return (
    <div className={styles.ideaHubContainer}>
      <SvgSprite />

      {/* Header with Back Button */}
      <IdeaHubHeader
        currentModule={module}
        selectedCategory={selectedCategory}
        showBack={true}
        onBack={() => navigate(`/idea_hub/table/${module}`)}
      />

      {/* Main Form Page Container */}
      <main className={styles.formMain}>
        <div className={styles.formContainer}>
          {/* Header */}
          <div className={styles.formHeader}>
            <div className={styles.moduleBadge}>{config.label}</div>
            <h1>{config.title}</h1>
            <p className={styles.formSubtitle}>{config.subtitle}</p>
          </div>

          {/* If Submitted Successfully */}
          {isSubmitted ? (
            <div className={styles.successMessage}>
              <div className={styles.successIcon}>✓</div>
              <h2>Innovation Submitted!</h2>
              <p>Thank you for sharing your idea. Our team will review your submission.</p>
              <button
                className={styles.backHomeBtn}
                onClick={() => navigate(`/idea_hub/table/${module}`)}
              >
                Back to Table
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className={styles.formBody}>
              {errorMsg && <div className={styles.errorBanner}>{errorMsg}</div>}

              {/* Team Member (prefilled) */}
              <div className={styles.formGroup}>
                <label>
                  Team Member <span className={styles.required}>*</span>
                </label>
                <input
                  type="text"
                  value={teamMember}
                  disabled
                  placeholder="Enter team member name(s)"
                  required
                />
              </div>

              {/* Feature / Benefit / Application OR Details / Comments */}
              {!isOthers ? (
                <>
                  <div className={styles.formGroup}>
                    <label>
                      Feature <span className={styles.required}>*</span>
                    </label>
                    <textarea
                      rows={3}
                      value={feature}
                      onChange={(e) => setFeature(e.target.value)}
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
                      value={benefit}
                      onChange={(e) => setBenefit(e.target.value)}
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
                      value={application}
                      onChange={(e) => setApplication(e.target.value)}
                      placeholder="Enter Application"
                      required
                    />
                  </div>
                </>
              ) : (
                <div className={styles.formGroup}>
                  <label>
                    Innovation Details <span className={styles.required}>*</span>
                  </label>
                  <textarea
                    rows={5}
                    value={innovationDetails}
                    onChange={(e) => setInnovationDetails(e.target.value)}
                    placeholder="Describe your innovation in detail..."
                    required
                  />
                </div>
              )}

              {/* Image Upload Zone */}
              <div className={styles.formGroup}>
                <label>
                  Images <span className={styles.optional}>(Optional)</span>
                </label>
                <div
                  className={`${styles.uploadZone} ${
                    isDragging ? styles.uploadZoneDragging : ''
                  }`}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    handleAddFiles(e.dataTransfer.files);
                  }}
                >
                  <div className={styles.uploadIcon}>
                    <svg viewBox="0 0 48 48" fill="none">
                      <path
                        d="M24 8L24 32M14 18L24 8L34 18"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M8 36L8 40L40 40L40 36"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                  <p className={styles.uploadText}>Drag &amp; drop images here</p>
                  <p className={styles.uploadSub}>or</p>
                  <div className={styles.uploadActions}>
                    {/* Upload From Device */}
                    <label className={styles.uploadBtn}>
                      Upload From Device
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={(e) => {
                          handleAddFiles(e.target.files);
                          e.target.value = '';
                        }}
                      />
                    </label>

                    {/* Take Photo */}
                    <label className={`${styles.uploadBtn} ${styles.cameraBtn}`}>
                      Take Photo
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        style={{ display: 'none' }}
                        onChange={(e) => {
                          handleAddFiles(e.target.files);
                          e.target.value = '';
                        }}
                      />
                    </label>
                  </div>
                  <p className={styles.uploadHint}>
                    JPG, PNG, GIF, WebP · Multiple files allowed
                  </p>
                </div>

                {/* Previews */}
                {uploadedFiles.length > 0 && (
                  <div className={styles.imagePreviewGrid}>
                    {uploadedFiles.map((item, idx) => (
                      <div key={idx} className={styles.previewItem}>
                        <img src={item.previewUrl} alt={item.name} />
                        <button
                          type="button"
                          className={styles.previewRemove}
                          onClick={() => handleRemoveFile(idx)}
                          title="Remove image"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Comments */}
              <div className={styles.formGroup}>
                <label>Comments</label>
                <textarea
                  rows={3}
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder="Additional comments or context..."
                />
              </div>

              {/* Company + Country */}
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>
                    Customer Name <span className={styles.required}>*</span>
                  </label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Enter company name"
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>
                    Country <span className={styles.required}>*</span>
                  </label>
                  <div className={styles.selectWrapper}>
                    <select
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
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

              {/* Location */}
              <div className={styles.formGroup}>
                <label>
                  Location <span className={styles.required}>*</span>
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Enter location"
                  required
                />
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
                      <label>
                        Specification (Key In) <span className={styles.required}>*</span>
                      </label>
                      <input
                        type="text"
                        value={specification}
                        onChange={(e) => setSpecification(e.target.value)}
                        placeholder="Enter specification"
                        required
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>
                        Production Unit / Location <span className={styles.required}>*</span>
                      </label>
                      <input
                        type="text"
                        value={productionUnit}
                        onChange={(e) => setProductionUnit(e.target.value)}
                        placeholder="Enter production unit or location"
                        required
                      />
                    </div>
                  </div>
                  <div className={styles.formGroup} style={{ maxWidth: '260px' }}>
                    <label>
                      Price per 1000 (USD) <span className={styles.required}>*</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={pricePerThousand}
                      onChange={(e) => setPricePerThousand(e.target.value)}
                      placeholder="0.00"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Links */}
              <div className={styles.formGroup}>
                <label>Links</label>
                <input
                  type="url"
                  value={links}
                  onChange={(e) => setLinks(e.target.value)}
                  placeholder="https://reference-link.com"
                />
              </div>

              {/* Contacts Section */}
              <div className={styles.formDivider}>
                <span>Contact Information</span>
              </div>

              <div className={styles.contactList}>
                {contacts.map((c, i) => (
                  <div key={i} className={styles.contactCard}>
                    <div className={styles.contactCardHeader}>
                      <span className={styles.contactCardLabel}>Contact {i + 1}</span>
                      {contacts.length > 1 && (
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
                          value={c.s_phone}
                          onChange={(e) =>
                            handleUpdateContact(i, 's_phone', e.target.value)
                          }
                          placeholder="9876543210"
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
                ))}
              </div>

              <button
                type="button"
                className={styles.addContactBtn}
                onClick={handleAddContact}
              >
                <span>+</span> Add Another Contact
              </button>

              {/* Submit Button */}
              <div className={styles.formActions}>
                <button
                  type="submit"
                  className={styles.submitBtn}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className={styles.btnLoader}></div>
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <span>Submit Innovation</span>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </main>

      {/* Validation Popup Modal */}
      {validationPopup && (
        <div className={styles.validationPopupOverlay}>
          <div className={styles.validationPopup}>
            <div className={styles.validationPopupIcon}>⚠️</div>
            <h3 className={styles.validationPopupTitle}>{validationPopup.title}</h3>
            <p className={styles.validationPopupMsg}>{validationPopup.message}</p>
            <button
              className={styles.validationPopupBtn}
              onClick={() => setValidationPopup(null)}
            >
              OK, Fix It
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <IdeaHubFooter />
    </div>
  );
}
