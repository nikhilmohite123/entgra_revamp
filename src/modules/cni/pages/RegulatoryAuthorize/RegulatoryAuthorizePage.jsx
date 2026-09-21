import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRegulatoryAuth } from '../../hooks/useRegulatoryAuth';
import { regulatoryAuthApi } from '../../services/regulatoryAuthApi';
import { CniLoader } from '../../components/common';
import styles from '../../styles/cni.module.css';

export function RegulatoryAuthorizePage() {
  const navigate = useNavigate();
  const { employees, accessData, isLoading, saveAuthorization, isSubmitting } = useRegulatoryAuth();

  const [selectedUser, setSelectedUser] = useState('');
  const [showForm, setShowForm] = useState(false);

  // Form states
  const [permissions, setPermissions] = useState({
    India_Commercial_Laminates: false,
    Seamless_Plastic_Tubes: false,
    China_Laminates: false,
    Non_EPL_Laminates: false,
    CNI: false,
    report_filter: false,
    mainForm: false,
    Seamless_Plastic_Manpura: false
  });
  const [rwdAccess, setRwdAccess] = useState('');

  const fetchUserData = async (username) => {
    try {
      const data = await regulatoryAuthApi.getUsersData({ s_empname: username });
      const userRec = data?.[0] || {};
      
      setPermissions({
        India_Commercial_Laminates: !!userRec.s_India_Comm_Lami,
        Seamless_Plastic_Tubes: !!userRec.s_Seam_Plstc_Tube,
        China_Laminates: !!userRec.s_China_Lami,
        Non_EPL_Laminates: !!userRec.s_Non_EPL_Lami,
        CNI: !!userRec.s_Cni,
        report_filter: !!userRec.s_report,
        mainForm: !!userRec.s_mainForm,
        Seamless_Plastic_Manpura: !!userRec.s_Seam_Plstc_manpura,
      });
      setRwdAccess(userRec.s_readwritedelet || '');
    } catch (err) {
      console.error(err);
    }
  };

  const handleUserChange = (e) => {
    const val = e.target.value;
    setSelectedUser(val);
    if (val) {
      fetchUserData(val);
    } else {
      setPermissions({
        India_Commercial_Laminates: false,
        Seamless_Plastic_Tubes: false,
        China_Laminates: false,
        Non_EPL_Laminates: false,
        CNI: false,
        report_filter: false,
        mainForm: false,
        Seamless_Plastic_Manpura: false
      });
      setRwdAccess('');
    }
  };

  const handleCheckboxChange = (field) => {
    setPermissions(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!selectedUser) {
      alert("Please select an employee");
      return;
    }

    const payload = {
      s_empname: selectedUser,
      India_Commercial_Laminates: permissions.India_Commercial_Laminates ? 'India_Commercial_Laminates' : '',
      Seamless_Plastic_Tubes: permissions.Seamless_Plastic_Tubes ? 'Seamless_Plastic_Tubes' : '',
      China_Laminates: permissions.China_Laminates ? 'China_Laminates' : '',
      Non_EPL_Laminates: permissions.Non_EPL_Laminates ? 'Non_EPL_Laminates' : '',
      CNI: permissions.CNI ? 'CNI' : '',
      report_filter: permissions.report_filter ? 'report_filter' : '',
      mainForm: permissions.mainForm ? 'mainForm' : '',
      Seamless_Plastic_Manpura: permissions.Seamless_Plastic_Manpura ? 'Seamless_Plastic_Manpura' : '',
      RWD_acess: rwdAccess
    };

    try {
      await saveAuthorization(payload);
      alert("Records saved successfully");
      setShowForm(false);
    } catch (err) {
      alert("Failed to save: " + err.message);
    }
  };

  if (isLoading) return <CniLoader />;

  return (
    <div className={`container-fluid ${styles.pageContainer}`}>
      <div className="panel panel-default">
        <div className="panel-body">
          <h3>Authorize User List</h3>

          {!showForm ? (
            <div id="datalist">
              <button 
                type="button" 
                className="btn btn-sm btn-success pull-right" 
                onClick={() => setShowForm(true)}
              >
                Assign Module
              </button>
              <br /><br />
              <div className="table-responsive">
                <table className="table table-striped table-bordered">
                  <thead>
                    <tr>
                      <th>Employee Name</th>
                      <th>India Commercial Lami</th>
                      <th>Co-Ex tubes Wada</th>
                      <th>China Laminates</th>
                      <th>Non-EPL Laminates</th>
                      <th>CNI</th>
                      <th>Co-Ex tubes Manpura</th>
                      <th>Read/Write/Delete Access</th>
                    </tr>
                  </thead>
                  <tbody>
                    {accessData.map((row, i) => (
                      <tr key={i}>
                        <td>{row.s_emp_name}</td>
                        <td className="text-center">{row.s_India_Comm_Lami ? '✅' : '❌'}</td>
                        <td className="text-center">{row.s_Seam_Plstc_Tube ? '✅' : '❌'}</td>
                        <td className="text-center">{row.s_China_Lami ? '✅' : '❌'}</td>
                        <td className="text-center">{row.s_Non_EPL_Lami ? '✅' : '❌'}</td>
                        <td className="text-center">{row.s_Cni ? '✅' : '❌'}</td>
                        <td className="text-center">{row.s_Seam_Plstc_manpura ? '✅' : '❌'}</td>
                        <td className="text-center">{row.s_readwritedelet}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div id="authform">
              <form onSubmit={handleSave}>
                <div className="row">
                  <div className="col-sm-4 form-group">
                    <label>Select Employee:</label>
                    <select className="form-control" value={selectedUser} onChange={handleUserChange}>
                      <option value="">-- Select Employee --</option>
                      {employees.map((emp, i) => (
                        <option key={i} value={emp.S_LOGIN_ID}>{emp.S_LOGIN_ID}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-sm-4 form-group">
                    <label>Module Read/Write Access</label>
                    <select className="form-control" value={rwdAccess} onChange={(e) => setRwdAccess(e.target.value)}>
                      <option value="">Select Option</option>
                      <option value="Read">Read</option>
                      <option value="Write">Write</option>
                    </select>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-3 form-group">
                    <label>
                      <input 
                        type="checkbox"
                        checked={permissions.India_Commercial_Laminates}
                        onChange={() => handleCheckboxChange('India_Commercial_Laminates')}
                        style={{ marginRight: '5px' }}
                      />
                      India Commercial Laminates
                    </label>
                  </div>
                  <div className="col-md-3 form-group">
                    <label>
                      <input 
                        type="checkbox"
                        checked={permissions.Seamless_Plastic_Tubes}
                        onChange={() => handleCheckboxChange('Seamless_Plastic_Tubes')}
                        style={{ marginRight: '5px' }}
                      />
                      Co-Ex tubes Wada
                    </label>
                  </div>
                  <div className="col-md-3 form-group">
                    <label>
                      <input 
                        type="checkbox"
                        checked={permissions.China_Laminates}
                        onChange={() => handleCheckboxChange('China_Laminates')}
                        style={{ marginRight: '5px' }}
                      />
                      China Laminates
                    </label>
                  </div>
                  <div className="col-md-3 form-group">
                    <label>
                      <input 
                        type="checkbox"
                        checked={permissions.Non_EPL_Laminates}
                        onChange={() => handleCheckboxChange('Non_EPL_Laminates')}
                        style={{ marginRight: '5px' }}
                      />
                      Non-EPL Laminates
                    </label>
                  </div>
                </div>
                
                <div className="row">
                  <div className="col-md-3 form-group">
                    <label>
                      <input 
                        type="checkbox"
                        checked={permissions.CNI}
                        onChange={() => handleCheckboxChange('CNI')}
                        style={{ marginRight: '5px' }}
                      />
                      CNI
                    </label>
                  </div>
                  <div className="col-md-3 form-group">
                    <label>
                      <input 
                        type="checkbox"
                        checked={permissions.Seamless_Plastic_Manpura}
                        onChange={() => handleCheckboxChange('Seamless_Plastic_Manpura')}
                        style={{ marginRight: '5px' }}
                      />
                      Co-Ex tubes Manpura
                    </label>
                  </div>
                  <div className="col-md-3 form-group">
                    <label>
                      <input 
                        type="checkbox"
                        checked={permissions.mainForm}
                        onChange={() => handleCheckboxChange('mainForm')}
                        style={{ marginRight: '5px' }}
                      />
                      Add Master Data (Main Form)
                    </label>
                  </div>
                  <div className="col-md-3 form-group">
                    <label>
                      <input 
                        type="checkbox"
                        checked={permissions.report_filter}
                        onChange={() => handleCheckboxChange('report_filter')}
                        style={{ marginRight: '5px' }}
                      />
                      Report Section
                    </label>
                  </div>
                </div>

                <div className="row mt-4">
                  <div className="col-md-12 text-center" style={{ marginTop: '20px' }}>
                    <button type="button" className="btn btn-default mr-2" onClick={() => setShowForm(false)} style={{ marginRight: '10px' }}>Back</button>
                    <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                      {isSubmitting ? 'Saving...' : 'Save Authorization'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
