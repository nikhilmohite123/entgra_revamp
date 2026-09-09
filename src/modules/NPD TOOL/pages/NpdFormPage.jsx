import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, PlusCircle, Edit3 } from 'lucide-react';
import NpdHeader from '../components/NpdHeader';
import NpdForm from '../components/NpdForm';
import { npdToast } from '../components/NpdToast';
import NpdConfirmModal from '../components/NpdConfirmModal';
import { BASE_URL } from '../constants/npdConstants';
import styles from '../styles/npdTrack.module.css';

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

export default function NpdFormPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('id') || searchParams.get('projectId') || '';

  const [formData, setFormData] = useState(initialFormState);
  const [isEditMode, setIsEditMode] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [contactList, setContactList] = useState([]);
  const [loading, setLoading] = useState(false);

  // File upload modal state
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadFiles, setUploadFiles] = useState(null);
  const [deleteModalState, setDeleteModalState] = useState({ isOpen: false, fileId: null, newName: '' });
  const [deletingFile, setDeletingFile] = useState(false);

  const baseUrl = BASE_URL;

  // Fetch contact list for datalist suggestions
  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const response = await fetch(`${baseUrl}/npd/get_contact_per`);
        const result = await response.json();
        if (result && Array.isArray(result.data)) {
          setContactList(result.data);
        }
      } catch (err) {
        console.error('Error fetching contacts in NpdFormPage:', err);
      }
    };
    fetchContacts();
  }, []);

  // Fetch existing project data if projectId is provided (Edit Mode)
  useEffect(() => {
    if (!projectId) {
      setFormData(initialFormState);
      setIsEditMode(false);
      setAttachments([]);
      return;
    }

    const fetchProjectDetails = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${baseUrl}/npd/get_npdby_id`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: projectId }),
        });
        const result = await response.json();

        if (result && result.data && result.data.length > 0) {
          const item = result.data[0];
          setFormData({
            n_npdtracking_id: item.n_npdtracking_id || '',
            s_project_no: item.s_project_no || '',
            s_region: item.s_region || '',
            s_country: item.s_country || '',
            s_project_name: item.s_project_name || '',
            s_business_back: item.s_business_back || '',
            s_component: item.s_component || '',
            s_weight: item.s_weight || '',
            s_owner: item.s_owner || '',
            s_business_contact: item.s_business_contact || '',
            s_tube_spec: item.s_tube_spec || '',
            s_segment: item.s_segment || '',
            s_targated_customer: item.s_targated_customer || '',
            s_value: item.s_value || '',
            s_status: item.s_status || '',
            s_tool_inv_detail: item.s_tool_inv_detail || '',
            s_expected_com: item.s_expected_com || '',
            s_capex_no: item.s_capex_no || '',
            s_value_propotion: item.s_value_propotion || '',
            s_capex_app_amount: item.s_capex_app_amount || '',
            s_capex_util_amount: item.s_capex_util_amount || '',
            s_cap_dia: item.s_cap_dia || '',
            s_tube_dia: item.s_tube_dia || '',
            s_sleeve_lenght: item.s_sleeve_lenght || '',
            s_shoulder_weight: item.s_shoulder_weight || '',
            s_cap_weight: item.s_cap_weight || '',
            s_sleeve_laminate: item.s_sleeve_laminate || '',
            s_sleeve_thickness: item.s_sleeve_thickness || '',
            s_project_alive_status: item.s_project_alive_status || 'ALIVE',
            bindemail_technical_con: item.bindemail_technical_con || '',
            bindemail_business_con: item.bindemail_business_con || '',
          });

          // Parse existing attachments
          if (item.og_file_names && item.new_file_names && item.file_paths) {
            const fIds = (item.file_id || '').split(',');
            const ogs = item.og_file_names.split(',');
            const news = item.new_file_names.split(',');
            const paths = item.file_paths.split(',');
            const atts = ogs.map((og, idx) => ({
              fileId: fIds[idx]?.trim() || '',
              ogName: og.trim(),
              newName: news[idx]?.trim() || '',
              path: paths[idx]?.trim() || '',
            }));
            setAttachments(atts);
          } else {
            setAttachments([]);
          }

          setIsEditMode(true);
        }
      } catch (err) {
        console.error('Error fetching project by ID in NpdFormPage:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProjectDetails();
  }, [projectId]);

  // Handle Form Submission (Create or Update)
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

      npdToast.success(isEditMode ? 'NPD Project updated successfully!' : 'NPD Project saved successfully!');
      navigate('/npd_tool/npdtrack');
    } catch (err) {
      console.error('Error submitting NPD form:', err);
      npdToast.error('Error saving project data.');
    }
  };

  // Handle Cancel -> Go back to NPD track page
  const handleCancel = () => {
    navigate('/npd_tool/npdtrack');
  };

  // Handle File Upload
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
        // Refresh project attachments
        const res = await fetch(`${baseUrl}/npd/get_npdby_id`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: formData.n_npdtracking_id }),
        });
        const resData = await res.json();
        if (resData && resData.data && resData.data.length > 0) {
          const item = resData.data[0];
          if (item.og_file_names && item.new_file_names && item.file_paths) {
            const fIds = (item.file_id || '').split(',');
            const ogs = item.og_file_names.split(',');
            const news = item.new_file_names.split(',');
            const paths = item.file_paths.split(',');
            const atts = ogs.map((og, idx) => ({
              fileId: fIds[idx]?.trim() || '',
              ogName: og.trim(),
              newName: news[idx]?.trim() || '',
              path: paths[idx]?.trim() || '',
            }));
            setAttachments(atts);
          }
        }
      } else {
        npdToast.error('Error uploading file. Please try again.');
      }
    } catch (err) {
      console.error('Error uploading file:', err);
      npdToast.error('Error uploading file.');
    }
  };

  // Handle File Delete
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
        setAttachments((prev) => prev.filter((item) => item.fileId !== fileId));
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
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', paddingBottom: '50px' }}>
      {/* NPD Common Header */}
      <NpdHeader />

      {/* Main Container */}
      <div className={styles.mainContainer} id="mainContainer" style={{ marginTop: '30px' }}>
        {/* Navigation Bar / Page Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '20px',
            paddingBottom: '14px',
            borderBottom: '1px solid #e2e8f0',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              type="button"
              className={styles.btnAdd}
              onClick={handleCancel}
              style={{
                background: '#f1f5f9',
                color: '#003c96',
                border: '1px solid #cbd5e1',
                padding: '7px 16px',
                borderRadius: '8px',
                fontSize: '13.5px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer',
              }}
            >
              <ArrowLeft size={16} />
              <span>Back to NPD Programs</span>
            </button>
            <h3
              style={{
                margin: 0,
                fontSize: '1.25rem',
                fontWeight: 700,
                color: '#001e55',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              {isEditMode ? (
                <>
                  <Edit3 size={20} color="#003c96" />
                  Edit NPD Program
                </>
              ) : (
                <>
                  <PlusCircle size={20} color="#78aa28" />
                  Add New NPD Program
                </>
              )}
            </h3>
          </div>

          {formData.s_project_no && (
            <div
              style={{
                background: '#e6edf8',
                color: '#003c96',
                padding: '4px 14px',
                borderRadius: '20px',
                fontWeight: 600,
                fontSize: '13px',
              }}
            >
              Project No: <strong>{formData.s_project_no}</strong>
            </div>
          )}
        </div>

        {/* Loading Spinner for Edit fetch */}
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading project details...</span>
            </div>
            <p className="mt-2 text-muted fw-bold">Loading Project Details...</p>
          </div>
        ) : (
          /* NPD Form Component */
          <NpdForm
            formData={formData}
            setFormData={setFormData}
            isEditMode={isEditMode}
            onSubmit={handleFormSubmit}
            onCancel={handleCancel}
            contactList={contactList}
            onUploadFileClick={() => setUploadModalOpen(true)}
            attachments={attachments}
            onDeleteFile={handleDeleteFile}
          />
        )}
      </div>

      {/* File Upload Modal Dialog */}
      {uploadModalOpen && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1060 }}
          role="dialog"
        >
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
