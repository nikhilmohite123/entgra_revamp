import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { verifySupplier } from '../../../services/supplierQualityService';
import { SUPPLIER_STATUS } from '../constants/supplierConstants';

// Basic email validation regex
const isEmailValid = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export function useSupplierAuthorization(nStatus, sNotiNo) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const abortControllerRef = useRef(null);

  // Cleanup pending requests on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const handleChangeEmail = useCallback((value) => {
    setEmail(value);
    if (error) setError('');
  }, [error]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      setError('Email address is required.');
      return;
    }

    if (!isEmailValid(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    setError('');

    // Abort outstanding requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      const payload = {
        s_email_id: email.trim(),
        s_noti_no: sNotiNo,
        n_status: nStatus,
      };

      const result = await verifySupplier(payload, abortControllerRef.current.signal);

      // Emulate legacy behavior
      if (!result || result.length === 0) {
        setError('Please Enter Right Credentials');
      } else if (
        result[0]?.n_status == SUPPLIER_STATUS.PENDING_AUTHORIZATION_1 || 
        result[0]?.n_status == SUPPLIER_STATUS.PENDING_AUTHORIZATION_2
      ) {
        // Success
        document.cookie = `supplier_id=${result[0].supplier_id || email}; path=/`;
        navigate('/quality_process/supplier-quality/capa-form'); // Placeholder route
      } else {
        // Condition where status doesn't match
        setError('Supplier Response Already Exist');
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err.message || 'Verification failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }, [email, nStatus, sNotiNo, navigate]);

  return {
    email,
    handleChangeEmail,
    loading,
    error,
    handleSubmit,
  };
}
