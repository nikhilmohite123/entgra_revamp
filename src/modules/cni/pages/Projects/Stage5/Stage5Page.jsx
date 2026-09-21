import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useStage5 } from '../../../hooks/useStage5';
import TempFileUploadModal from '../Create/components/TempFileUploadModal';

export default function Stage5Page() {
  const { projectId } = useParams();
  const { 
    rawItem, rawMaterials, employees, flcsd_materials_raw, tempFiles,
    isLoading, addStage, isAddingStage, saveRemark, isSavingRemark,
    deleteMaterial, uploadPreproduction, isUploadingPreproduction,
    deleteTempFile, isDeletingFile
  } = useStage5(projectId);

  const [formData, setFormData] = useState(null);
  const [approvals, setApprovals] = useState([]);
  const [flcsd_materials, setFlcsdMaterials] = useState([]);
  
  const [newTeam, setNewTeam] = useState({ s_employee_id: '', s_dept_name: '' });
  const [newFlcsd, setNewFlcsd] = useState({ s_quantity: '', s_delivery_date: '', s_price_settled: '' });
  const [newPreprod, setNewPreprod] = useState({ s_select_name: '', s_report_format: '', s_trial_dates: '', s_remarks: '', file: null });

  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (rawItem && !formData) {
      setFormData({
        ...rawItem,
        d_target_completion_date: rawItem.d_target_completion_date ? rawItem.d_target_completion_date.split('T')[0] : '',
        s_remarks: rawItem.s_remarks || '',
        n_pov: rawItem.n_pov || ''
      });
    }
  }, [rawItem, formData]);

  useEffect(() => {
    if (flcsd_materials_raw.length > 0 && flcsd_materials.length === 0) {
      setFlcsdMaterials(flcsd_materials_raw);
    }
  }, [flcsd_materials_raw, flcsd_materials]);

  if (isLoading) return <div>Loading Stage 5...</div>;
  if (!rawItem || !formData) return <div>Error loading project.</div>;

  const isViewOnly = rawItem.s_action_perform === 'View' || rawItem.s_action_perform === 'V&E';
  const isEditable = !isViewOnly;

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddTeam = () => {
    if (!newTeam.s_employee_id || !newTeam.s_dept_name) {
      alert("You missed Something!!");
      return;
    }
    setApprovals(prev => [...prev, { ...newTeam }]);
    setNewTeam({ s_employee_id: '', s_dept_name: '' });
  };

  const handleAddFlcsd = () => {
    if (!newFlcsd.s_quantity || !newFlcsd.s_delivery_date || !newFlcsd.s_price_settled) {
      alert("You missed Something!!");
      return;
    }
    setFlcsdMaterials(prev => [...prev, { ...newFlcsd }]);
    setNewFlcsd({ s_quantity: '', s_delivery_date: '', s_price_settled: '' });
  };

  const handleRemoveTeam = (index) => {
    setApprovals(prev => prev.filter((_, i) => i !== index));
  };

  const handleRemoveFlcsd = (index) => {
    setFlcsdMaterials(prev => prev.filter((_, i) => i !== index));
  };

  const onAddStage = async () => {
    try {
      await addStage({ item: formData, flcsd_materials, approvals });
    } catch (err) {
      alert("There was a server side error!");
    }
  };

  const onSaveRemark = async () => {
    if (!formData.s_remarks) return alert('Remark should be Required!!');
    if (!formData.n_pov) return alert('Your Point Of View should be Required!!');
    try {
      await saveRemark(formData);
    } catch (err) {
      alert("There was a server side error!");
    }
  };

  const onUploadPreprod = async () => {
    if (!newPreprod.s_select_name || !newPreprod.s_report_format || !newPreprod.s_trial_dates || !newPreprod.s_remarks || !newPreprod.file) {
      alert("You missed Something!!");
      return;
    }
    if (newPreprod.file.size > 10000000) {
      alert("Maximum file size should be 10 mb.");
      return;
    }
    const fd = new FormData();
    fd.append('pid', projectId);
    fd.append('s_select_name', newPreprod.s_select_name);
    fd.append('s_report_format', newPreprod.s_report_format);
    fd.append('s_trial_dates', newPreprod.s_trial_dates);
    fd.append('s_remarks', newPreprod.s_remarks);
    fd.append('rereports', newPreprod.file);
    try {
      await uploadPreproduction(fd);
      setNewPreprod({ s_select_name: '', s_report_format: '', s_trial_dates: '', s_remarks: '', file: null });
      document.getElementById('rereports').value = '';
    } catch (err) {
      alert("Upload failed.");
    }
  };

  return (
    <div className="container">
      <div style={{ marginBottom: '20px' }}>
        <button type="button" className="btn btn-sm btn-info" style={{ marginRight: '10px' }}>Stage 5</button>
        <Link to={`/cni/projects/${projectId}/gate/E`}>
          <button type="button" className="btn btn-sm btn-info" disabled={isViewOnly && rawItem.s_action_perform !== 'V&E'}>Gate 5</button>
        </Link>
      </div>

      <div className="row">
        <div className="col-sm-12">
          <hr style={{ height: '2px', background: '#b5152b' }} />
          <h3>Techono Commercial Run</h3>
        </div>
        <div className="col-sm-4">Project Name: <b>{rawItem.s_project_name}</b></div>
        <div className="col-sm-4">Project No: <b>{rawItem.s_new_project_id}</b></div>
        <div className="col-sm-4">Activation Date: <b>{rawItem.d_activation_date ? rawItem.d_activation_date.split('T')[0] : ''}</b></div>
        
        <div className="col-sm-12"><hr style={{ height: '2px', background: '#b5152b' }} /></div>
        
        <div className="col-sm-6">
          Target Completion Date :
          <input className="form-control input-sm" type="date" name="d_target_completion_date" value={formData.d_target_completion_date} onChange={handleFormChange} disabled={!isEditable} />
        </div>
        <div className="col-sm-6">
          Final Specification :
          {isEditable && (
            <button type="button" className="btn btn-info btn-sm" onClick={() => setIsModalOpen(true)}>Choose File</button>
          )}
          <ul className="w3-ul">
            {tempFiles.filter(x => x.s_attach_type === 'S5').map(x => (
              <li key={x.s_attach_id} className="w3-padding-16">
                <a href={`/${x.s_path}/${x.s_new_name}`}>{x.s_ogi_name}</a>
                {isEditable && <span onClick={() => deleteTempFile(x.s_attach_id)} style={{ cursor: 'pointer', color: 'red', marginLeft: '10px' }}>×</span>}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div>
        <hr style={{ height: '2px', background: '#b5152b' }} />
        <h3>First Lot Commercial Supply Details</h3>
        <hr style={{ height: '2px', background: '#b5152b' }} />
        <div className="table-responsive">
          <table className="table table-bordered">
            <thead>
              <tr>
                <th>Quantity</th>
                <th>Delivery Date</th>
                <th>Price Settled</th>
                {isEditable && <th>Action</th>}
              </tr>
            </thead>
            <tbody>
              {isEditable && (
                <tr>
                  <td><input type="text" className="form-control input-sm" placeholder="Quantity" value={newFlcsd.s_quantity} onChange={e => setNewFlcsd(p => ({ ...p, s_quantity: e.target.value }))} /></td>
                  <td><input type="date" className="form-control input-sm" value={newFlcsd.s_delivery_date} onChange={e => setNewFlcsd(p => ({ ...p, s_delivery_date: e.target.value }))} /></td>
                  <td><input type="text" className="form-control input-sm" placeholder="Price Settled" value={newFlcsd.s_price_settled} onChange={e => setNewFlcsd(p => ({ ...p, s_price_settled: e.target.value }))} /></td>
                  <td><button className='btn btn-primary' onClick={handleAddFlcsd}>+</button></td>
                </tr>
              )}
              {flcsd_materials.map((x, i) => (
                <tr key={i}>
                  <td>{x.s_quantity}</td>
                  <td>{x.s_delivery_date ? x.s_delivery_date.split('T')[0] : ''}</td>
                  <td>{x.s_price_settled}</td>
                  {isEditable && <td><button className='btn btn-danger' onClick={() => handleRemoveFlcsd(i)}>X</button></td>}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <hr style={{ height: '2px', background: '#b5152b' }} />
        <h3>Preproduction Trial Test Reports and Process Data</h3>
        <div className="table-responsive">
          <table className="table table-bordered">
            <thead>
              <tr>
                <th>Select Name</th>
                <th>Report Format No.</th>
                <th>Trial dates</th>
                <th>Report Reference</th>
                <th>Remarks</th>
                {isEditable && <th>Action</th>}
              </tr>
            </thead>
            <tbody>
              {isEditable && (
                <tr>
                  <td>
                    <select className="form-control input-sm" value={newPreprod.s_select_name} onChange={e => setNewPreprod(p => ({ ...p, s_select_name: e.target.value }))}>
                      <option value="">select</option>
                      <option value="Blown Film">Blown Film</option>
                      <option value="Lamination ">Lamination </option>
                      <option value="Printing">Printing</option>
                      <option value="Tubing">Tubing</option>
                      <option value="Capping">Capping</option>
                      <option value="Summary_sheet">Summary Sheet</option>
                    </select>
                  </td>
                  <td><input type="text" className="form-control input-sm" placeholder="Report Format" value={newPreprod.s_report_format} onChange={e => setNewPreprod(p => ({ ...p, s_report_format: e.target.value }))} /></td>
                  <td><input type="date" className="form-control input-sm" value={newPreprod.s_trial_dates} onChange={e => setNewPreprod(p => ({ ...p, s_trial_dates: e.target.value }))} /></td>
                  <td><input type="file" id="rereports" onChange={e => setNewPreprod(p => ({ ...p, file: e.target.files[0] }))} /></td>
                  <td><textarea className="form-control input-sm" placeholder="Remark" value={newPreprod.s_remarks} onChange={e => setNewPreprod(p => ({ ...p, s_remarks: e.target.value }))} /></td>
                  <td><button className='btn btn-sm btn-primary' onClick={onUploadPreprod} disabled={isUploadingPreproduction}>+</button></td>
                </tr>
              )}
              {rawMaterials.map(x => (
                <tr key={x.s_techno_detail_id}>
                  <td>{x.s_select_name}</td>
                  <td>{x.s_report_format}</td>
                  <td>{x.s_trial_dates}</td>
                  <td>
                    <a href={`/${x.s_path}/${x.s_new_filename}`} target="_blank" rel="noreferrer">
                      {x.s_oginame_file} <span className="glyphicon glyphicon-download-alt"></span>
                    </a>
                  </td>
                  <td>{x.s_remarks}</td>
                  {isEditable && <td><button className='btn btn-sm btn-danger' onClick={() => deleteMaterial(x.s_techno_detail_id)}>X</button></td>}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <hr style={{ height: '2px', background: '#b5152b' }} />
        <h3>Approval List</h3>
        <div className="table-responsive">
          <table className="table table-bordered">
            <thead>
              <tr>
                <th>Team Member</th>
                <th>Department</th>
                {!isEditable && <th>Remark</th>}
                {!isEditable && <th>POV</th>}
                {isEditable && <th>Action</th>}
              </tr>
            </thead>
            <tbody>
              {isEditable && (
                <tr>
                  <td>
                    <input 
                      className="form-control input-sm" 
                      type="text" 
                      placeholder="User Name..." 
                      value={newTeam.s_employee_id} 
                      onChange={e => setNewTeam(p => ({ ...p, s_employee_id: e.target.value }))}
                      list="employee-emails"
                    />
                    <datalist id="employee-emails">
                      {employees.map(e => (
                        <option key={e.S_EMAIL_ID} value={e.S_EMAIL_ID}>{e.S_EMP_NAME}</option>
                      ))}
                    </datalist>
                  </td>
                  <td>
                    <select className="form-control input-sm" value={newTeam.s_dept_name} onChange={e => setNewTeam(p => ({ ...p, s_dept_name: e.target.value }))}>
                      <option value="">Select Department</option>
                      {employees.filter(e => e.S_EMAIL_ID === newTeam.s_employee_id).map(e => (
                        <option key={e.S_DEPT_NAME} value={e.S_DEPT_NAME}>{e.S_DEPT_NAME}</option>
                      ))}
                    </select>
                  </td>
                  <td><button className='btn btn-sm btn-primary' onClick={handleAddTeam}>+</button></td>
                </tr>
              )}
              {approvals.map((x, i) => (
                <tr key={i}>
                  <td>{x.s_employee_id}</td>
                  <td>{x.s_dept_name}</td>
                  {!isEditable && <td>{x.s_remarks || 'Remark is pending...'}</td>}
                  {!isEditable && <td>{x.pov}</td>}
                  {isEditable && <td><button className='btn btn-sm btn-danger' onClick={() => handleRemoveTeam(i)}>X</button></td>}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {!isEditable && rawItem.n_status !== 1 && (
        <div className="row">
          <div className="col-sm-6">
            Approval Remark :
            <textarea className="form-control input-sm" name="s_remarks" placeholder="Remark..." value={formData.s_remarks} onChange={handleFormChange} />
          </div>
          <div className="col-sm-6">
            <span>POV <small>(Point of view)</small></span><br/>
            <label><input type="radio" name="n_pov" value="1" checked={formData.n_pov == "1"} onChange={handleFormChange} /> Agree</label><br/>
            <label><input type="radio" name="n_pov" value="0" checked={formData.n_pov == "0"} onChange={handleFormChange} /> Disagree</label><br/>
          </div>
        </div>
      )}

      <div style={{ marginTop: '20px' }}>
        {isEditable && (
          <button type="button" className="btn btn-sm btn-primary" onClick={onAddStage} disabled={isAddingStage}>Submit</button>
        )}
        {!isEditable && rawItem.n_status !== 1 && (
          <button type="button" className="btn btn-sm btn-warning" onClick={onSaveRemark} disabled={isSavingRemark}>Submit</button>
        )}
        <button type="button" className="btn btn-sm btn-default" onClick={() => window.history.back()} style={{ marginLeft: '10px' }}>Back</button>
      </div>

      {isModalOpen && (
        <TempFileUploadModal 
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => setIsModalOpen(false)}
          projectId={projectId}
          stageId="S5"
          fileFieldName="final"
          endpoint="/uploadStages_in_temp"
        />
      )}
    </div>
  );
}
