import { useContext } from 'react';
import { WccContext } from './WccContext';

export function useWcc() {
  const context = useContext(WccContext);
  if (!context) {
    throw new Error('useWcc must be used within a WccProvider');
  }
  return context;
}
