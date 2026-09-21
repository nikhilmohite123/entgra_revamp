import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useGateE } from '../../../hooks/useGateE';

export default function GateEPage() {
  const { projectId } = useParams();
  const { 
    rawItem, isLoading,
    addGate, isAddingGate
  } = useGateE(projectId);

  const [formData, setFormData] = useState(null);

  useEffect(() => {
    if (rawItem && !formData) {
      setFormData({
        ...rawItem,
        s_recommendation: '',
        d_cif_reles_date: '',
        s_ext_int_elaborate: rawItem.s_ext_int_elaborate || '',
        s_key_material_check: rawItem.s_key_material_check || '0',
        s_pro_warehouse_check: rawItem.s_pro_warehouse_check || '0',
        s_manu_capa_check: rawItem.s_manu_capa_check || '0',
        s_prod_speci_check: rawItem.s_prod_speci_check || '0',
        s_site_of_manu_check: rawItem.s_site_of_manu_check || '0',
        s_trans_method_check: rawItem.s_trans_method_check || '0',
        s_produ_process_check: rawItem.s_produ_process_check || '0',
        s_other_altr_check: rawItem.s_other_altr_check || '0',
        s_other_altr_value: rawItem.s_other_altr_value || '',
        s_current_practice: rawItem.s_current_practice || '',
        s_new_practice: rawItem.s_new_practice || '',
        s_associated_chang: rawItem.s_associated_chang || ''
      });
    }
  }, [rawItem, formData]);

  if (isLoading) return <div>Loading Gate E...</div>;
  if (!rawItem || !formData) return <div>Error loading project.</div>;

  const btnHideFromViewser = rawItem.s_action_perform === 'View' || rawItem.s_action_perform === 'V&E';

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      const val = checked ? '1' : '0';
      setFormData(prev => {
        const next = { ...prev, [name]: val };
        if (name === 's_other_altr_check' && val === '0') {
          next.s_other_altr_value = '';
        }
        return next;
      });
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const onAddGate = async () => {
    // Only "Approved" path exists. No window.confirm in legacy! Wait, let me check legacy again.
    // Legacy simply does: $scope.AddGate = function (item) { $scope.updateProStagelevel(); $scope.AddGateE_CFI(item); }
    // No confirm!
    if (!formData.s_ext_int_elaborate || !formData.s_current_practice || !formData.s_new_practice || !formData.s_associated_chang || !formData.s_recommendation || !formData.d_cif_reles_date) {
      alert("Please fill all required fields");
      return;
    }
    if (formData.s_other_altr_check === '1' && !formData.s_other_altr_value) {
      alert("Please specify other alternate material");
      return;
    }
    await addGate(formData);
  };

  return (
    <div className="container">
      <div style={{ marginBottom: '20px' }}>
        <Link to={`/cni/projects/${projectId}/stage/5`}>
          <button type="button" className="btn btn-sm btn-info" style={{ marginRight: '10px' }}>Stage 5</button>
        </Link>
        <button type="button" className="btn btn-sm btn-info">Gate 5</button>
      </div>

      <div className="panel panel-default">
        <div className="panel-body">
          <h4><span className="label label-primary">CIF Form</span></h4>
          <div className="col-md-12">
            <div className="col-sm-4">Project Name: <b>{rawItem.s_project_name}</b></div>
            <div className="col-sm-4">Project No: <b>{rawItem.s_new_project_id}</b></div>
          </div>
          <div className="col-sm-12"><hr style={{ height: '2px', background: '#b5152b' }} /></div>

          <div className="form-group">
            <label className="control-label col-sm-4"><small>Internal / External (Elaborate Where Required)</small></label>
            <div className="col-sm-4">
              <input className="form-control input-sm" type="text" name="s_ext_int_elaborate" placeholder="Change Intimation Type" value={formData.s_ext_int_elaborate} onChange={handleChange} disabled={btnHideFromViewser} required />
            </div>
          </div>

          <div className="col-sm-12"><hr style={{ height: '2px', background: '#b5152b' }} /></div>

          <div className="col-md-12"><label><small>Nature of Change (Tick Relevant) :</small></label></div>

          <div className="col-md-12">
            <div className="col-md-6">
              <label className="col-sm-4 control-label small">Key Material Change</label>
              <div className="col-sm-2"><input type="checkbox" name="s_key_material_check" checked={formData.s_key_material_check === '1'} onChange={handleChange} disabled={btnHideFromViewser} /></div>
            </div>
            <div className="col-md-6">
              <label className="col-sm-4 control-label small">Product Warehouse location</label>
              <div className="col-sm-2"><input type="checkbox" name="s_pro_warehouse_check" checked={formData.s_pro_warehouse_check === '1'} onChange={handleChange} disabled={btnHideFromViewser} /></div>
            </div>
          </div>

          <div className="col-md-12">
            <div className="col-md-6">
              <label className="col-sm-4 control-label small">Manufacturing Capability</label>
              <div className="col-sm-2"><input type="checkbox" name="s_manu_capa_check" checked={formData.s_manu_capa_check === '1'} onChange={handleChange} disabled={btnHideFromViewser} /></div>
            </div>
            <div className="col-md-6">
              <label className="col-sm-4 control-label small">Product Specification</label>
              <div className="col-sm-2"><input type="checkbox" name="s_prod_speci_check" checked={formData.s_prod_speci_check === '1'} onChange={handleChange} disabled={btnHideFromViewser} /></div>
            </div>
          </div>

          <div className="col-md-12">
            <div className="col-md-6">
              <label className="col-sm-4 control-label small">Site of Manufacture</label>
              <div className="col-sm-2"><input type="checkbox" name="s_site_of_manu_check" checked={formData.s_site_of_manu_check === '1'} onChange={handleChange} disabled={btnHideFromViewser} /></div>
            </div>
            <div className="col-md-6">
              <label className="col-sm-4 control-label small">Transportation Method</label>
              <div className="col-sm-2"><input type="checkbox" name="s_trans_method_check" checked={formData.s_trans_method_check === '1'} onChange={handleChange} disabled={btnHideFromViewser} /></div>
            </div>
          </div>

          <div className="col-md-12">
            <div className="col-md-6">
              <label className="col-sm-4 control-label small">Production Process</label>
              <div className="col-sm-2"><input type="checkbox" name="s_produ_process_check" checked={formData.s_produ_process_check === '1'} onChange={handleChange} disabled={btnHideFromViewser} /></div>
            </div>
            <div className="col-md-6">
              <label className="col-sm-4 control-label small">Others <small>(specify) Alternate Material</small></label>
              <div className="col-sm-2"><input type="checkbox" name="s_other_altr_check" checked={formData.s_other_altr_check === '1'} onChange={handleChange} disabled={btnHideFromViewser} /></div>
              {formData.s_other_altr_check === '1' && (
                <input type="text" name="s_other_altr_value" className="form-control input-sm" placeholder="Other (specify) Alternate Material" value={formData.s_other_altr_value} onChange={handleChange} disabled={btnHideFromViewser} />
              )}
            </div>
          </div>

          <div className="col-sm-12"><hr style={{ height: '2px', background: '#b5152b' }} /></div>

          <div className="col-sm-12">
            <div className="form-group">
              <label className="control-label col-sm-4"><small>Current Practice: (Specify what is the current practice)</small></label>
              <div className="col-sm-4">
                <textarea className="form-control input-sm" name="s_current_practice" placeholder="Current Practice..." value={formData.s_current_practice} onChange={handleChange} disabled={btnHideFromViewser} maxLength={5000} required />
              </div>
            </div>
          </div>

          <div className="col-sm-12">
            <div className="form-group">
              <label className="control-label col-sm-4"><small>New Practice: (Specify nature of change with relevant information)</small></label>
              <div className="col-sm-4">
                <textarea className="form-control input-sm" name="s_new_practice" placeholder="New Practice..." value={formData.s_new_practice} onChange={handleChange} disabled={btnHideFromViewser} maxLength={5000} required />
              </div>
            </div>
          </div>

          <div className="col-sm-12">
            <div className="form-group">
              <label className="control-label col-sm-4"><small>Associated Changes Required :</small></label>
              <div className="col-sm-4">
                <input className="form-control input-sm" type="text" name="s_associated_chang" placeholder="Associated Changes..." value={formData.s_associated_chang} onChange={handleChange} disabled={btnHideFromViewser} required />
              </div>
            </div>
          </div>

          <div className="col-sm-12">
            <div className="form-group">
              <label className="control-label col-sm-4"><h5>Remark :</h5></label>
              <div className="col-sm-4">
                <textarea className="form-control input-sm" name="s_recommendation" placeholder="Remark..." value={formData.s_recommendation} onChange={handleChange} disabled={btnHideFromViewser} maxLength={5000} required />
              </div>
            </div>
          </div>

          <div className="col-sm-12">
            <br />
            <label className="control-label col-sm-4">Release Date</label>
            <div className="col-sm-4">
              <input className="form-control input-sm" type="date" name="d_cif_reles_date" value={formData.d_cif_reles_date} onChange={handleChange} disabled={btnHideFromViewser} required />
            </div>
          </div>

          <div className="col-md-12">
            <label className="control-label"><span className='small' style={{color:'blue'}}>All the users need to amend necessary documents like SRD, BOM etc.</span></label>
            <hr />
          </div>

          <div className="col-md-12">
            <span className="pull-right">
              {!btnHideFromViewser && (
                <button type="button" className="btn btn-sm btn-success" onClick={onAddGate} disabled={isAddingGate}>Approved</button>
              )}
              <button type="button" className="btn btn-sm btn-default" onClick={() => window.history.back()} style={{ marginLeft: '10px' }}>Back</button>
            </span>
          </div>

        </div>
      </div>
    </div>
  );
}
