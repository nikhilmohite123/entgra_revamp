import React from 'react';
import DataTable from '../../../components/common/DataTable';
import { getModuleTableData } from '../../../services/api';

export default function Table({ onRowClick }) {
  const data = getModuleTableData(11);
  const headers = [
    { key: 'id', label: 'Resource ID' },
    { key: 'name', label: 'Resource Name' },
    { key: 'category', label: 'Environment' },
    { key: 'value', label: 'Cost Rate' },
    { key: 'status', label: 'Status' }
  ];

  return (
    <div className="glass-card animate-fade-in">
      <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem' }}>Active Resources List</h3>
      <DataTable 
        headers={headers} 
        data={data} 
        searchPlaceholder="Search resources..."
        onRowClick={onRowClick}
      />
    </div>
  );
}
