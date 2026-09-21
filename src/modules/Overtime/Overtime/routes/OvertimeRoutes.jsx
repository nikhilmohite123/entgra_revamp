import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import OvertimeIndexPage from '../pages/OvertimeIndexPage';
import OtRequisitionPage from '../pages/OtRequisitionPage';
import OtFixHourPage from '../pages/OtFixHourPage';
import OtReportPage from '../pages/OtReportPage';
import OtMasterPage from '../pages/OtMasterPage';
import OtApprovalDetailViewPage from '../pages/OtApprovalDetailViewPage';
import OtApprovalProcessPage from '../pages/OtApprovalProcessPage';

export default function OvertimeRoutes() {
  return (
    <Routes>
      <Route index element={<OvertimeIndexPage />} />
      <Route path="ot_main" element={<OvertimeIndexPage />} />
      <Route path="ot_requisition" element={<OtRequisitionPage />} />
      <Route path="ot_fixour_data" element={<OtFixHourPage />} />
      <Route path="ot_fixhour" element={<OtFixHourPage />} />
      <Route path="ot_report" element={<OtReportPage />} />
      <Route path="ot_master" element={<OtMasterPage />} />
      <Route path="ot_approvaldetailview" element={<OtApprovalDetailViewPage />} />
      <Route path="ot_detailview" element={<OtApprovalDetailViewPage />} />
      <Route path="employee_process_data" element={<OtApprovalProcessPage />} />
      <Route path="ot_approval_process" element={<OtApprovalProcessPage />} />
      <Route path="*" element={<Navigate to="" replace />} />
    </Routes>
  );
}
