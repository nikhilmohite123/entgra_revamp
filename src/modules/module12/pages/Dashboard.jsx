import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Table from '../components/Table';
import Button from '../../../components/common/Button';
import Modal from '../../../components/common/Modal';
import { getDashboardStats } from '../../../services/api';
import { ArrowRight, CheckCircle, Clock, ShieldAlert } from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const [selectedRow, setSelectedRow] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const stats = getDashboardStats(12);

  const handleRowClick = (row) => {
    setSelectedRow(row);
    setIsModalOpen(true);
  };

  const getIcon = (iconName) => {
    switch (iconName) {
      case 'users': return <CheckCircle size={20} />;
      case 'cpu': return <Clock size={20} />;
      case 'activity': return <ArrowRight size={20} />;
      default: return <ShieldAlert size={20} />;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <Header />

      {/* Metrics Widgets */}
      <div className="stats-grid animate-fade-in">
        {stats.metrics.map((metric, idx) => (
          <div key={idx} className="glass-card stat-card">
            <div className="stat-icon">
              {getIcon(metric.icon)}
            </div>
            <div className="stat-info">
              <span className="stat-label">{metric.label}</span>
              <span className="stat-value">{metric.value}</span>
              <span style={{ fontSize: '0.75rem', color: metric.trend.startsWith('+') ? 'var(--success)' : 'var(--text-muted)' }}>
                {metric.trend} vs last week
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Action panel */}
      <div className="glass-card animate-fade-in" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Detailed Diagnostics</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Inspect historical execution metrics and configuration nodes.</p>
        </div>
        <Button variant="primary" onClick={() => navigate('details')}>
          View Detailed Telemetry <ArrowRight size={16} />
        </Button>
      </div>

      <Table onRowClick={handleRowClick} />

      {/* Resource Details Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Resource Parameters Inspector"
        footerActions={
          <>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Close</Button>
            <Button variant="primary" onClick={() => navigate('details')}>View Details</Button>
          </>
        }
      >
        {selectedRow && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: 600 }}>Resource:</span>
              <span>{selectedRow.name}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: 600 }}>Environment:</span>
              <span>{selectedRow.category}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: 600 }}>Hourly Cost:</span>
              <span>{selectedRow.value}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: 600 }}>Current Status:</span>
              <span className="badge badge-success">{selectedRow.status}</span>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
