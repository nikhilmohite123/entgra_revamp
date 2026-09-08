import React, { memo } from 'react';
import Button from '../../../../../components/common/Button';

const SupplierVerificationForm = memo(({ email, onChangeEmail, loading, error, onSubmit }) => {
  return (
    <div className="glass-card" style={{ maxWidth: '400px', width: '100%', margin: '0 auto', padding: '2.5rem' }}>
      <h2 style={{ fontSize: '1.25rem', color: 'var(--primary)', marginBottom: '1.5rem', textAlign: 'center' }}>
        Supplier Authorization
      </h2>

      <p className="text-secondary" style={{ fontSize: '0.85rem', marginBottom: '1.5rem', textAlign: 'center' }}>
        Please enter your registered email address to access the CAPA form.
      </p>

      <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div className="form-group" style={{ marginBottom: 0 }}>
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
          <div style={{ color: 'var(--danger)', fontSize: '0.8rem', padding: '0.5rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: '6px' }}>
            {error}
          </div>
        )}

        <Button 
          type="submit" 
          variant="primary" 
          loading={loading} 
          disabled={loading}
          style={{ marginTop: '0.5rem', width: '100%' }}
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
