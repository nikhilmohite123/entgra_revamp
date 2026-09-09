import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styles from '../styles/npdTrack.module.css';
import NpdHeader from '../components/NpdHeader';
import NpdTable from '../components/NpdTable';
import NpdForm from '../components/NpdForm';
import { npdToast } from '../components/NpdToast';
import NpdConfirmModal from '../components/NpdConfirmModal';
import { BASE_URL } from '../constants/npdConstants';

const initialFormState = {
  n_npdtracking_id: '',
  s_project_no: '',
  s_region: '',
  s_country: '',
  s_project_name: '',
  s_business_back: '',
  s_component: '',
  s_weight: '',
  s_owner: '',
  s_business_contact: '',
  s_tube_spec: '',
  s_segment: '',
  s_targated_customer: '',
  s_value: '',
  s_status: '',
  s_tool_inv_detail: '',
  s_expected_com: '',
  s_capex_no: '',
  s_value_propotion: '',
  s_capex_app_amount: '',
  s_capex_util_amount: '',
  s_cap_dia: '',
  s_tube_dia: '',
  s_sleeve_lenght: '',
  s_shoulder_weight: '',
  s_cap_weight: '',
  s_sleeve_laminate: '',
  s_sleeve_thickness: '',
  s_project_alive_status: 'ALIVE',
  bindemail_technical_con: '',
  bindemail_business_con: '',
};

export default function NpdTrackPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const forIdeaHub = queryParams.get('from') === 'ideahub';

  const [viewMode, setViewMode] = useState('table'); // 'table' | 'form'
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter state
  const [selectedRegion, setSelectedRegion] = useState(() => localStorage.getItem('selectedRegion') || 'ALL');
  const [selectedFY, setSelectedFY] = useState(() => localStorage.getItem('selectedFYYear') || 'ALL');

  // Authorization state
  const [userCountry, setUserCountry] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [canExport, setCanExport] = useState(false);
  const [contactList, setContactList] = useState([]);

  // Form state
  const [formData, setFormData] = useState(initialFormState);
  const [isEditMode, setIsEditMode] = useState(false);
  const [attachments, setAttachments] = useState([]);

  // Modals state
  const [imageZoomUrl, setImageZoomUrl] = useState(null);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadFiles, setUploadFiles] = useState(null);
  const [deleteModalState, setDeleteModalState] = useState({ isOpen: false, fileId: null, newName: '' });
  const [deletingFile, setDeletingFile] = useState(false);
  const baseUrl = BASE_URL;

  // Fetch initial permissions & user country
  useEffect(() => {
    const uid = localStorage.getItem('uid') || 'admin@eplglobal.com';
    const fetchUserCountry = async () => {
      try {
        const response = await fetch(`${baseUrl}/npd/get_country_from_master`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ u_id: uid }),
        });
        const result = await response.json();
        if (result && result.data && result.data.length > 0) {
          setUserCountry(result.data[0].s_country || '');
          setIsAdmin(result.data[0].is_admin === 1);
        }
      } catch (err) {
        console.error('Error fetching user country:', err);
      }
    };
    fetchUserCountry();
  }, []);

  // Fetch contact list for datalist
  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const response = await fetch(`${baseUrl}/npd/get_contact_per`);
        const result = await response.json();
        if (result && Array.isArray(result.data)) {
          setContactList(result.data);
        }
      } catch (err) {
        console.error('Error fetching contacts:', err);
      }
    };
    fetchContacts();
  }, []);

  // Fetch Excel export authorization
  useEffect(() => {
    const checkExportAuth = async () => {
      const uid = localStorage.getItem('uid');
      try {
        const reg = selectedRegion === 'ALL' ? '' : selectedRegion;
        const response = await fetch(`${baseUrl}/npd/check_exceldownload_autho?s_region=${reg}`);
        const result = await response.json();
        if (result && Array.isArray(result.data)) {
          const isAuthorized = result.data.some((item) => item.s_emp_id === uid);
          setCanExport(isAuthorized || isAdmin);
        }
      } catch (err) {
        console.error('Error checking export auth:', err);
      }
    };
    checkExportAuth();
  }, [selectedRegion, isAdmin]);

  // Fetch NPD Projects list
  const fetchNpdData = async (region = selectedRegion, fyRange = selectedFY) => {
    setLoading(true);
    try {
      const response = await fetch(`${baseUrl}/npd/get_npd_data`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ region, fyRange }),
      });
      const result = await response.json();

      if (result && Array.isArray(result.data)) {
        // Deduplicate rows by n_npdtracking_id
        const uniqueData = [];
        const idSet = {};
        result.data.forEach((item) => {
          if (!idSet[item.n_npdtracking_id]) {
            idSet[item.n_npdtracking_id] = true;
            uniqueData.push(item);
          }
        });
        setProjects(uniqueData);
      }
    } catch (err) {
      console.error('Error fetching NPD data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    localStorage.setItem('selectedRegion', selectedRegion);
    localStorage.setItem('selectedFYYear', selectedFY);
    fetchNpdData(selectedRegion, selectedFY);
  }, [selectedRegion, selectedFY]);

  // Handle Add New Program click -> navigate to dedicated NPD form route
  const handleAddNewClick = () => {
    navigate('/npd_tool/add_npd_program');
  };

  // Handle Edit Project click -> navigate to dedicated NPD form route with project ID
  const handleEditProject = (id) => {
    navigate(`/npd_tool/add_npd_program?id=${id}`);
  };

  // Submit form data to create/update project
  const handleFormSubmit = async (dataToSubmit) => {
    const url = isEditMode ? `${baseUrl}/npd/update_npd_data` : `${baseUrl}/npd/save_npd_data`;
    const payload = {
      ...dataToSubmit,
      s_action_taker: localStorage.getItem('uid') || '',
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await response.json();

      if (result.message === 'Project number already exists.') {
        npdToast.warning('Project number already exists.');
        return;
      }

      npdToast.success('Data saved successfully!');
      fetchNpdData();
      setViewMode('table');
    } catch (err) {
      console.error('Error submitting form:', err);
      npdToast.error('Error saving project data.');
    }
  };

  // File Upload submit handler
  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!uploadFiles || !formData.n_npdtracking_id) return;
    const bodyFormData = new FormData();
    bodyFormData.append('n_npdtracking_id1', formData.n_npdtracking_id);
    for (let i = 0; i < uploadFiles.length; i++) {
      bodyFormData.append('s_attachment', uploadFiles[i]);
    }

    try {
      const response = await fetch(`${baseUrl}/uploadNpd_data`, {
        method: 'POST',
        body: bodyFormData,
      });
      if (response.ok) {
        npdToast.success('File uploaded successfully!');
        setUploadModalOpen(false);
        handleEditProject(formData.n_npdtracking_id);
      } else {
        npdToast.error('Error uploading file. Please try again.');
      }
    } catch (err) {
      console.error('Error uploading file:', err);
      npdToast.error('Error uploading file.');
    }
  };

  // Delete File attachment handler
  const handleDeleteFile = (fileId, newName) => {
    setDeleteModalState({ isOpen: true, fileId, newName });
  };

  const confirmDeleteFile = async () => {
    const { fileId, newName } = deleteModalState;
    if (!fileId) return;
    setDeletingFile(true);
    try {
      const response = await fetch(`${baseUrl}/npd/delete_file`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: formData.n_npdtracking_id,
          file_id: fileId,
          newNames: newName,
        }),
      });
      if (response.ok) {
        npdToast.success('File deleted successfully!');
        handleEditProject(formData.n_npdtracking_id);
        setDeleteModalState({ isOpen: false, fileId: null, newName: '' });
      } else {
        npdToast.error('Error deleting file. Please try again.');
      }
    } catch (err) {
      console.error('Error deleting file:', err);
      npdToast.error('Error deleting file.');
    } finally {
      setDeletingFile(false);
    }
  };

  return (
    <div>
      {/* NPD Header */}
      <NpdHeader />

      {/* Main Container */}
      <div className={styles.mainContainer} id="mainContainer">
        {/* Add New NPD Program button */}
        {!forIdeaHub && viewMode === 'table' && (
          <div className={styles.addBtnWrapper} id="addbtn">
            <button className={styles.btnAdd} onClick={handleAddNewClick}>
              Add New NPD Program <i className="bi bi-plus-circle-dotted"></i>
            </button>
          </div>
        )}

        {/* View Switch: Table view vs Form view */}
        {viewMode === 'form' ? (
          <NpdForm
            formData={formData}
            setFormData={setFormData}
            isEditMode={isEditMode}
            onSubmit={handleFormSubmit}
            onCancel={() => setViewMode('table')}
            contactList={contactList}
            onUploadFileClick={() => setUploadModalOpen(true)}
            attachments={attachments}
            onDeleteFile={handleDeleteFile}
          />
        ) : (
          <NpdTable
            projects={projects}
            userCountry={userCountry}
            isAdmin={isAdmin}
            canExport={canExport}
            selectedRegion={selectedRegion}
            setSelectedRegion={setSelectedRegion}
            selectedFY={selectedFY}
            setSelectedFY={setSelectedFY}
            onEditProject={handleEditProject}
            onImageClick={(url) => setImageZoomUrl(url)}
            forIdeaHub={forIdeaHub}
          />
        )}
      </div>

      {/* Full Image Zoom Modal */}
      {imageZoomUrl && (
        <div className={styles.imageModalOverlay} onClick={() => setImageZoomUrl(null)}>
          <img src={imageZoomUrl} alt="Zoomed View" className={styles.zoomedImage} />
        </div>
      )}

      {/* File Upload Modal Dialog */}
      {uploadModalOpen && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} role="dialog">
          <div className="modal-dialog">
            <form onSubmit={handleFileUpload} encType="multipart/form-data">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Attach File</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setUploadModalOpen(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  <input
                    type="file"
                    className="form-control"
                    multiple
                    onChange={(e) => setUploadFiles(e.target.files)}
                  />
                </div>
                <div className="modal-footer">
                  <button type="submit" className="btn btn-primary btn-sm">
                    Submit
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => setUploadModalOpen(false)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Attachment Confirmation Modal */}
      <NpdConfirmModal
        isOpen={deleteModalState.isOpen}
        title="Delete Attachment"
        message="Are you sure you want to delete this attachment? This action cannot be undone."
        confirmText="Delete"
        variant="danger"
        loading={deletingFile}
        onConfirm={confirmDeleteFile}
        onCancel={() => setDeleteModalState({ isOpen: false, fileId: null, newName: '' })}
      />
    </div>
  );
}
