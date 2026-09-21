import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useGateB } from '../../../hooks/useGateB';

const gateBSchema = z.object({
  s_recommendation: z.string().min(1, 'Required'),
  s_specified_check: z.string().optional(),
  s_edge_check: z.string().optional(),
  s_technical_check: z.string().optional(),
  s_inline_check: z.string().optional(),
  s_market_check: z.string().optional(),
});

export default function GateBPage() {
  const { projectId } = useParams();
  const { 
    item, attachments, materials, products, locations, gatebData,
    isLoading, isError,
    addGate, isAddingGate,
    scrapProject, isScrapping,
    shelveProject, isShelving,
    returnProject, isReturning,
    updateRecord, isUpdatingRecord
  } = useGateB(projectId);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(gateBSchema),
    defaultValues: {}
  });

  const [scopingValues, setScopingValues] = useState({});

  useEffect(() => {
    if (item) {
      let locationVal = item.s_project_location || '';
      if (item.s_action_perform === 'V&E' || item.s_action_perform === 'Edit') {
        if (typeof locationVal === 'string') {
          locationVal = locationVal.split(',').filter(Boolean);
        }
      }
      setScopingValues({
        ...item,
        s_project_location: locationVal,
        d_activation_date: item.d_activation_date ? new Date(item.d_activation_date).toISOString().split('T')[0] : '',
        d_target_date: item.d_target_date ? new Date(item.d_target_date).toISOString().split('T')[0] : '',
        d_dop_date: item.d_dop_date ? new Date(item.d_dop_date).toISOString().split('T')[0] : '',
      });

      // Default values for Gate B form
      reset({
        s_recommendation: gatebData?.s_recommendation || '',
        s_specified_check: gatebData?.s_specified_check || '0',
        s_edge_check: gatebData?.s_edge_check || '0',
        s_technical_check: gatebData?.s_technical_check || '0',
        s_inline_check: gatebData?.s_inline_check || '0',
        s_market_check: gatebData?.s_market_check || '0',
      });
    }
  }, [item, gatebData, reset]);

  if (isLoading) return <div>Loading Gate B...</div>;
  if (isError || !item) return <div>Error loading project.</div>;

  const isViewOrVE = item?.s_action_perform === 'View' || item?.s_action_perform === 'V&E';
  const btnHideFromViewser = isViewOrVE; // Hides Scrap/Hold/Send Back/Pass

  const uid = localStorage.getItem('loginId') || '';

  const onAddGate = async (gateData) => {
    try {
      // Map true/false back to "1"/"0" in case checkboxes yield booleans
      const mappedGateData = { ...gateData };
      ['s_specified_check', 's_edge_check', 's_technical_check', 's_inline_check', 's_market_check'].forEach(key => {
        if (typeof mappedGateData[key] === 'boolean') {
          mappedGateData[key] = mappedGateData[key] ? '1' : '0';
        }
      });
      const currentItem = { ...item, ...mappedGateData };
      await addGate({ currentItem });
    } catch (err) {
      alert("There was a server side error!");
    }
  };

  const onUpdateRecord = async (gateData) => {
    try {
      const mappedGateData = { ...gateData };
      ['s_specified_check', 's_edge_check', 's_technical_check', 's_inline_check', 's_market_check'].forEach(key => {
        if (typeof mappedGateData[key] === 'boolean') {
          mappedGateData[key] = mappedGateData[key] ? '1' : '0';
        }
      });
      const currentItem = { ...item, ...mappedGateData };
      await updateRecord({ currentItem });
    } catch (err) {
      alert("There was a server side error!");
    }
  };

  const onScrap = async () => {
    try {
      await scrapProject({ item, uid, id: projectId });
    } catch (err) {
      alert("There was a server side error!");
    }
  };

  const onShelve = async () => {
    try {
      await shelveProject({ item, uid, id: projectId });
    } catch (err) {
      alert("There was a server side error!");
    }
  };

  const onReturn = async () => {
    try {
      await returnProject({ item, uid, id: projectId });
    } catch (err) {
      alert("There was a server side error!");
    }
  };

  return (
    <div className="container">
      <div style={{ marginBottom: '20px' }}>
        <Link to={`/cni/projects/${projectId}/stage/2`}>
          <button type="button" className="btn btn-sm btn-info" style={{ marginRight: '10px' }}>Stage 2</button>
        </Link>
        <button type="button" className="btn btn-sm btn-info" disabled={true}>Gate 2</button>
      </div>

      <div className="form-horizontal">
        {/* Read-Only Stage 2 Form Elements */}
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
            Project Number :
            <input className="form-control input-sm" type="text" disabled value={scopingValues.s_new_project_id || ''} />
          </div>
          <div className="col-sm-6">
            Activation Date :
            <input className="form-control input-sm" type="date" disabled value={scopingValues.d_activation_date || ''} />
          </div>
          <div className="col-sm-6">
            DOP :
            <input className="form-control input-sm" type="date" disabled value={scopingValues.d_dop_date || ''} />
          </div>
          <div className="col-sm-6">
            Target Completion date :
            <input className="form-control input-sm" type="date" disabled value={scopingValues.d_target_date || ''} />
          </div>
          <div className="col-sm-6">
            Project Location :
            <select className="form-control input-sm" multiple disabled value={Array.isArray(scopingValues.s_project_location) ? scopingValues.s_project_location : []}>
              {locations.map(loc => (
                <option key={loc.N_LOCATION_ID} value={loc.N_LOCATION_ID.toString()}>{loc.S_LOCATION}</option>
              ))}
            </select>
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
                </tr>
              </thead>
              <tbody>
                {materials.map((m, i) => (
                  <tr key={i}>
                    <td>{m.s_material}</td>
                    <td>{m.s_source_code}</td>
                    <td>{m.s_lead_time_exi}</td>
                    <td>{m.s_price}</td>
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
                </tr>
              </thead>
              <tbody>
                {products.map((x, i) => (
                  <tr key={i}>
                    <td>{x.s_stage}</td>
                    <td>{x.s_station}</td>
                    <td>{x.s_similarity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="col-sm-6">
            Projected Capital Investment :
            <input className="form-control input-sm" type="text" disabled value={scopingValues.s_proj_cap_invest || ''} />
          </div>
          
          <div className="col-sm-6"></div>

          <div className="col-sm-6">
            Indicative Price and GC :
            <input className="form-control input-sm" type="text" disabled value={scopingValues.n_indicative_price || ''} />
          </div>

          <div className="col-sm-6">
            Pay Back Period If Capital Investment Required
            <input className="form-control input-sm" type="text" disabled value={scopingValues.n_pay_back_period || ''} />
          </div>

          <div className="col-sm-6">
            Market Sector / Projected Volume For Next 4 Year
            <input className="form-control input-sm" type="text" disabled value={scopingValues.s_market_sec_proj_vol || ''} />
          </div>

          <div className="col-sm-6">
            <span> CAPEX Required </span><br />
            <label>&nbsp;&nbsp;&nbsp;
              <input type="radio" value="Yes" disabled checked={scopingValues.s_capex === 'Yes'} /> Yes
            </label><br />
            <label>&nbsp;&nbsp;&nbsp;
              <input type="radio" value="No" disabled checked={scopingValues.s_capex === 'No'} /> No
            </label>
          </div>

          <div className="col-sm-6">
            <br />
            <strong>DOE : </strong>
            <ul style={{ paddingLeft: '20px' }}>
              {attachments.filter(x => x.s_attach_type === 'S2').map((x, i) => (
                <li key={i} style={{ padding: '8px 0' }}>
                  {x.s_ogi_name}
                  <a href={`/${x.s_path}/${x.s_new_name}`} target="_blank" rel="noreferrer" style={{ marginLeft: '10px' }}>
                    <span className="glyphicon glyphicon-download-alt"></span> Download
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Gate B Form */}
        <form onSubmit={handleSubmit(onAddGate)}>
          <div className="row">
            <div className="col-md-12">
              <hr style={{ height: '2px', background: '#b5152b' }} />
              <h4> GATE PASS </h4>
              <label><h5>Check list</h5></label>
            </div>

            <div className="col-md-12">
              {[
                { name: 's_specified_check', label: 'Specified And Intended Customers need met' },
                { name: 's_edge_check', label: 'Edge over competition' },
                { name: 's_technical_check', label: 'Technical gap / uncertainty low' },
                { name: 's_inline_check', label: 'Inline with ep business strategy & competence' },
                { name: 's_market_check', label: 'Market size and contribution attractive' },
              ].map((field) => (
                <div className="col-md-12" key={field.name}>
                  <label className="col-sm-8 control-label">{field.label}</label>
                  <div className="col-sm-4">
                    <input 
                      type="checkbox" 
                      value="1"
                      {...register(field.name)} 
                      onChange={(e) => {
                        const val = e.target.checked ? "1" : "0";
                        e.target.value = val;
                      }}
                    />
                    <br />
                  </div>
                </div>
              ))}
            </div>

            <div className="col-md-12">
              <div className="col-sm-6">
                <label className="control-label"> Remark</label>
                <textarea 
                  className="form-control input-sm" 
                  placeholder="Remark..." 
                  {...register('s_recommendation')}
                ></textarea>
                {errors.s_recommendation && <span style={{color: 'red'}}>{errors.s_recommendation.message}</span>}
              </div>
            </div>
          </div>
          
          <div className="col-md-12">
            <hr style={{ height: '2px', background: '#b5152b' }} />
            
            {!btnHideFromViewser && (
              <>
                <button type="button" className="btn btn-sm btn-danger" onClick={onScrap} disabled={isScrapping} style={{ marginRight: '10px' }}>Scrap</button>
                <button type="button" className="btn btn-sm btn-info" onClick={onShelve} disabled={isShelving} style={{ marginRight: '10px' }}>Hold</button>
                <button type="button" className="btn btn-sm btn-warning" onClick={onReturn} disabled={isReturning} style={{ marginRight: '10px' }}>Send Back</button>
                <button type="submit" className="btn btn-sm btn-success" disabled={isAddingGate} style={{ marginRight: '10px' }}>Pass To Stage 3</button>
              </>
            )}

            {item.s_action_perform === 'V&E' && (
              <button type="button" className="btn btn-sm btn-warning" onClick={handleSubmit(onUpdateRecord)} disabled={isUpdatingRecord} style={{ marginRight: '10px' }}>Update Record</button>
            )}

            <button type="button" className="btn btn-sm btn-default" onClick={() => window.history.back()}>Back</button>
          </div>
        </form>
      </div>
    </div>
  );
}
