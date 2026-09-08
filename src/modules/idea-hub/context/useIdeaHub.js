import { useContext } from 'react';
import IdeaHubContext from './IdeaHubContext';

export function useIdeaHub() {
  const context = useContext(IdeaHubContext);
  if (!context) {
    throw new Error('useIdeaHub must be used within an IdeaHubProvider');
  }
  return context;
}

export const useContest = useIdeaHub;

export default useIdeaHub;
