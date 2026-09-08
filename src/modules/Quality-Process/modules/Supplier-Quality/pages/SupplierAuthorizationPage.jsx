import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSupplierAuthorization } from '../hooks/useSupplierAuthorization';
import SupplierVerificationForm from '../components/authorization/SupplierVerificationForm';
import { SUPPLIER_STATUS } from '../constants/supplierConstants';

export default function SupplierAuthorizationPage() {
  const [searchParams] = useSearchParams();
  
  // Extracting query params matching legacy URL structure
  const nStatus = searchParams.get('n_status') || searchParams.get('status');
  const sNotiNo = searchParams.get('s_noti_no') || searchParams.get('ncp');

  const showForm = 
    nStatus === SUPPLIER_STATUS.PENDING_AUTHORIZATION_1 || 
    nStatus === SUPPLIER_STATUS.PENDING_AUTHORIZATION_2;

  const { email, handleChangeEmail, loading, error, handleSubmit } = useSupplierAuthorization(nStatus, sNotiNo);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-primary)' }}>
      {showForm ? (
        <SupplierVerificationForm
          email={email}
          onChangeEmail={handleChangeEmail}
          loading={loading}
          error={error}
          onSubmit={handleSubmit}
        />
      ) : (
        <div className="glass-card" style={{ maxWidth: '400px', width: '100%', margin: '0 auto', padding: '3rem', textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.25rem', color: 'var(--success)', marginBottom: '1rem' }}>
            Thanks for submitting!
          </h2>
          <p className="text-secondary" style={{ fontSize: '0.9rem' }}>
            Supplier Response Already Exists or is not pending verification.
          </p>
        </div>
      )}
    </div>
  );
}
