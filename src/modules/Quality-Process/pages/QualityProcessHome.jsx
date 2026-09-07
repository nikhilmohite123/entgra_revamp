import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, ClipboardCheck, Truck } from 'lucide-react';
import Card from '../components/Card';
import styles from '../styles/qualityProcess.module.css';

export default function QualityProcessHome() {
  const navigate = useNavigate();

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <div className="page-container">
      <div className={`nav-title ${styles.navTitle}`}>
        Quality Process
      </div>
      
      <div className="dashboard-grid">
        <Card
          title="Customer Quality"
          description="Manage and track customer quality metrics, complaints, and satisfaction."
          icon={Users}
          onClick={() => handleNavigation('/quality_process/customer-quality')}
        />
        
        <Card
          title="HMP Audit"
          description="Conduct and review HMP audits to ensure compliance and standards."
          icon={ClipboardCheck}
          onClick={() => handleNavigation('/quality_process/hmp-audit')}
        />
        
        <Card
          title="Supplier Quality"
          description="Evaluate supplier performance and review quality compliance records."
          icon={Truck}
          onClick={() => handleNavigation('/quality_process/supplier-quality')}
        />
      </div>
    </div>
  );
}
