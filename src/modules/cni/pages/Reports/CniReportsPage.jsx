import React from 'react';
import { useNavigate } from 'react-router-dom';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { useReports } from '../../hooks/useReports';
import { CniLoader, CniError } from '../../components/common';
import styles from '../../styles/cni.module.css';

export function CniReportsPage() {
  const navigate = useNavigate();
  const { chartOptions, tableData, isLoading, isError, error } = useReports();

  if (isLoading) return <CniLoader />;
  if (isError) return <CniError message={error.message} />;

  return (
    <div className={`container-fluid ${styles.pageContainer}`}>
      <div className="row">
        <div className="col-md-12">
          {chartOptions && (
            <div id="chart2" style={{ marginTop: '20px' }}>
              <HighchartsReact
                highcharts={Highcharts}
                options={chartOptions}
              />
            </div>
          )}
        </div>
      </div>

      <div className="row" style={{ marginTop: '30px' }}>
        <div className="col-md-12">
          {tableData && (
            <table className="table table-bordered table-striped text-center">
              <thead>
                <tr>
                  <th>Stage/Gate</th>
                  <th>In Process</th>
                  <th>On Hold</th>
                  <th>Rejected</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><b>Stage 1/Gate A</b></td>
                  <td>{tableData.SG1.InProcess}</td>
                  <td>{tableData.SG1.OnHold}</td>
                  <td>{tableData.SG1.Rejected}</td>
                </tr>
                <tr>
                  <td><b>Stage 2/Gate B</b></td>
                  <td>{tableData.SG2.InProcess}</td>
                  <td>{tableData.SG2.OnHold}</td>
                  <td>{tableData.SG2.Rejected}</td>
                </tr>
                <tr>
                  <td><b>Stage 3/Gate C</b></td>
                  <td>{tableData.SG3.InProcess}</td>
                  <td>{tableData.SG3.OnHold}</td>
                  <td>{tableData.SG3.Rejected}</td>
                </tr>
                <tr>
                  <td><b>Stage 4/Gate D</b></td>
                  <td>{tableData.SG4.InProcess}</td>
                  <td>{tableData.SG4.OnHold}</td>
                  <td>{tableData.SG4.Rejected}</td>
                </tr>
                <tr>
                  <td><b>Stage 5/Gate E/Stage 5-A</b></td>
                  <td>{tableData.SG5.InProcess}</td>
                  <td>{tableData.SG5.OnHold}</td>
                  <td>{tableData.SG5.Rejected}</td>
                </tr>
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className="row">
        <div className="col-md-12 text-right">
          <button 
            type="button" 
            className="btn btn-default" 
            onClick={() => navigate('/cni/dashboard')}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
