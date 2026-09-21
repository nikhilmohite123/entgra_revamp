import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { CniStandaloneLayout } from './components/CniStandaloneLayout';
import { CniLandingPage } from './pages/Landing/CniLandingPage';
import { RegulatoryDashboard } from './pages/Dashboard/RegulatoryDashboard';
import { StageGateDashboard } from './pages/Dashboard/StageGateDashboard';
import CreateProjectPage from './pages/Projects/Create/CreateProjectPage';
import Stage1Page from './pages/Projects/Stage1/Stage1Page';
import GateAPage from './pages/Projects/GateA/GateAPage';
import Stage2Page from './pages/Projects/Stage2/Stage2Page';
import GateBPage from './pages/Projects/GateB/GateBPage';
import Stage3Page from './pages/Projects/Stage3/Stage3Page';
import GateCPage from './pages/Projects/GateC/GateCPage';
import Stage4Page from './pages/Projects/Stage4/Stage4Page';
import GateDPage from './pages/Projects/GateD/GateDPage';
import Stage5Page from './pages/Projects/Stage5/Stage5Page';
import GateEPage from './pages/Projects/GateE/GateEPage';
import { AuditTrailPage } from './pages/AuditTrail/AuditTrailPage';
import { ProvisionalCifPage } from './pages/ProvisionalCif/ProvisionalCifPage';
import { CfiApprovalPage } from './pages/FinalCfi/CfiApprovalPage';
import { CniReportsPage } from './pages/Reports/CniReportsPage';
import { LogManagementPage } from './pages/Logs/LogManagementPage';
import { RegulatoryAuthorizePage } from './pages/RegulatoryAuthorize/RegulatoryAuthorizePage';
import { CniStageView } from './pages/HistoricalView/CniStageView';
import { LabOSLandingPage } from './pages/LabOS/LabOSLandingPage';
import { LabOSFormPage } from './pages/LabOS/LabOSFormPage';
import { LabOSProjectListPage } from './pages/LabOS/LabOSProjectListPage';
import { LabOSSummaryPage } from './pages/LabOS/LabOSSummaryPage';
import { LabOSAnalyticsPage } from './pages/LabOS/LabOSAnalyticsPage';

// Placeholders for Phase 4+ foundation
const Placeholder = ({ name }) => (
  <div style={{ padding: '2rem' }}>
    <h2>{name}</h2>
    <p>Foundation setup complete. Implementation pending next phase.</p>
  </div>
);

export function CniRoutes() {
  return (
    <Routes>
      <Route path="/" element={<CniStandaloneLayout />}>
        <Route index element={<CniLandingPage />} />
        <Route path="stages" element={<StageGateDashboard />} />
        <Route path="dashboard" element={<RegulatoryDashboard />} />
        <Route path="labos" element={<LabOSLandingPage />} />
        <Route path="labos/form" element={<LabOSFormPage />} />
        <Route path="labos/projects" element={<LabOSProjectListPage />} />
        <Route path="labos/summary" element={<LabOSSummaryPage />} />
        <Route path="labos/analytics" element={<LabOSAnalyticsPage />} />
      
      <Route path="projects">
        <Route path="create" element={<CreateProjectPage />} />
        <Route path=":projectId" element={<Placeholder name="CNI Project Details — Phase 5+" />} />
        <Route path=":projectId/status" element={<AuditTrailPage />} />
        <Route path=":projectId/status/:empId" element={<AuditTrailPage />} />
        
        {/* Stages */}
        <Route path=":projectId/stage/1" element={<Stage1Page />} />
        <Route path=":projectId/stage/2" element={<Stage2Page />} />
        <Route path=":projectId/stage/3" element={<Stage3Page />} />
        <Route path=":projectId/stage/4" element={<Stage4Page />} />
        <Route path=":projectId/stage/5" element={<Stage5Page />} />
        
        {/* Gates */}
        <Route path=":projectId/gate/A" element={<GateAPage />} />
        <Route path=":projectId/gate/B" element={<GateBPage />} />
        <Route path=":projectId/gate/C" element={<GateCPage />} />
        <Route path=":projectId/gate/D" element={<GateDPage />} />
        <Route path=":projectId/gate/E" element={<GateEPage />} />
        
        {/* Workflows */}
        <Route path=":projectId/audit-trail" element={<AuditTrailPage />} />
        <Route path=":projectId/provisional-cif" element={<ProvisionalCifPage />} />
        <Route path=":projectId/final-cfi" element={<CfiApprovalPage />} />
        <Route path=":projectId/final-cfi-approved" element={<CfiApprovalPage isApprovedView={true} />} />
        <Route path=":projectId/view-previous/:level" element={<CniStageView />} />
      </Route>
      
      <Route path="reports" element={<CniReportsPage />} />
      <Route path="logs" element={<LogManagementPage />} />
      <Route path="regulatory-authorize" element={<RegulatoryAuthorizePage />} />
      </Route>
    </Routes>
  );
}
