import React from 'react';

export default function Button({ 
  children, 
  variant = 'primary', 
  onClick, 
  loading = false, 
  disabled = false, 
  type = 'button',
  ...props 
}) {
  const isButtonDisabled = disabled || loading;
  const variantClass = variant === 'secondary' ? 'btn-secondary' : 'btn-primary';

  return (
    <button
      type={type}
      className={`btn ${variantClass} ${isButtonDisabled ? 'btn-disabled' : ''}`}
      onClick={onClick}
      disabled={isButtonDisabled}
      {...props}
    >
      {loading && <div className="loader-spinner" style={{ width: '14px', height: '14px', borderWidth: '2px' }} />}
      {children}
    </button>
  );
}
