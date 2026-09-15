import React, { memo } from 'react';
import Button from '../../../../../../components/common/Button';
import styles from './SupplierVerificationForm.module.css';

const SupplierVerificationForm = memo(({ email, onChangeEmail, loading, error, onSubmit }) => {
  return (
    <div className={`glass-card ${styles.formCard}`}>
      <h2 className={styles.formTitle}>
        Supplier Authorization
      </h2>

      <p className={`text-secondary ${styles.formDescription}`}>
        Please enter your registered email address to access the CAPA form.
      </p>

      <form onSubmit={onSubmit} className={styles.formContainer}>
        <div className={`form-group ${styles.formGroup}`}>
          <label className="form-label" htmlFor="supplier-email">Email Address</label>
          <input
            id="supplier-email"
            type="email"
            className="form-input"
            placeholder="e.g. supplier@company.com"
            value={email}
            onChange={(e) => onChangeEmail(e.target.value)}
            disabled={loading}
          />
        </div>

        {error && (
          <div className={styles.errorBox}>
            {error}
          </div>
        )}

        <Button 
          type="submit" 
          variant="primary" 
          loading={loading} 
          disabled={loading}
          className={`btn btn-primary ${styles.submitBtn}`}
        >
          {loading ? 'Verifying...' : 'Verify Credentials'}
        </Button>
      </form>
    </div>
  );
});

// Setting displayName for React DevTools (good practice for memo)
SupplierVerificationForm.displayName = 'SupplierVerificationForm';

export default SupplierVerificationForm;
