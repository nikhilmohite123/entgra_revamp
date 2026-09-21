import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useGateA } from '../../../hooks/useGateA';
import ProjectScopingFields from '../components/ProjectScopingFields';
import GateAForm from './components/GateAForm';

export default function GateAPage() {
  const { projectId } = useParams();
  const { 
    item, attachments, approvals, teamData,
    isLoading, isError,
    addGate, isAddingGate,
    updateRecord, isUpdatingRecord,
    scrapProject, isScrapping,
    shelveProject, isShelving,
    deleteGateRec
  } = useGateA(projectId);

  const [pteam, setPteam] = useState([]);

  // Initialize team data from server
  useEffect(() => {
    if (teamData) {
      setPteam(teamData);
    }
  }, [teamData]);

  // Read-only staging form using react-hook-form purely to render values
  const { register } = useForm({ defaultValues: {} });
  
  const [scopingValues, setScopingValues] = useState({});

  useEffect(() => {
    if (item) {
      // In Gate A, the view is completely read-only for Stage 1. 
      // We pass the string verbatim if not V&E.
      let segment = item.s_target_market_seg || '';
      if (item.s_action_perform === 'V&E' && typeof segment === 'string') {
        segment = segment.split(',').filter(Boolean);
      }
      setScopingValues({
        ...item,
        s_target_market_seg: segment,
      });
    }
  }, [item]);

  if (isLoading) return <div>Loading Gate A...</div>;
  if (isError || !item) return <div>Error loading project.</div>;

  const isVAndE = item.s_action_perform === 'V&E';
  // Note: in GateACtrl.js, nonEdit_STAGE1 = true for V&E and View. 
  // However, ProjectScopingFields is passed isReadOnly=true entirely for Gate A to prevent mutations to Stage 1 data.
  
  const uid = localStorage.getItem('loginId') || '';

  const handleRemoveTeam = async (index, x) => {
    if (x.s_gate_a_id) {
      try {
        await deleteGateRec(x);
      } catch (err) {
        alert("Error deleting record");
      }
    } else {
      const newTeam = [...pteam];
      newTeam.splice(index, 1);
      setPteam(newTeam);
    }
  };

  const onAddGate = async (gateData) => {
    try {
      const combinedItem = { ...item, ...gateData }; // Merge gate data into item
      await addGate({ item: combinedItem, proTeam: pteam });
    } catch (err) {
      alert("There was a server side error!");
    }
  };

  const onUpdateRecord = async (gateData) => {
    try {
      const combinedItem = { ...item, ...gateData };
      await updateRecord({ item: combinedItem, proTeam: pteam });
    } catch (err) {
      alert("There was a server side error!");
    }
  };

  const onScrap = async (currentItem) => {
    try {
      await scrapProject({ item: currentItem, uid, id: projectId });
    } catch (err) {
      alert("There was a server side error!");
    }
  };

  const onShelve = async (currentItem) => {
    try {
      await shelveProject({ item: currentItem, uid, id: projectId });
    } catch (err) {
      alert("There was a server side error!");
    }
  };

  // Create a mock register function for ProjectScopingFields since it's strictly read-only
  const readOnlyRegister = (name) => {
    return {
      name,
      value: scopingValues[name] || (Array.isArray(scopingValues[name]) ? [] : ''),
      onChange: () => {},
      onBlur: () => {}
    };
  };

  return (
    <div className="container">
      <div style={{ marginBottom: '20px' }}>
        <Link to={`/cni/projects/${projectId}/stage/1`}>
          <button type="button" className="btn btn-sm btn-info" style={{ marginRight: '10px' }}>Stage 1</button>
        </Link>
        <button type="button" className="btn btn-sm btn-default" disabled={true}>Gate A</button>
      </div>

      <div className="clearfix panel-body">
        {/* Render the Read-Only Stage 1 Data */}
        <div className="row">
          <div className="col-sm-12">
            <h3>Product Scoping</h3>
            <div className="col-sm-3">EP/DOC/NO : <b>{item.s_code}</b></div>
            <div className="col-sm-3">Issue Date: <b>{item.s_issue_date}</b></div>
            <div className="col-sm-3">Revision no : <b>{item.s_doc_id}</b></div>
            <div className="col-sm-3">Revision Date : <b>{item.s_revision_date}</b></div>
            <div className="col-sm-3">Initiator : <b>{item.s_initiator}</b></div>
          </div>
          <div className="col-sm-12"><hr style={{ height: '2px', background: '#b5152b' }} /></div>
          
          <ProjectScopingFields 
            register={readOnlyRegister} 
            errors={{}} 
            isReadOnly={true} 
            isVAndE={isVAndE}
            legacyTargetSegment={typeof item.s_target_market_seg === 'string' ? item.s_target_market_seg : ''}
          />
        </div>

        {/* Gate A Specific Form */}
        <GateAForm 
          item={item}
          pteam={pteam}
          setPteam={setPteam}
          handleRemoveTeam={handleRemoveTeam}
          onAddGate={onAddGate}
          onUpdateRecord={onUpdateRecord}
          onScrap={onScrap}
          onShelve={onShelve}
          isAddingGate={isAddingGate}
          isUpdatingRecord={isUpdatingRecord}
          isScrapping={isScrapping}
          isShelving={isShelving}
        />
      </div>
    </div>
  );
}
