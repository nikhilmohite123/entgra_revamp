import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSupplierAuthorization } from '../hooks/useSupplierAuthorization';
import SupplierVerificationForm from '../components/authorization/SupplierVerificationForm';
import { SUPPLIER_STATUS } from '../constants/supplierConstants';
import styles from './SupplierAuthorizationPage.module.css';

export default function SupplierAuthorizationPage() {
  const [searchParams] = useSearchParams();
  
  const nStatus = searchParams.get('n_status') || searchParams.get('status');
  const sNotiNo = searchParams.get('s_noti_no') || searchParams.get('ncp');

  const showForm = 
    nStatus === SUPPLIER_STATUS.PENDING_AUTHORIZATION_1 || 
    nStatus === SUPPLIER_STATUS.PENDING_AUTHORIZATION_2;

  const { email, handleChangeEmail, loading, error, handleSubmit } = useSupplierAuthorization(nStatus, sNotiNo);

  return (
    <div className={styles.pageWrapper}>
      {showForm ? (
        <SupplierVerificationForm
          email={email}
          onChangeEmail={handleChangeEmail}
          loading={loading}
          error={error}
          onSubmit={handleSubmit}
        />
      ) : (
        <div className={`glass-card ${styles.successCard}`}>
          <h2 className={styles.successTitle}>
            Thanks for submitting!
          </h2>
          <p className={`text-secondary ${styles.successText}`}>
            Supplier Response Already Exists or is not pending verification.
          </p>
        </div>
      )}
    </div>
  );
}
