import { useContext } from 'react';
import SamplePortalContext from './SamplePortalContext';

export function useSamplePortal() {
  const context = useContext(SamplePortalContext);
  if (!context) {
    throw new Error('useSamplePortal must be used within a SamplePortalProvider');
  }
  return context;
}

export default useSamplePortal;
