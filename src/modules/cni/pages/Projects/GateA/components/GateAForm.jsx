import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const gateASchema = z.object({
  s_owner: z.string().min(1, 'Required'),
  s_recommendation: z.string().min(1, 'Required'),
});

export default function GateAForm({ 
  item, pteam, setPteam, handleRemoveTeam, 
  onAddGate, onUpdateRecord, onScrap, onShelve,
  isAddingGate, isUpdatingRecord, isScrapping, isShelving 
}) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(gateASchema),
    defaultValues: {
      s_owner: item?.s_owner || '',
      s_recommendation: item?.s_recommendation || ''
    }
  });

  const [newTeamMember, setNewTeamMember] = useState({ s_project_team: '', s_dept: '' });

  const handleAddTeam = (e) => {
    e.preventDefault();
    if (!newTeamMember.s_project_team || !newTeamMember.s_dept) {
      alert("You missed Something!!");
      return;
    }
    setPteam([...pteam, newTeamMember]);
    setNewTeamMember({ s_project_team: '', s_dept: '' });
  };

  const isViewOrVE = item?.s_action_perform === 'View' || item?.s_action_perform === 'V&E';
  const btnHideFromViewser = !isViewOrVE; // Visible unless View or V&E

  return (
    <form className="form-horizontal">
      <div className="col-sm-12 form-group">
        <div className="row">
          <div className="col-sm-12">
            <h3>Gate Pass A</h3>
            <hr style={{ height: '2px', background: '#b5152b' }} />
          </div>

          <div className="col-sm-6">
            Owner :
            <input 
              className="form-control input-sm" 
              type="text" 
              placeholder="Owner name" 
              autoComplete="off"
              {...register('s_owner')}
            />
            {errors.s_owner && <span style={{color: 'red'}}>{errors.s_owner.message}</span>}
          </div>

          <div className="col-sm-6">
            Remark :
            <textarea 
              className="form-control input-sm" 
              placeholder="Remark" 
              {...register('s_recommendation')}
            ></textarea>
            {errors.s_recommendation && <span style={{color: 'red'}}>{errors.s_recommendation.message}</span>}
            <br />
          </div>

          <div className="col-md-12">
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th>Team Member</th>
                  <th>Department</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <input 
                      className="form-control input-sm" 
                      type="text" 
                      placeholder="User Name..."
                      value={newTeamMember.s_project_team}
                      onChange={(e) => setNewTeamMember({...newTeamMember, s_project_team: e.target.value})}
                    />
                  </td>
                  <td>
                    <input 
                      className="form-control input-sm" 
                      type="text" 
                      placeholder="Department..."
                      value={newTeamMember.s_dept}
                      onChange={(e) => setNewTeamMember({...newTeamMember, s_dept: e.target.value})}
                    />
                  </td>
                  <td>
                    <button className='btn btn-sm btn-primary' onClick={handleAddTeam}>+</button>
                  </td>
                </tr>
                {pteam.map((x, i) => (
                  <tr key={i}>
                    <td><label>{x.s_project_team}</label></td>
                    <td><label>{x.s_dept}</label></td>
                    <td>
                      <button className='btn btn-sm btn-danger' onClick={(e) => { e.preventDefault(); handleRemoveTeam(i, x); }}>X</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="col-sm-12">
            <hr style={{ height: '2px', background: '#b5152b' }} />
          </div>
        </div>

        {btnHideFromViewser && (
          <button type="button" className="btn btn-sm btn-danger" onClick={() => onScrap(item)} disabled={isScrapping} style={{ marginRight: '10px' }}>
            {isScrapping ? 'Scrapping...' : 'Scrap'}
          </button>
        )}
        
        {btnHideFromViewser && (
          <button type="button" className="btn btn-sm btn-info" onClick={() => onShelve(item)} disabled={isShelving} style={{ marginRight: '10px' }}>
            {isShelving ? 'Holding...' : 'Hold'}
          </button>
        )}

        {btnHideFromViewser && (
          <button type="button" className="btn btn-sm btn-success" onClick={handleSubmit(onAddGate)} disabled={isAddingGate} style={{ marginRight: '10px' }}>
            {isAddingGate ? 'Passing...' : 'Pass To Stage 2'}
          </button>
        )}

        {item?.s_action_perform === 'V&E' && (
          <button type="button" className="btn btn-sm btn-warning" onClick={handleSubmit(onUpdateRecord)} disabled={isUpdatingRecord} style={{ marginRight: '10px' }}>
            {isUpdatingRecord ? 'Updating...' : 'Update Record'}
          </button>
        )}

        <button type="button" className="btn btn-sm btn-default" onClick={() => window.history.back()}>
          Back
        </button>
      </div>
    </form>
  );
}
