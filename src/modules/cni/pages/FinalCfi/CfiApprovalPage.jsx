import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCfi } from '../../hooks/useCfi';
import { CniLoader } from '../../components/common';
import styles from '../../styles/cni.module.css';

export function CfiApprovalPage({ isApprovedView = false, isViewOnly = false }) {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const { item, isLoading, approveCfi, isSubmitting } = useCfi(projectId);

  const tempFiles = [];
  const uploadFile = async (file) => {};
  const removeFile = async (id) => {};

  const handleApprove = async () => {
    if (isApprovedView || isViewOnly) return;
    try {
      await approveCfi();
      navigate('/cni/dashboard');
    } catch (err) {
      alert("Failed to approve CFI: " + err.message);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) return <CniLoader />;

  const disabled = isApprovedView || isViewOnly;

  return (
    <div className={`container ${styles.pageContainer}`}>
      <div className="panel panel-default">
        <div className="panel-body">
          <h4><span className="label label-primary">Commercial Feasibility Index Form</span></h4>
          
          <div className="row" style={{ marginTop: '20px' }}>
            <div className="col-sm-4">
              Project Name: <b>{item.s_project_name}</b>
            </div>
            <div className="col-sm-4">
              Project No: <b>{item.s_new_project_id}</b>
            </div>
          </div>
          
          <hr />

          <div className="table-responsive">
            <table className="table table-bordered">
              <tbody>
                <tr>
                  <td><b>Change Initiation Required To Improve / Implement</b></td>
                  <td>{item.s_improve}</td>
                </tr>
                <tr>
                  <td><b>Cost Reduction Project</b></td>
                  <td>{item.s_cost_red_pro}</td>
                </tr>
                <tr>
                  <td><b>Product Related</b></td>
                  <td>{item.s_pro_related}</td>
                </tr>
                <tr>
                  <td><b>Process Related</b></td>
                  <td>{item.s_process_related}</td>
                </tr>
                <tr>
                  <td><b>System Related</b></td>
                  <td>{item.s_sys_related}</td>
                </tr>
                <tr>
                  <td><b>Material Related</b></td>
                  <td>{item.s_mat_related}</td>
                </tr>
                <tr>
                  <td><b>Nature Of Change</b></td>
                  <td>{item.s_nature_of_change}</td>
                </tr>
                <tr>
                  <td><b>Proposed Solution By Initiator</b></td>
                  <td>{item.s_proposed_solution}</td>
                </tr>
                <tr>
                  <td><b>Target Segment</b></td>
                  <td>{item.s_target_segment}</td>
                </tr>
                <tr>
                  <td><b>Expected Start Date</b></td>
                  <td>{item.d_exp_date ? item.d_exp_date.split('T')[0] : ''}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="col-md-12">
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th>File Name</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {tempFiles.map((file, i) => (
                  <tr key={i}>
                    <td>{file.name}</td>
                    <td>
                      {!disabled && (
                        <button type="button" onClick={() => removeFile(file.id)}>Remove</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!disabled && (
              <div style={{ marginTop: '10px' }}>
                <input type="file" onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    uploadFile(e.target.files[0]);
                  }
                }} />
              </div>
            )}
          </div>

          <div className="col-md-12" style={{ marginTop: '20px' }}>
            <span className="pull-right">
              {!disabled && tempFiles.length > 0 && (
                <button 
                  type="button" 
                  className="btn btn-sm btn-success" 
                  disabled={isSubmitting}
                  onClick={handleApprove}
                >
                  {isSubmitting ? 'Approving...' : 'Approve CFI'}
                </button>
              )}
              <button 
                type="button" 
                className="btn btn-warning btn-sm" 
                onClick={handlePrint} 
                style={{ marginLeft: '10px' }}
              >
                Print
              </button>
              <button 
                type="button" 
                className="btn btn-default btn-sm" 
                onClick={() => navigate('/cni/dashboard')} 
                style={{ marginLeft: '10px' }}
              >
                Back
              </button>
            </span>
          </div>

        </div>
      </div>
    </div>
  );
}
