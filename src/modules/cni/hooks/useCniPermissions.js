export function useCniPermissions() {
  // Read existing legacy roles mapped directly from localStorage
  const isAdmin = localStorage.getItem('isAdmin') === 'true';
  const cniHead = localStorage.getItem('cniHead') === 'true';
  const custAdmin = localStorage.getItem('cust_Admin') === 'true';
  const user = localStorage.getItem('loginId') || localStorage.getItem('empId');
  
  // These will eventually map to the /db/regulatoryAccess or /db/getverify endpoints,
  // or be verified against backend states. For now, they are foundation placeholders.
  const hasRegulatoryAccess = false; 
  const hasVerifyAccess = false;
  
  // Gate approval requires exact verification (UNKNOWN - REQUIRES REVIEW)
  const canApproveGate = (gate) => false; 

  return {
    isAdmin,
    cniHead,
    custAdmin,
    user,
    hasRegulatoryAccess,
    hasVerifyAccess,
    canApproveGate
  };
}
