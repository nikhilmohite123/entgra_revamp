import React from 'react';
import { useParams, Navigate } from 'react-router-dom';

// Import all phase components
import Stage1Page from '../Projects/Stage1/Stage1Page';
import GateAPage from '../Projects/GateA/GateAPage';
import Stage2Page from '../Projects/Stage2/Stage2Page';
import GateBPage from '../Projects/GateB/GateBPage';
import Stage3Page from '../Projects/Stage3/Stage3Page';
import GateCPage from '../Projects/GateC/GateCPage';
import Stage4Page from '../Projects/Stage4/Stage4Page';
import GateDPage from '../Projects/GateD/GateDPage';
import { ProvisionalCifPage } from '../ProvisionalCif/ProvisionalCifPage';
import Stage5Page from '../Projects/Stage5/Stage5Page';
import GateEPage from '../Projects/GateE/GateEPage';
import { CfiApprovalPage } from '../FinalCfi/CfiApprovalPage';

export function CniStageView() {
  const { projectId, level } = useParams();

  // Route historical views strictly based on legacy level parameter mapping
  // We pass isViewOnly={true} to force the child component into a strict read-only state.
  switch (level) {
    case '0':
      return <Stage1Page isViewOnly={true} />;
    case '1G':
      return <GateAPage isViewOnly={true} />;
    case '2':
      return <Stage2Page isViewOnly={true} />;
    case '2G':
      return <GateBPage isViewOnly={true} />;
    case '3':
      return <Stage3Page isViewOnly={true} />;
    case '3G':
      return <GateCPage isViewOnly={true} />;
    case '4':
      return <Stage4Page isViewOnly={true} />;
    case '4G':
      return <GateDPage isViewOnly={true} />;
    case '4G-1':
      return <ProvisionalCifPage isViewOnly={true} />;
    case '5':
      return <Stage5Page isViewOnly={true} />;
    case '5G':
      return <GateEPage isViewOnly={true} />;
    case '7':
      return <CfiApprovalPage isApprovedView={true} isViewOnly={true} />;
    default:
      // Fallback
      return <Navigate to={`/cni/dashboard`} replace />;
  }
}
