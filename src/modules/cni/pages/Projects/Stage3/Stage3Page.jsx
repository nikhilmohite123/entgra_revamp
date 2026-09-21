import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useStage3 } from '../../../hooks/useStage3';
import TempFileUploadModal from '../Create/components/TempFileUploadModal';

export default function Stage3Page() {
  const { projectId } = useParams();
  const { 
    item, tempFiles,
    isLoading, isError, 
    addStage, isAddingStage,
    uploadRowDetails, isUploadingRow,
    uploadCandILabDetails, isUploadingCandI,
    deleteTempFile, isDeletingFile
  } = useStage3(projectId);

  const [activeModal, setActiveModal] = useState(null); // 'S3-2', 'S3-3', 'S3-4', 'S3-5', 'S3-6', 'S3-7'

  const [materials, setMaterials] = useState([]);
  const [newMaterial, setNewMaterial] = useState({
    s_sealant_pp: '', s_middle_pp: '', s_print_pp: '', s_lamination_pp: '', s_printing_pp: '', s_tubing_pp: ''
  });
  const [newMaterialFiles, setNewMaterialFiles] = useState({});

  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({
    s_sealant_tr: '', s_middle_tr: '', s_print_tr: '', s_lamination_tr: '', s_printing_tr: '', s_tubing_tr: ''
  });
  const [newProductFiles, setNewProductFiles] = useState({});

  if (isLoading) return <div>Loading Stage 3...</div>;
  if (isError || !item) return <div>Error loading project.</div>;

  const isViewOnly = item.s_action_perform === 'View';
  const isEditable = !isViewOnly; 
  const btnHideFromViewser = isViewOnly || item.s_action_perform === 'V&E';

  const onSubmitSave = async (e) => {
    e.preventDefault();
    try {
      await addStage({ prodata: item, id: projectId, item, uid: localStorage.getItem('loginId') || '' });
    } catch (err) {
      alert("There was a server side error!");
    }
  };

  const handleAddMaterial = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('pid', projectId);
      formData.append('s_sealant_pp', newMaterial.s_sealant_pp);
      formData.append('s_middle_pp', newMaterial.s_middle_pp);
      formData.append('s_print_pp', newMaterial.s_print_pp);
      formData.append('s_lamination_pp', newMaterial.s_lamination_pp);
      formData.append('s_printing_pp', newMaterial.s_printing_pp);
      formData.append('s_tubing_pp', newMaterial.s_tubing_pp);

      if (newMaterialFiles.s_doe_attach) formData.append('s_doe_attach', newMaterialFiles.s_doe_attach);
      if (newMaterialFiles.s_sealant_pp_attach) formData.append('s_sealant_pp_attach', newMaterialFiles.s_sealant_pp_attach);
      if (newMaterialFiles.s_middle_pp_attach) formData.append('s_middle_pp_attach', newMaterialFiles.s_middle_pp_attach);
      if (newMaterialFiles.s_print_pp_attach) formData.append('s_print_pp_attach', newMaterialFiles.s_print_pp_attach);
      if (newMaterialFiles.s_lamination_pp_attach) formData.append('s_lamination_pp_attach', newMaterialFiles.s_lamination_pp_attach);
      if (newMaterialFiles.s_printing_pp_attach) formData.append('s_printing_pp_attach', newMaterialFiles.s_printing_pp_attach);
      if (newMaterialFiles.s_tubing_pp_attach) formData.append('s_tubing_pp_attach', newMaterialFiles.s_tubing_pp_attach);

      await uploadRowDetails(formData);

      // In real scenario, we might want to re-fetch the arrays, but in legacy they only did it if they navigated.
      // Wait, legacy HTML reloads the iframe and calls getRawbyid(). We invalidate in the hook.
      setNewMaterial({
        s_sealant_pp: '', s_middle_pp: '', s_print_pp: '', s_lamination_pp: '', s_printing_pp: '', s_tubing_pp: ''
      });
      setNewMaterialFiles({});
      alert("Development trial reports successfully added.");
    } catch (err) {
      alert("There was a server side error!");
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('pid', projectId);
      formData.append('s_sealant_tr', newProduct.s_sealant_tr);
      formData.append('s_middle_tr', newProduct.s_middle_tr);
      formData.append('s_print_tr', newProduct.s_print_tr);
      formData.append('s_lamination_tr', newProduct.s_lamination_tr);
      formData.append('s_printing_tr', newProduct.s_printing_tr);
      formData.append('s_tubing_tr', newProduct.s_tubing_tr);

      if (newProductFiles.s_doe_attach) formData.append('s_doe_attach', newProductFiles.s_doe_attach);
      if (newProductFiles.s_sealant_tr_attach) formData.append('s_sealant_tr_attach', newProductFiles.s_sealant_tr_attach);
      if (newProductFiles.s_middle_tr_attach) formData.append('s_middle_tr_attach', newProductFiles.s_middle_tr_attach);
      if (newProductFiles.s_print_tr_attach) formData.append('s_print_tr_attach', newProductFiles.s_print_tr_attach);
      if (newProductFiles.s_lamination_tr_attach) formData.append('s_lamination_tr_attach', newProductFiles.s_lamination_tr_attach);
      if (newProductFiles.s_printing_tr_attach) formData.append('s_printing_tr_attach', newProductFiles.s_printing_tr_attach);
      if (newProductFiles.s_tubing_tr_attach) formData.append('s_tubing_tr_attach', newProductFiles.s_tubing_tr_attach);

      await uploadCandILabDetails(formData);

      setNewProduct({
        s_sealant_tr: '', s_middle_tr: '', s_print_tr: '', s_lamination_tr: '', s_printing_tr: '', s_tubing_tr: ''
      });
      setNewProductFiles({});
      alert("C & I Lab Reports successfully added.");
    } catch (err) {
      alert("There was a server side error!");
    }
  };

  // Note: legacy uses separate names for each type: dtrailRef, ProtrailRef, imntailRef, ipr, regu_attach, cust_trial_attach.
  // We need to map stageId to fileFieldName for TempFileUploadModal if we make it generic, but TempFileUploadModal
  // in Phase 4 is hardcoded to `refrenceFile`. I will need to update TempFileUploadModal to take `fileFieldName` and `endpoint`.
  
  return (
    <div className="container">
      <div style={{ marginBottom: '20px' }}>
        <button type="button" className="btn btn-sm btn-info" style={{ marginRight: '10px' }}>Stage 3</button>
        <Link to={`/cni/projects/${projectId}/gate/C`}>
          <button type="button" className="btn btn-sm btn-info" disabled={btnHideFromViewser}>Gate 3</button>
        </Link>
      </div>

      <div className="row">
        <div className="col-sm-12">
          <h3>Development & Prototyping (Lami/Tube)</h3>
        </div>
        <div className="col-sm-6">Project Name: <b>{item.s_project_name}</b></div>
        <div className="col-sm-6">Project No: <b>{item.s_new_project_id}</b></div>
      </div>

      <div className="row">
        <div className="col-sm-12">
          <hr style={{ height: '2px', background: '#b5152b' }} />
          <h3>Development Trial Reports:</h3>
          <hr style={{ height: '2px', background: '#b5152b' }} />
          <div className="table-responsive">
            <table className="table table-bordered table-striped">
              <thead>
                <tr>
                  <th>Sr. No.</th>
                  <th>DoE</th>
                  <th>Sealant PP</th>
                  <th>Middle PP</th>
                  <th>Print PP</th>
                  <th>Lamination</th>
                  <th>Printing</th>
                  <th>Tubing</th>
                  {isEditable && !btnHideFromViewser && <th>Action</th>}
                </tr>
              </thead>
              <tbody>
                {isEditable && !btnHideFromViewser && (
                  <>
                    <tr>
                      <td>-</td>
                      <td>-</td>
                      <td><input type="text" className="form-control input-sm" placeholder="Sealant PP" value={newMaterial.s_sealant_pp} onChange={e => setNewMaterial({...newMaterial, s_sealant_pp: e.target.value})} /></td>
                      <td><input type="text" className="form-control input-sm" placeholder="Middle PP" value={newMaterial.s_middle_pp} onChange={e => setNewMaterial({...newMaterial, s_middle_pp: e.target.value})} /></td>
                      <td><input type="text" className="form-control input-sm" placeholder="Print PP" value={newMaterial.s_print_pp} onChange={e => setNewMaterial({...newMaterial, s_print_pp: e.target.value})} /></td>
                      <td><input type="text" className="form-control input-sm" placeholder="Lamination PP" value={newMaterial.s_lamination_pp} onChange={e => setNewMaterial({...newMaterial, s_lamination_pp: e.target.value})} /></td>
                      <td><input type="text" className="form-control input-sm" placeholder="Printing PP" value={newMaterial.s_printing_pp} onChange={e => setNewMaterial({...newMaterial, s_printing_pp: e.target.value})} /></td>
                      <td><input type="text" className="form-control input-sm" placeholder="Tubing PP" value={newMaterial.s_tubing_pp} onChange={e => setNewMaterial({...newMaterial, s_tubing_pp: e.target.value})} /></td>
                      <td rowSpan={2}>
                        <button className="btn btn-primary" onClick={handleAddMaterial} disabled={isUploadingRow}>+</button>
                      </td>
                    </tr>
                    <tr>
                      <td>-</td>
                      <td><input type="file" className="form-control" onChange={e => setNewMaterialFiles({...newMaterialFiles, s_doe_attach: e.target.files[0]})} /></td>
                      <td><input type="file" className="form-control" onChange={e => setNewMaterialFiles({...newMaterialFiles, s_sealant_pp_attach: e.target.files[0]})} /></td>
                      <td><input type="file" className="form-control" onChange={e => setNewMaterialFiles({...newMaterialFiles, s_middle_pp_attach: e.target.files[0]})} /></td>
                      <td><input type="file" className="form-control" onChange={e => setNewMaterialFiles({...newMaterialFiles, s_print_pp_attach: e.target.files[0]})} /></td>
                      <td><input type="file" className="form-control" onChange={e => setNewMaterialFiles({...newMaterialFiles, s_lamination_pp_attach: e.target.files[0]})} /></td>
                      <td><input type="file" className="form-control" onChange={e => setNewMaterialFiles({...newMaterialFiles, s_printing_pp_attach: e.target.files[0]})} /></td>
                      <td><input type="file" className="form-control" onChange={e => setNewMaterialFiles({...newMaterialFiles, s_tubing_pp_attach: e.target.files[0]})} /></td>
                    </tr>
                  </>
                )}
                {/* Legacy materials list goes here, but remember we fetch them in Gate C usually, wait Stage 3 HTML HAS an ng-repeat for materials here! 
                    I should map them, but in useStage3 I didn't fetch materials/products. I should fetch them in useStage3 as well since Stage 3 DOES fetch them! */}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-sm-12">
          <hr style={{ height: '2px', background: '#b5152b' }} />
          <h3>C & I Lab Reports:</h3>
          <hr style={{ height: '2px', background: '#b5152b' }} />
          <div className="table-responsive">
            <table className="table table-bordered table-striped">
              <thead>
                <tr>
                  <th>Sr. No</th>
                  <th>DoE</th>
                  <th>Sealant TR</th>
                  <th>Middle TR</th>
                  <th>Print TR</th>
                  <th>Lamination TR</th>
                  <th>Printing TR</th>
                  <th>Tubing TR</th>
                  {isEditable && !btnHideFromViewser && <th>Action</th>}
                </tr>
              </thead>
              <tbody>
                {isEditable && !btnHideFromViewser && (
                  <>
                    <tr>
                      <td>-</td>
                      <td>-</td>
                      <td><input type="text" className="form-control input-sm" placeholder="Sealant TR" value={newProduct.s_sealant_tr} onChange={e => setNewProduct({...newProduct, s_sealant_tr: e.target.value})} /></td>
                      <td><input type="text" className="form-control input-sm" placeholder="Middle TR" value={newProduct.s_middle_tr} onChange={e => setNewProduct({...newProduct, s_middle_tr: e.target.value})} /></td>
                      <td><input type="text" className="form-control input-sm" placeholder="Print TR" value={newProduct.s_print_tr} onChange={e => setNewProduct({...newProduct, s_print_tr: e.target.value})} /></td>
                      <td><input type="text" className="form-control input-sm" placeholder="Lamination TR" value={newProduct.s_lamination_tr} onChange={e => setNewProduct({...newProduct, s_lamination_tr: e.target.value})} /></td>
                      <td><input type="text" className="form-control input-sm" placeholder="Printing TR" value={newProduct.s_printing_tr} onChange={e => setNewProduct({...newProduct, s_printing_tr: e.target.value})} /></td>
                      <td><input type="text" className="form-control input-sm" placeholder="Tubing TR" value={newProduct.s_tubing_tr} onChange={e => setNewProduct({...newProduct, s_tubing_tr: e.target.value})} /></td>
                      <td rowSpan={2}>
                        <button className="btn btn-primary" onClick={handleAddProduct} disabled={isUploadingCandI}>+</button>
                      </td>
                    </tr>
                    <tr>
                      <td>-</td>
                      <td><input type="file" className="form-control" onChange={e => setNewProductFiles({...newProductFiles, s_doe_attach: e.target.files[0]})} /></td>
                      <td><input type="file" className="form-control" onChange={e => setNewProductFiles({...newProductFiles, s_sealant_tr_attach: e.target.files[0]})} /></td>
                      <td><input type="file" className="form-control" onChange={e => setNewProductFiles({...newProductFiles, s_middle_tr_attach: e.target.files[0]})} /></td>
                      <td><input type="file" className="form-control" onChange={e => setNewProductFiles({...newProductFiles, s_print_tr_attach: e.target.files[0]})} /></td>
                      <td><input type="file" className="form-control" onChange={e => setNewProductFiles({...newProductFiles, s_lamination_tr_attach: e.target.files[0]})} /></td>
                      <td><input type="file" className="form-control" onChange={e => setNewProductFiles({...newProductFiles, s_printing_tr_attach: e.target.files[0]})} /></td>
                      <td><input type="file" className="form-control" onChange={e => setNewProductFiles({...newProductFiles, s_tubing_tr_attach: e.target.files[0]})} /></td>
                    </tr>
                  </>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-sm-12">
          <hr style={{ height: '2px', background: '#b5152b' }} />
          <div className="col-sm-6">
            <strong>Product development datasheet reference</strong>
            {isEditable && !btnHideFromViewser && (
              <button className="btn btn-info btn-sm" onClick={() => setActiveModal('S3-3')}>Choose File</button>
            )}
            <ul>
              {tempFiles.filter(x => x.s_attach_type === 'S3-3').map(x => (
                <li key={x.s_attach_id}>
                  <a href={`/${x.s_path}/${x.s_new_name}`}>{x.s_ogi_name}</a>
                  {isEditable && !btnHideFromViewser && (
                    <span style={{color:'red', cursor:'pointer', marginLeft:'10px'}} onClick={() => deleteTempFile(x.s_attach_id)}>X</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
          <div className="col-sm-6">
            <strong>Interim specification reference</strong>
            {isEditable && !btnHideFromViewser && (
              <button className="btn btn-info btn-sm" onClick={() => setActiveModal('S3-4')}>Choose File</button>
            )}
            <ul>
              {tempFiles.filter(x => x.s_attach_type === 'S3-4').map(x => (
                <li key={x.s_attach_id}>
                  <a href={`/${x.s_path}/${x.s_new_name}`}>{x.s_ogi_name}</a>
                  {isEditable && !btnHideFromViewser && (
                    <span style={{color:'red', cursor:'pointer', marginLeft:'10px'}} onClick={() => deleteTempFile(x.s_attach_id)}>X</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        <div className="col-sm-12">
          <div className="col-sm-6">
            <strong>IPR reference, if any</strong>
            {isEditable && !btnHideFromViewser && (
              <button className="btn btn-info btn-sm" onClick={() => setActiveModal('S3-5')}>Choose File</button>
            )}
            <ul>
              {tempFiles.filter(x => x.s_attach_type === 'S3-5').map(x => (
                <li key={x.s_attach_id}>
                  <a href={`/${x.s_path}/${x.s_new_name}`}>{x.s_ogi_name}</a>
                  {isEditable && !btnHideFromViewser && (
                    <span style={{color:'red', cursor:'pointer', marginLeft:'10px'}} onClick={() => deleteTempFile(x.s_attach_id)}>X</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
          <div className="col-sm-6">
            <strong>Regulatory</strong>
            {isEditable && !btnHideFromViewser && (
              <button className="btn btn-info btn-sm" onClick={() => setActiveModal('S3-6')}>Choose File</button>
            )}
            <ul>
              {tempFiles.filter(x => x.s_attach_type === 'S3-6').map(x => (
                <li key={x.s_attach_id}>
                  <a href={`/${x.s_path}/${x.s_new_name}`}>{x.s_ogi_name}</a>
                  {isEditable && !btnHideFromViewser && (
                    <span style={{color:'red', cursor:'pointer', marginLeft:'10px'}} onClick={() => deleteTempFile(x.s_attach_id)}>X</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="col-sm-12">
          <div className="col-sm-6">
            <strong>Customer Trial Report/feedback</strong>
            {isEditable && !btnHideFromViewser && (
              <button className="btn btn-info btn-sm" onClick={() => setActiveModal('S3-7')}>Choose File</button>
            )}
            <ul>
              {tempFiles.filter(x => x.s_attach_type === 'S3-7').map(x => (
                <li key={x.s_attach_id}>
                  <a href={`/${x.s_path}/${x.s_new_name}`}>{x.s_ogi_name}</a>
                  {isEditable && !btnHideFromViewser && (
                    <span style={{color:'red', cursor:'pointer', marginLeft:'10px'}} onClick={() => deleteTempFile(x.s_attach_id)}>X</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
          <div className="col-sm-6">
            <strong>Summary Report</strong>
            {isEditable && !btnHideFromViewser && (
              <button className="btn btn-info btn-sm" onClick={() => setActiveModal('S3-2')}>Choose File</button>
            )}
            <ul>
              {tempFiles.filter(x => x.s_attach_type === 'S3-2').map(x => (
                <li key={x.s_attach_id}>
                  <a href={`/${x.s_path}/${x.s_new_name}`}>{x.s_ogi_name}</a>
                  {isEditable && !btnHideFromViewser && (
                    <span style={{color:'red', cursor:'pointer', marginLeft:'10px'}} onClick={() => deleteTempFile(x.s_attach_id)}>X</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-sm-12">
          <hr style={{ height: '2px', background: '#b5152b' }} />
          {isEditable && !btnHideFromViewser && (
            <button className="btn btn-sm btn-primary" onClick={onSubmitSave} disabled={isAddingStage}>Submit</button>
          )}
          <button className="btn btn-sm btn-default" onClick={() => window.history.back()} style={{ marginLeft: '10px' }}>Back</button>
        </div>
      </div>

      {activeModal && (
        <TempFileUploadModal 
          onClose={() => setActiveModal(null)}
          onSuccess={() => setActiveModal(null)}
          projectId={projectId}
          stageId={activeModal}
          fileFieldName={
            activeModal === 'S3-2' ? 'dtrailRef' :
            activeModal === 'S3-3' ? 'ProtrailRef' :
            activeModal === 'S3-4' ? 'imntailRef' :
            activeModal === 'S3-5' ? 'ipr' :
            activeModal === 'S3-6' ? 'regu_attach' :
            activeModal === 'S3-7' ? 'cust_trial_attach' : 'refrenceFile'
          }
          endpoint="/uploadStages_in_temp"
        />
      )}
    </div>
  );
}
