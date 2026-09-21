import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useGateD } from '../../../hooks/useGateD';

export default function GateDPage() {
  const { projectId } = useParams();
  const { 
    item, gatedData, attch, tempFiles,
    isLoading, isError,
    addGate, isAddingGate,
    scrapProject, isScrapping,
    shelveProject, isShelving,
    returnProject, isReturning,
    updateRecord, isUpdatingRecord
  } = useGateD(projectId);

  const [formData, setFormData] = useState({
    s_recommendation: ''
  });

  useEffect(() => {
    if (gatedData) {
      setFormData({
        s_recommendation: gatedData.s_recommendation || ''
      });
    }
  }, [gatedData]);

  if (isLoading) return <div>Loading Gate D...</div>;
  if (isError || !item) return <div>Error loading project.</div>;

  const btnHideFromViewser = item.s_action_perform === 'View' || item.s_action_perform === 'V&E';
  const type = item.n_cust_select === 1 ? "(Customer Validation)" : "(Internal Validation)";

  const handleRecommendationChange = (e) => {
    setFormData(prev => ({ ...prev, s_recommendation: e.target.value }));
  };

  const getCurrentItem = () => {
    return {
      ...item,
      ...formData
    };
  };

  const onAddGate = async (s_level) => {
    if (!formData.s_recommendation) {
      alert("Remark is Required!!");
      return;
    }
    const type_cif = s_level === '5G' ? 'Final CIF' : 'Provisional CIF';
    if (window.confirm(`Do you wanto to proceed for ${type_cif} ?`)) {
      await addGate({ currentItem: getCurrentItem(), s_level });
    }
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

  const renderAttachments = (type) => {
    return (
      <>
        <ul className="w3-ul" style={{ paddingLeft: '20px' }}>
          {tempFiles.filter(x => x.s_attach_type === type).map(x => (
            <li key={`temp-${x.s_attach_id}`} style={{ padding: '8px 0' }}>
              <a href={`/${x.s_path}/${x.s_new_name}`}>{x.s_ogi_name}</a>
              {/* Note: In legacy Gate D, there is no remove button for temp files! */}
            </li>
          ))}
        </ul>
        <ul style={{ paddingLeft: '20px' }}>
          {attch.filter(x => x.s_attach_type === type).map(x => (
            <li key={`attch-${x.s_attach_id}`}>
              {x.s_ogi_name}
              <a href={`/${x.s_path}/${x.s_new_name}`} target="_blank" rel="noreferrer" style={{ marginLeft: '10px' }}>
                <span className="glyphicon glyphicon-download-alt">[Download]</span>
              </a>
            </li>
          ))}
        </ul>
      </>
    );
  };

  return (
    <div className="container">
      <div style={{ marginBottom: '20px' }}>
        <Link to={`/cni/projects/${projectId}/stage/4`}>
          <button type="button" className="btn btn-sm btn-info" style={{ marginRight: '10px' }}>Stage 4</button>
        </Link>
        <button type="button" className="btn btn-sm btn-info">Gate 4</button>
      </div>

      {/* Render S4 attachments identically to legacy logic just to view them, but in Gate D they actually rendered
          the full stage 4 view if show == 1. Wait, they just used the same file! 
          Let's just render the relevant attachments if needed, but the plan asked to verify "Correct display of temp + persistent files".
          Wait, in Gate D legacy view, the attachments are visible only if you click "Stage 4" tab! Gate 4 tab doesn't show attachments.
          Ah! In `stage4.html`, Gate D (`show == 2`) only has the "Remark" box!
          Wait! In `stage4.html` lines 493-558, `show == 2` renders:
          - GATE PASS (Customer Validation)
          - Remark textarea
          - Buttons (Scrap, Hold, Send Back, Provisional CIF, Final CIF, Update Record)
          The attachments are rendered under `show == 1`!
          But since we split the routes, we should probably render the Gate D view here, and rely on Stage 4 for attachments.
          However, to comply with the plan, I will display the S4 attachments here as read-only just in case, or maybe 
          I should adhere strictly to the HTML where `show == 2` does NOT have attachments. Let's look at lines 493-558 again.
          They are entirely in `<div ng-show="show == 2">`. 
          No attachments in Gate 4 tab!
          BUT wait, in my Phase 8 Implementation plan, I explicitly stated:
          "I will also fetch and display the persistent `/db/getProS4AttchById` array alongside the temp array for Gate D to emulate the legacy visual behavior."
          I'll add a read-only attachments section in Gate D to fulfill this, or just place it above.
      */}

      <div className="panel panel-default">
        <div className="panel-body">
          <h4> GATE PASS {type} </h4>
          <h4> For IB </h4>
          <div className="col-md-12">
            <div className="col-sm-6">
              <label className="control-label">Remark</label>
              <textarea 
                className="form-control input-sm" 
                name="rec" 
                placeholder="Remark"
                value={formData.s_recommendation}
                onChange={handleRecommendationChange}
                disabled={btnHideFromViewser && item.s_action_perform !== 'V&E'}
                maxLength={5000}
                required
              />
            </div>
          </div>
          <div className="col-md-12" style={{ marginTop: '20px' }}>
            <h5>Attachments Reference</h5>
            <div className="row">
              <div className="col-sm-6">
                <strong>Q.A Agreement</strong>
                {renderAttachments('S4-1')}
              </div>
              <div className="col-sm-6">
                <strong>Supply Agreement</strong>
                {renderAttachments('S4-2')}
              </div>
              <div className="col-sm-6">
                <strong>Customer feedback report</strong>
                {renderAttachments('S4-3')}
              </div>
              <div className="col-sm-6">
                <strong>Stability Study (Cancel Cheque)</strong>
                {renderAttachments('S4-4')}
              </div>
              <div className="col-sm-6">
                <strong>Other Attachment</strong>
                {renderAttachments('S4-5')}
              </div>
            </div>
          </div>
        </div>
      </div>

      <hr style={{ height: '2px', background: '#b5152b' }} />

      {!btnHideFromViewser && (
        <>
          <button type="button" className="btn btn-sm btn-danger" onClick={onScrap} disabled={isScrapping}>Scrap</button>
          <button type="button" className="btn btn-sm btn-info" onClick={onShelve} style={{ marginLeft: '10px' }} disabled={isShelving}>Hold</button>
          <button type="button" className="btn btn-sm btn-warning" onClick={onReturn} style={{ marginLeft: '10px' }} disabled={isReturning}>Send Back</button>
          <button type="button" className="btn btn-sm btn-primary" onClick={() => onAddGate('4G-1')} style={{ marginLeft: '10px' }} disabled={isAddingGate}>Provisional CIF</button>
          <button type="button" className="btn btn-sm btn-primary" onClick={() => onAddGate('5G')} style={{ marginLeft: '10px' }} disabled={isAddingGate}>Final CIF</button>
        </>
      )}

      {item.s_action_perform === 'V&E' && (
        <button type="button" className="btn btn-sm btn-warning" onClick={onUpdateRecord} style={{ marginLeft: '10px' }} disabled={isUpdatingRecord}>Update Record</button>
      )}

      <button type="button" className="btn btn-sm btn-default" onClick={() => window.history.back()} style={{ marginLeft: '10px' }}>Back</button>
    </div>
  );
}
