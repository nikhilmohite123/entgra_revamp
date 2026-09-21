import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useStage2 } from '../../../hooks/useStage2';
import { useTempFiles } from '../../../hooks/useTempFiles';
import TempFileUploadModal from '../Create/components/TempFileUploadModal';

const schema = z.object({
  s_new_project_id: z.string().min(1, 'Required'),
  d_activation_date: z.string().min(1, 'Required'),
  d_dop_date: z.string().optional(),
  d_target_date: z.string().min(1, 'Required'),
  s_project_location: z.array(z.string()).min(1, 'Required').or(z.string().min(1, 'Required')),
  s_proj_cap_invest: z.string().min(1, 'Required'),
  n_indicative_price: z.string().min(1, 'Required'),
  n_pay_back_period: z.string().min(1, 'Required'),
  s_market_sec_proj_vol: z.string().min(1, 'Required'),
  s_capex: z.enum(['Yes', 'No'], { required_error: 'Capex should be Required!!' }),
});

export default function Stage2Page() {
  const { projectId } = useParams();
  const { 
    item, locations,
    isLoading, isError, 
    addStage, isAddingStage
  } = useStage2(projectId);

  const {
    tempFiles,
    fetchTempFiles,
    deleteTempFile,
    isDeletingFile
  } = useTempFiles('S2', projectId);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [materials, setMaterials] = useState([]);
  const [newMaterial, setNewMaterial] = useState({ s_material: '', s_source_code: '', s_lead_time_exi: '', s_price: '' });

  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({ s_stage: '', s_station: '', s_similarity: '' });

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {}
  });

  useEffect(() => {
    if (item) {
      // Legacy code dynamically assigns string vs array based on view state
      let locationVal = item.s_project_location || '';
      if (item.s_action_perform === 'V&E' || item.s_action_perform === 'Edit') {
        if (typeof locationVal === 'string') {
          locationVal = locationVal.split(',').filter(Boolean);
        }
      }

      reset({
        ...item,
        s_project_location: locationVal,
        d_activation_date: item.d_activation_date ? new Date(item.d_activation_date).toISOString().split('T')[0] : '',
        d_target_date: item.d_target_date ? new Date(item.d_target_date).toISOString().split('T')[0] : '',
        d_dop_date: item.d_dop_date ? new Date(item.d_dop_date).toISOString().split('T')[0] : '',
        s_capex: item.s_capex || undefined,
      });
    }
  }, [item, reset]);

  if (isLoading) return <div>Loading Stage 2...</div>;
  if (isError || !item) return <div>Error loading project.</div>;

  const isViewOnly = item.s_action_perform === 'View';
  // Note: legacy uses nonEdit = true to mean editable (ng-disabled="!nonEdit").
  const isEditable = !isViewOnly; 

  const onSubmitSave = async (data) => {
    try {
      await addStage({ itemData: data, products, materials });
    } catch (err) {
      alert("There was a server side error!");
    }
  };

  const handleAddMaterial = (e) => {
    e.preventDefault();
    if (!newMaterial.s_material || !newMaterial.s_source_code || !newMaterial.s_lead_time_exi || !newMaterial.s_price) {
      alert("You missed Something!!");
      return;
    }
    setMaterials([...materials, newMaterial]);
    setNewMaterial({ s_material: '', s_source_code: '', s_lead_time_exi: '', s_price: '' });
  };

  const handleRemoveMaterial = (index) => {
    const newM = [...materials];
    newM.splice(index, 1);
    setMaterials(newM);
  };

  const handleAddProduct = (e) => {
    e.preventDefault();
    if (!newProduct.s_stage || !newProduct.s_station || !newProduct.s_similarity) {
      alert("You missed Something!!");
      return;
    }
    setProducts([...products, newProduct]);
    setNewProduct({ s_stage: '', s_station: '', s_similarity: '' });
  };

  const handleRemoveProduct = (index) => {
    const newP = [...products];
    newP.splice(index, 1);
    setProducts(newP);
  };

  const handleFileUploaded = () => {
    setIsModalOpen(false);
    fetchTempFiles();
  };

  return (
    <div className="container">
      <div style={{ marginBottom: '20px' }}>
        <button type="button" className="btn btn-sm btn-info" style={{ marginRight: '10px' }}>Stage 2</button>
        <Link to={`/cni/projects/${projectId}/gate/B`}>
          <button type="button" className="btn btn-sm btn-info" disabled={isViewOnly}>Gate 2</button>
        </Link>
      </div>

      <form className="form-horizontal" onSubmit={handleSubmit(onSubmitSave)}>
        <div className="row">
          <div className="col-sm-3">
            Project Name : <b>{item.s_project_name}</b>
          </div>
          <div className="col-sm-6">
            Product Differentiation / Unique Features & Definition: <b>{item.s_product_diff}</b>
          </div>
        </div>

        <div className="row">
          <div className="col-sm-12">
            <hr style={{ height: '2px', background: '#b5152b' }} />
            <h3>Project registration by C&I </h3>
            <hr style={{ height: '2px', background: '#b5152b' }} />
          </div>

          <div className="col-sm-6">
            Project Number <small>(System Generated)</small>:
            <input className="form-control input-sm" type="text" placeholder="Project Number..." disabled={!isEditable} {...register('s_new_project_id')} />
            {errors.s_new_project_id && <span style={{color: 'red'}}>{errors.s_new_project_id.message}</span>}
          </div>
          
          <div className="col-sm-6">
            Activation Date :
            <input className="form-control input-sm" type="date" disabled={!isEditable} {...register('d_activation_date')} />
            {errors.d_activation_date && <span style={{color: 'red'}}>{errors.d_activation_date.message}</span>}
          </div>

          <div className="col-sm-6">
            DOP :
            <input className="form-control input-sm" type="date" disabled={!isEditable} {...register('d_dop_date')} />
          </div>
          
          <div className="col-sm-6">
            Target Completion date :
            <input className="form-control input-sm" type="date" disabled={!isEditable} {...register('d_target_date')} />
            {errors.d_target_date && <span style={{color: 'red'}}>{errors.d_target_date.message}</span>}
          </div>

          <div className="col-sm-6">
            Project Location :
            <select className="form-control input-sm" multiple disabled={!isEditable} {...register('s_project_location')}>
              {locations.map(loc => (
                <option key={loc.N_LOCATION_ID} value={loc.N_LOCATION_ID.toString()}>{loc.S_LOCATION}</option>
              ))}
            </select>
            {errors.s_project_location && <span style={{color: 'red'}}>{errors.s_project_location.message}</span>}
          </div>
        </div>

        <div className="row">
          <div className="col-sm-12">
            <hr style={{ height: '2px', background: '#b5152b' }} />
            <h3>Raw materials availability, lead time:</h3>
          </div>
          
          <div className="col-md-12">
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th>Material</th>
                  <th>Source/Code</th>
                  <th>Lead time/Existing</th>
                  <th>Price</th>
                  {isEditable && <th>Action</th>}
                </tr>
              </thead>
              <tbody>
                {isEditable && (
                  <tr>
                    <td>
                      <input className="form-control input-sm" type="text" placeholder="Material" value={newMaterial.s_material} onChange={e => setNewMaterial({...newMaterial, s_material: e.target.value})} />
                    </td>
                    <td>
                      <textarea className="form-control input-sm" placeholder="Code" value={newMaterial.s_source_code} onChange={e => setNewMaterial({...newMaterial, s_source_code: e.target.value})}></textarea>
                    </td>
                    <td>
                      <input className="form-control input-sm" type="text" placeholder="Lead time/Existing" value={newMaterial.s_lead_time_exi} onChange={e => setNewMaterial({...newMaterial, s_lead_time_exi: e.target.value})} />
                    </td>
                    <td>
                      <input className="form-control input-sm" type="text" placeholder="Price" value={newMaterial.s_price} onChange={e => setNewMaterial({...newMaterial, s_price: e.target.value})} />
                    </td>
                    <td>
                      <button className="btn btn-sm btn-primary" onClick={handleAddMaterial}>+</button>
                    </td>
                  </tr>
                )}
                {materials.map((m, i) => (
                  <tr key={i}>
                    <td>{m.s_material}</td>
                    <td>{m.s_source_code}</td>
                    <td>{m.s_lead_time_exi}</td>
                    <td>{m.s_price}</td>
                    {isEditable && (
                      <td>
                        <button className="btn btn-sm btn-danger" onClick={(e) => { e.preventDefault(); handleRemoveMaterial(i); }}>X</button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="row">
          <div className="col-sm-12">
            <hr style={{ height: '2px', background: '#b5152b' }} />
            <h3>Projected Process Route:</h3>
            <hr style={{ height: '2px', background: '#b5152b' }} />
          </div>

          <div className="col-md-12">
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th>Stage</th>
                  <th>Station</th>
                  <th>Similarity with any existing product stage (if any)</th>
                  {isEditable && <th>Action</th>}
                </tr>
              </thead>
              <tbody>
                {isEditable && (
                  <tr>
                    <td>
                      <input className="form-control input-sm" type="text" placeholder="Stage" value={newProduct.s_stage} onChange={e => setNewProduct({...newProduct, s_stage: e.target.value})} />
                    </td>
                    <td>
                      <input className="form-control input-sm" type="text" placeholder="Station" value={newProduct.s_station} onChange={e => setNewProduct({...newProduct, s_station: e.target.value})} />
                    </td>
                    <td>
                      <textarea className="form-control input-sm" placeholder="Similarity" value={newProduct.s_similarity} onChange={e => setNewProduct({...newProduct, s_similarity: e.target.value})}></textarea>
                    </td>
                    <td>
                      <button className="btn btn-sm btn-primary" onClick={handleAddProduct}>+</button>
                    </td>
                  </tr>
                )}
                {products.map((x, i) => (
                  <tr key={i}>
                    <td>{x.s_stage}</td>
                    <td>{x.s_station}</td>
                    <td>{x.s_similarity}</td>
                    {isEditable && (
                      <td>
                        <button className="btn btn-sm btn-danger" onClick={(e) => { e.preventDefault(); handleRemoveProduct(i); }}>X</button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="col-sm-6">
            Projected Capital Investment :
            <input className="form-control input-sm" type="text" placeholder="Projected Capital Investment" disabled={!isEditable} {...register('s_proj_cap_invest')} />
            {errors.s_proj_cap_invest && <span style={{color: 'red'}}>{errors.s_proj_cap_invest.message}</span>}
          </div>
          
          <div className="col-sm-6"></div>

          <div className="col-sm-6">
            Indicative Price and GC :
            <input className="form-control input-sm" type="text" placeholder="Indicative Price and GC" disabled={!isEditable} {...register('n_indicative_price')} />
            {errors.n_indicative_price && <span style={{color: 'red'}}>{errors.n_indicative_price.message}</span>}
          </div>

          <div className="col-sm-6">
            Pay Back Period If Capital Investment Required
            <input className="form-control input-sm" type="text" placeholder="Pay Back Period" disabled={!isEditable} {...register('n_pay_back_period')} />
            {errors.n_pay_back_period && <span style={{color: 'red'}}>{errors.n_pay_back_period.message}</span>}
          </div>

          <div className="col-sm-6">
            Market Sector / Projected Volume For Next 4 Year
            <input className="form-control input-sm" type="text" placeholder="Market Sector" disabled={!isEditable} {...register('s_market_sec_proj_vol')} />
            {errors.s_market_sec_proj_vol && <span style={{color: 'red'}}>{errors.s_market_sec_proj_vol.message}</span>}
          </div>

          <div className="col-sm-6">
            <span> CAPEX Required </span><br />
            <label>
              &nbsp;&nbsp;&nbsp;
              <input type="radio" value="Yes" disabled={!isEditable} {...register('s_capex')} /> Yes
            </label><br />
            <label>
              &nbsp;&nbsp;&nbsp;
              <input type="radio" value="No" disabled={!isEditable} {...register('s_capex')} /> No
            </label>
            {errors.s_capex && <span style={{color: 'red', display: 'block'}}>{errors.s_capex.message}</span>}
          </div>

          <div className="col-sm-6">
            <br />
            <strong>DOE : </strong>
            {isEditable && (
              <button type="button" className="btn btn-sm btn-info" onClick={() => setIsModalOpen(true)}>Choose File</button>
            )}
            <ul>
              {tempFiles.map((x, i) => (
                <li key={i} style={{ padding: '8px 0' }}>
                  <a href={`/${x.s_path}/${x.s_new_name}`}>{x.s_ogi_name}</a>
                  {isEditable && (
                    <span onClick={() => deleteTempFile(x.s_attach_id)} style={{ cursor: 'pointer', color: 'red', marginLeft: '15px' }}>
                      {isDeletingFile ? '...' : 'X'}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="col-sm-12">
          <hr style={{ height: '2px', background: '#b5152b' }} />
          {isEditable && (
            <button type="submit" className="btn btn-sm btn-primary" disabled={isAddingStage}>
              {isAddingStage ? 'Submitting...' : 'Submit'}
            </button>
          )}
          <button type="button" className="btn btn-sm btn-default" onClick={() => window.history.back()} style={{ marginLeft: '10px' }}>
            Back
          </button>
        </div>
      </form>

      {isModalOpen && (
        <TempFileUploadModal 
          onClose={() => setIsModalOpen(false)} 
          onSuccess={handleFileUploaded} 
          projectId={projectId} 
          stageId="S2" 
        />
      )}
    </div>
  );
}
