import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useGateC } from '../../../hooks/useGateC';

export default function GateCPage() {
  const { projectId } = useParams();
  const { 
    item, gatecData, materials, products,
    isLoading, isError,
    addGate, isAddingGate,
    scrapProject, isScrapping,
    shelveProject, isShelving,
    returnProject, isReturning,
    updateRecord, isUpdatingRecord
  } = useGateC(projectId);

  const [formData, setFormData] = useState({
    s_blow_check: '0',
    s_lam_check: '0',
    s_print_check: '0',
    s_tub_check: '0',
    s_lab_check: '0',
    s_reg_check: '0',
    s_recommendation: ''
  });

  useEffect(() => {
    if (gatecData) {
      setFormData({
        s_blow_check: gatecData.s_blow_check || '0',
        s_lam_check: gatecData.s_lam_check || '0',
        s_print_check: gatecData.s_print_check || '0',
        s_tub_check: gatecData.s_tub_check || '0',
        s_lab_check: gatecData.s_lab_check || '0',
        s_reg_check: gatecData.s_reg_check || '0',
        s_recommendation: gatecData.s_recommendation || ''
      });
    }
  }, [gatecData]);

  if (isLoading) return <div>Loading Gate C...</div>;
  if (isError || !item) return <div>Error loading project.</div>;

  const btnHideFromViewser = item.s_action_perform === 'View' || item.s_action_perform === 'V&E';

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked ? '1' : '0' }));
  };

  const handleRecommendationChange = (e) => {
    setFormData(prev => ({ ...prev, s_recommendation: e.target.value }));
  };

  const getCurrentItem = () => {
    return {
      ...item,
      ...formData
    };
  };

  const onAddGate = async () => {
    if (!formData.s_recommendation) {
      alert("Recommendation is Required!!");
      return;
    }
    await addGate({ currentItem: getCurrentItem(), s_level: 4 });
  };

  const onScrap = async () => {
    await scrapProject({ item: getCurrentItem(), uid: localStorage.getItem('loginId'), id: projectId });
  };

  const onShelve = async () => {
    await shelveProject({ item: getCurrentItem(), uid: localStorage.getItem('loginId'), id: projectId });
  };

  const onReturn = async () => {
    await returnProject({ item: getCurrentItem(), uid: localStorage.getItem('loginId'), id: projectId });
  };

  const onUpdateRecord = async () => {
    await updateRecord({ currentItem: getCurrentItem() });
  };

  return (
    <div className="container">
      <div style={{ marginBottom: '20px' }}>
        <Link to={`/cni/projects/${projectId}/stage/3`}>
          <button type="button" className="btn btn-sm btn-info" style={{ marginRight: '10px' }}>Stage 3</button>
        </Link>
        <button type="button" className="btn btn-sm btn-info">Gate 3</button>
      </div>

      <div className="panel panel-default">
        <div className="panel-body">
          <div className="col-md-6">
            <h4>GATE PASS</h4>
          </div>

          <div className="col-md-12">
            <label><h4>Stage Trial Are In Line With Assessment &lt; Target M/C and Materials:</h4></label>
          </div>

          <div className="col-md-12">
            <div className="col-md-12" style={{ marginBottom: '10px' }}>
              <label className="col-sm-8 control-label">Blowing</label>
              <div className="col-sm-4">
                <input type="checkbox" name="s_blow_check" checked={formData.s_blow_check === '1'} onChange={handleCheckboxChange} disabled={btnHideFromViewser} />
              </div>
            </div>
            <div className="col-md-12" style={{ marginBottom: '10px' }}>
              <label className="col-sm-8 control-label">Lamination</label>
              <div className="col-sm-4">
                <input type="checkbox" name="s_lam_check" checked={formData.s_lam_check === '1'} onChange={handleCheckboxChange} disabled={btnHideFromViewser} />
              </div>
            </div>
            <div className="col-md-12" style={{ marginBottom: '10px' }}>
              <label className="col-sm-8 control-label">Printing</label>
              <div className="col-sm-4">
                <input type="checkbox" name="s_print_check" checked={formData.s_print_check === '1'} onChange={handleCheckboxChange} disabled={btnHideFromViewser} />
              </div>
            </div>
            <div className="col-md-12" style={{ marginBottom: '10px' }}>
              <label className="col-sm-8 control-label">Tubing</label>
              <div className="col-sm-4">
                <input type="checkbox" name="s_tub_check" checked={formData.s_tub_check === '1'} onChange={handleCheckboxChange} disabled={btnHideFromViewser} />
              </div>
            </div>
            <div className="col-md-12" style={{ marginBottom: '10px' }}>
              <label className="col-sm-8 control-label">Lab Test Report Are In Line With End Requirement</label>
              <div className="col-sm-4">
                <input type="checkbox" name="s_lab_check" checked={formData.s_lab_check === '1'} onChange={handleCheckboxChange} disabled={btnHideFromViewser} />
              </div>
            </div>
            <div className="col-md-12" style={{ marginBottom: '10px' }}>
              <label className="col-sm-8 control-label">Regulatory</label>
              <div className="col-sm-4">
                <input type="checkbox" name="s_reg_check" checked={formData.s_reg_check === '1'} onChange={handleCheckboxChange} disabled={btnHideFromViewser} />
              </div>
            </div>
          </div>

          <div className="col-md-12">
            <div className="col-sm-6">
              <label className="control-label">Remark</label>
              <textarea 
                className="form-control input-sm" 
                placeholder="Remark..."
                value={formData.s_recommendation}
                onChange={handleRecommendationChange}
                disabled={btnHideFromViewser && item.s_action_perform !== 'V&E'}
                maxLength={5000}
                required
              />
            </div>
          </div>
        </div>
      </div>

      <hr style={{ height: '2px', background: '#b5152b' }} />

      {!btnHideFromViewser && (
        <>
          <button type="button" className="btn btn-danger" onClick={onScrap} disabled={isScrapping}>Scrap</button>
          <button type="button" className="btn btn-info" onClick={onShelve} style={{ marginLeft: '10px' }} disabled={isShelving}>Hold</button>
          <button type="button" className="btn btn-sm btn-warning" onClick={onReturn} style={{ marginLeft: '10px' }} disabled={isReturning}>Send Back</button>
          <button type="button" className="btn btn-success" onClick={onAddGate} style={{ marginLeft: '10px' }} disabled={isAddingGate}>Pass To Stage 4</button>
        </>
      )}

      {item.s_action_perform === 'V&E' && (
        <button type="button" className="btn btn-sm btn-warning" onClick={onUpdateRecord} style={{ marginLeft: '10px' }} disabled={isUpdatingRecord}>Update Record</button>
      )}

      <button type="button" className="btn btn-sm btn-default" onClick={() => window.history.back()} style={{ marginLeft: '10px' }}>Back</button>

    </div>
  );
}
