import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useStage4 } from '../../../hooks/useStage4';
import TempFileUploadModal from '../Create/components/TempFileUploadModal';

export default function Stage4Page() {
  const { projectId } = useParams();
  const { 
    rawItem, tempFiles,
    isLoading, isError,
    addStage, isAddingStage,
    deleteTempFile
  } = useStage4(projectId);

  const [formData, setFormData] = useState(null);
  const [activeModal, setActiveModal] = useState(null);

  useEffect(() => {
    if (rawItem && !formData) {
      // Legacy mutates the object on initial load
      setFormData({
        ...rawItem,
        n_cust_select: 1, // defaults to 1
        s_comment: "None",
        s_cust_app: rawItem.s_cust_app || "",
        s_details_of_sample: rawItem.s_details_of_sample || "",
        s_cust_res: rawItem.s_cust_res || "",
        s_stability_study: rawItem.s_stability_study || "",
        s_modification_sugg: rawItem.s_modification_sugg || "",
        s_prob_other_cust: rawItem.s_prob_other_cust || ""
      });
    }
  }, [rawItem, formData]);

  if (isLoading) return <div>Loading Stage 4...</div>;
  if (isError || !rawItem || !formData) return <div>Error loading project.</div>;

  const isViewOnly = rawItem.s_action_perform === 'View';
  const isEditable = !isViewOnly;
  const btnHideFromViewser = isViewOnly || rawItem.s_action_perform === 'V&E';

  const handleToggle = (type) => {
    if (type === 'IV') {
      setFormData(prev => ({
        ...prev,
        n_cust_select: 0,
        s_cust_app: "None",
        s_details_of_sample: "None",
        s_cust_res: "None",
        s_stability_study: "None",
        s_modification_sugg: "None",
        s_prob_other_cust: "None",
        s_comment: ""
      }));
    } else if (type === 'CV') {
      setFormData(prev => ({
        ...prev,
        n_cust_select: 1,
        s_cust_app: "",
        s_details_of_sample: "",
        s_cust_res: "",
        s_stability_study: "",
        s_modification_sugg: "",
        s_prob_other_cust: "",
        s_comment: "None"
      }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const onSubmitSave = async (e) => {
    e.preventDefault();
    if (!formData.s_cust_app || !formData.s_details_of_sample || !formData.s_cust_res || !formData.s_stability_study || !formData.s_modification_sugg || !formData.s_prob_other_cust || !formData.s_comment) {
      alert("Missing required fields");
      return;
    }
    try {
      await addStage({ prodata: formData, id: projectId, item: formData, uid: localStorage.getItem('loginId') || '' });
    } catch (err) {
      alert("There was a server side error!");
    }
  };

  return (
    <div className="container">
      <div style={{ marginBottom: '20px' }}>
        <button type="button" className="btn btn-sm btn-info" style={{ marginRight: '10px' }}>Stage 4</button>
        <Link to={`/cni/projects/${projectId}/gate/D`}>
          <button type="button" className="btn btn-sm btn-info" disabled={btnHideFromViewser}>Gate 4</button>
        </Link>
      </div>

      <div className="row">
        <div className="col-sm-12">
          <label style={{ fontSize: 'larger' }}>
            <input 
              type="radio" 
              name="n_cust_select" 
              checked={formData.n_cust_select === 1} 
              onChange={() => handleToggle('CV')} 
              disabled={!isEditable}
            /> Customer Validation
          </label>
        </div>
        <div className="col-sm-6">Project Name : <b>{rawItem.s_project_name}</b></div>
        <div className="col-sm-6">Project No: <b>{rawItem.s_new_project_id}</b></div>
        <div className="col-sm-12"><hr style={{ height: '2px', background: '#b5152b' }} /></div>

        <div className="col-sm-6">
          Customer's Approached :
          <textarea className="form-control input-sm" name="s_cust_app" value={formData.s_cust_app} onChange={handleChange} disabled={!isEditable} maxLength={5000} required />
        </div>

        <div className="col-sm-6">
          Details of Sample Supplied With Quantity sample:
          <textarea className="form-control input-sm" name="s_details_of_sample" value={formData.s_details_of_sample} onChange={handleChange} disabled={!isEditable} maxLength={5000} required />
        </div>

        <div className="col-sm-6">
          Response from customers:
          <input className="form-control input-sm" name="s_cust_res" type="text" value={formData.s_cust_res} onChange={handleChange} disabled={!isEditable} required />
        </div>

        <div className="col-sm-6">
          Stability Study, if any:
          <input className="form-control input-sm" name="s_stability_study" type="text" value={formData.s_stability_study} onChange={handleChange} disabled={!isEditable} required />
        </div>

        <div className="col-sm-6">
          Modification suggestions, if any:
          <textarea className="form-control input-sm" name="s_modification_sugg" value={formData.s_modification_sugg} onChange={handleChange} disabled={!isEditable} maxLength={5000} required />
        </div>

        <div className="col-sm-6">
          Probable other customers/ Market Segment:
          <input className="form-control input-sm" name="s_prob_other_cust" type="text" value={formData.s_prob_other_cust} onChange={handleChange} disabled={!isEditable} required />
        </div>

        <div className="col-sm-12">
          <div className="col-sm-6">
            <br/>Stability Study :
            {isEditable && !btnHideFromViewser && (
              <button className="btn btn-info btn-sm" onClick={() => setActiveModal('S4-4')}>Choose File</button>
            )}
            <ul>
              {tempFiles.filter(x => x.s_attach_type === 'S4-4').map(x => (
                <li key={x.s_attach_id}>
                  <a href={`/${x.s_path}/${x.s_new_name}`}>{x.s_ogi_name}</a>
                  {isEditable && !btnHideFromViewser && <span style={{color:'red', cursor:'pointer', marginLeft:'10px'}} onClick={() => deleteTempFile(x.s_attach_id)}>X</span>}
                </li>
              ))}
            </ul>
          </div>
          <div className="col-sm-6">
            <br/>Q.A Agreement:
            {isEditable && !btnHideFromViewser && (
              <button className="btn btn-info btn-sm" onClick={() => setActiveModal('S4-1')}>Choose File</button>
            )}
            <ul>
              {tempFiles.filter(x => x.s_attach_type === 'S4-1').map(x => (
                <li key={x.s_attach_id}>
                  <a href={`/${x.s_path}/${x.s_new_name}`}>{x.s_ogi_name}</a>
                  {isEditable && !btnHideFromViewser && <span style={{color:'red', cursor:'pointer', marginLeft:'10px'}} onClick={() => deleteTempFile(x.s_attach_id)}>X</span>}
                </li>
              ))}
            </ul>
          </div>
          <div className="col-sm-6">
            <br/>Supply Agreement:
            {isEditable && !btnHideFromViewser && (
              <button className="btn btn-info btn-sm" onClick={() => setActiveModal('S4-2')}>Choose File</button>
            )}
            <ul>
              {tempFiles.filter(x => x.s_attach_type === 'S4-2').map(x => (
                <li key={x.s_attach_id}>
                  <a href={`/${x.s_path}/${x.s_new_name}`}>{x.s_ogi_name}</a>
                  {isEditable && !btnHideFromViewser && <span style={{color:'red', cursor:'pointer', marginLeft:'10px'}} onClick={() => deleteTempFile(x.s_attach_id)}>X</span>}
                </li>
              ))}
            </ul>
          </div>
          <div className="col-sm-6">
            <br/>Customer feedback report :
            {isEditable && !btnHideFromViewser && (
              <button className="btn btn-info btn-sm" onClick={() => setActiveModal('S4-3')}>Choose File</button>
            )}
            <ul>
              {tempFiles.filter(x => x.s_attach_type === 'S4-3').map(x => (
                <li key={x.s_attach_id}>
                  <a href={`/${x.s_path}/${x.s_new_name}`}>{x.s_ogi_name}</a>
                  {isEditable && !btnHideFromViewser && <span style={{color:'red', cursor:'pointer', marginLeft:'10px'}} onClick={() => deleteTempFile(x.s_attach_id)}>X</span>}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="col-sm-12"><hr style={{ height: '2px', background: '#b5152b' }} /></div>

        <div className="col-sm-12">
          <label style={{ fontSize: 'larger' }}>
            <input 
              type="radio" 
              name="n_cust_select" 
              checked={formData.n_cust_select === 0} 
              onChange={() => handleToggle('IV')} 
              disabled={!isEditable}
            /> Internal Validation
          </label>
        </div>
        
        <div className="col-sm-12">
          <div className="col-sm-6">
            <label className="control-label">Comment</label>
            <textarea className="form-control input-sm" name="s_comment" value={formData.s_comment} onChange={handleChange} disabled={!isEditable} maxLength={200} required />
          </div>
          <div className="col-sm-6">
            Other Attachment :
            {isEditable && !btnHideFromViewser && (
              <button className="btn btn-info btn-sm" onClick={() => setActiveModal('S4-5')}>Choose File</button>
            )}
            <ul>
              {tempFiles.filter(x => x.s_attach_type === 'S4-5').map(x => (
                <li key={x.s_attach_id}>
                  <a href={`/${x.s_path}/${x.s_new_name}`}>{x.s_ogi_name}</a>
                  {isEditable && !btnHideFromViewser && <span style={{color:'red', cursor:'pointer', marginLeft:'10px'}} onClick={() => deleteTempFile(x.s_attach_id)}>X</span>}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="col-sm-12"><hr style={{ height: '2px', background: '#b5152b' }} /></div>
      </div>
      
      {isEditable && !btnHideFromViewser && (
        <button className="btn btn-sm btn-primary" onClick={onSubmitSave} disabled={isAddingStage}>Submit</button>
      )}
      {isEditable && (
        <button className="btn btn-sm btn-default" onClick={() => window.history.back()} style={{ marginLeft: '10px' }}>Back</button>
      )}

      {activeModal && (
        <TempFileUploadModal 
          onClose={() => setActiveModal(null)}
          onSuccess={() => setActiveModal(null)}
          projectId={projectId}
          stageId={activeModal}
          fileFieldName={
            activeModal === 'S4-1' ? 'Agreement_' :
            activeModal === 'S4-2' ? 'Sagremnt_' :
            activeModal === 'S4-3' ? 'feedback_' :
            activeModal === 'S4-4' ? 'Stability__' :
            activeModal === 'S4-5' ? 'feedback__' : 'refrenceFile'
          }
          endpoint="/uploadStages_in_temp"
        />
      )}
    </div>
  );
}
