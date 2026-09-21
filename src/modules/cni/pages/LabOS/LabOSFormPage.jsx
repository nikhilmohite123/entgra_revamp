import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useLabOSForm } from '../../hooks/useLabOS';
import { LabOSMasterForm } from './components/LabOSMasterForm';
import { LabOSChildForm } from './components/LabOSChildForm';
import { LabOSChildTable } from './components/LabOSChildTable';
import { LabOSTestReport } from './components/LabOSTestReport';

export function LabOSFormPage() {
  const [searchParams] = useSearchParams();
  
  // Legacy exact parameters: ?id=X&status=Y&cat=Z
  const id = searchParams.get('id');
  const status = searchParams.get('status');
  const cat = searchParams.get('cat');
  
  const isExisting = !!(id && status && cat);

  // Load existing data if query params are present
  const { headerQuery, childrenQuery, reportQuery } = useLabOSForm(isExisting ? id : '', isExisting ? cat : '', []);

  // To trigger the reportQuery, we need the array of lp_ids from the children
  const [lpIds, setLpIds] = useState([]);
  
  useEffect(() => {
    if (childrenQuery.data?.data) {
      const ids = childrenQuery.data.data.map(child => child.n_lp_id);
      setLpIds(ids);
    }
  }, [childrenQuery.data]);

  // Edit State for Child Form
  const [editingChild, setEditingChild] = useState(null);

  // Logic to determine if header fields are editable (legacy logic: true until testing started)
  // We approximate this by checking if any child exists.
  const isTestingStarted = childrenQuery.data?.data?.length > 0;
  const isEditable = !isTestingStarted; // Simple approximation of is_child_editable for this phase

  // Construct default values for master form
  const masterDefaultValues = isExisting && headerQuery.data?.data ? {
    categories: headerQuery.data.data.s_categories?.toString() || '1',
    s_sample_type: headerQuery.data.data.s_sample_type || '',
    s_mat_code: headerQuery.data.data.s_mat_code || '',
    s_comm_mat_code: headerQuery.data.data.s_comm_mat_code || '',
    s_sample_desc: headerQuery.data.data.s_sample_desc || '',
    isTestingStarted,
    isEditable
  } : null;

  return (
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      
      {/* 1. Header Section */}
      <LabOSMasterForm 
        isExisting={isExisting} 
        defaultValues={masterDefaultValues} 
        matId={headerQuery.data?.data?.n_mat_id}
      />

      {isExisting && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          
          {/* 2. Child Lab Sample Form */}
          <div>
            <LabOSChildForm 
              matId={headerQuery.data?.data?.n_mat_id}
              lpId={editingChild?.n_lp_id}
              matCode={headerQuery.data?.data?.s_mat_code}
              defaultValues={editingChild}
              onCancelEdit={() => setEditingChild(null)}
            />
          </div>

          {/* 3. Existing Lab Samples Table */}
          <div>
            <LabOSChildTable 
              data={childrenQuery.data?.data}
              isLoading={childrenQuery.isLoading}
              isError={childrenQuery.isError}
              onEdit={setEditingChild}
              isEditable={true} // Child records should be editable regardless of Master form lock
            />
          </div>

        </div>
      )}

      {/* 4. Test Results Report */}
      {isExisting && (
        <LabOSTestReport 
          data={reportQuery.data?.data}
          isLoading={reportQuery.isLoading}
          isError={reportQuery.isError}
          lpIds={lpIds}
          headerData={headerQuery.data?.data}
        />
      )}

    </div>
  );
}
