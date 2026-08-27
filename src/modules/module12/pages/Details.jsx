import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Button from '../../../components/common/Button';
import { ArrowLeft, Server, Activity } from 'lucide-react';
import { getDashboardStats } from '../../../services/api';

export default function Details() {
  const navigate = useNavigate();
  const telemetry = getDashboardStats(12).telemetry;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="glass-card animate-fade-in" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.5rem' }}>
        <Button variant="secondary" onClick={() => navigate(-1)} style={{ padding: '0.5rem' }}>
          <ArrowLeft size={16} />
        </Button>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Telemetry Logs for Dev Console</h3>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        <div className="glass-card animate-fade-in">
          <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--primary)' }}>
            <Server size={18} /> Node Status
          </h4>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
            Primary server cluster for module 12 is routing requests on active node clusters. Active endpoints are verified with 0% dropped packets.
          </p>
        </div>
        <div className="glass-card animate-fade-in">
          <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--secondary)' }}>
            <Activity size={18} /> System Checksums
          </h4>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
            Health checksum validated: <strong>0x9F3E12B</strong>. Secure sockets layer verified. All configurations comply with active access profiles.
          </p>
        </div>
      </div>

      <div className="glass-card animate-fade-in">
        <h4 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem' }}>Telemetry Live Events Queue</h4>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Event ID</th>
                <th>Diagnostic Event Description</th>
                <th>Time</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {telemetry.map((log) => (
                <tr key={log.id}>
                  <td><code>{log.id}</code></td>
                  <td>{log.event}</td>
                  <td>{log.timestamp}</td>
                  <td>
                    <span className={`badge badge-${log.severity}`}>{log.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
