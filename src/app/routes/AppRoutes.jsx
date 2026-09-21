
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';

import MainLayout from '../../layouts/MainLayout';
import AuthLayout from '../../layouts/AuthLayout';
import Login from '../../pages/Login';
import Main from '../../pages/main';

// Import only existing module routes

import { IdeahubRoutes } from '../../modules/idea-hub';
import { NpdRoutes } from '../../modules/NPD TOOL';
import { OvertimeRoutes } from '../../modules/Overtime';
import { AtrRoutes } from '../../modules/ATR';

// Protected Route checks localStorage validation
function ProtectedRoute() {
  const uid = localStorage.getItem('uid');
  const authUser = localStorage.getItem('auth_user');

  if (!uid && !authUser) {
    return <Navigate to="/auth/login" replace />;
  }

  return <Outlet />;
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* Protected Routes Wrapper */}
      <Route element={<ProtectedRoute />}>
        {/* Main Grid Portal */}
        <Route path="/main" element={<Main />} />

        {/* Standalone Modules (Dedicated Layout & Portal Views) */}
        <Route path="/idea_hub/*" element={<IdeahubRoutes />} />
        <Route path="/npd_tool/*" element={<NpdRoutes />} />
        <Route path="overtime/*" element={<OvertimeRoutes />} />
        <Route path="/atr/*" element={<AtrRoutes />} />

        {/* Backward-Compatible Redirects for Legacy / Direct ATR URLs */}
        <Route path="/bpmn/dashboard" element={<Navigate to="/atr" replace />} />
        <Route path="/atr_dashboard" element={<Navigate to="/atr" replace />} />
        <Route path="/atrform" element={<Navigate to="/atr/atrform" replace />} />
        <Route path="/bpmn/atrform" element={<Navigate to="/atr/atrform" replace />} />
        <Route path="/charts" element={<Navigate to="/atr/charts" replace />} />
        <Route path="/bpmn/charts" element={<Navigate to="/atr/charts" replace />} />
        <Route path="/uploadCSVfile" element={<Navigate to="/atr/uploadCSVfile" replace />} />
        <Route path="/uploadcsvfile" element={<Navigate to="/atr/uploadCSVfile" replace />} />
        <Route path="/bpmn/uploadCSVfile" element={<Navigate to="/atr/uploadCSVfile" replace />} />
        <Route path="/excel_view" element={<Navigate to="/atr/excel_view" replace />} />
        <Route path="/excel_download" element={<Navigate to="/atr/excel_download" replace />} />
        <Route path="/bpmn/excel_view" element={<Navigate to="/atr/excel_view" replace />} />

        {/* Backward-Compatible Redirects for Legacy / Direct NPD URLs */}
        <Route path="/npdtrack" element={<Navigate to="/npd_tool/npdtrack" replace />} />
        <Route path="/npdtrack_landing_page" element={<Navigate to="/npd_tool/npdtrack_landing_page" replace />} />
        <Route path="/npd_summary" element={<Navigate to="/npd_tool/npd_summary" replace />} />
        <Route path="/npd_dashboard" element={<Navigate to="/npd_tool/npd_dashboard" replace />} />
        <Route path="/mbr_dashboard" element={<Navigate to="/npd_tool/mbr_dashboard" replace />} />
        <Route path="/npdtrack_setting" element={<Navigate to="/npd_tool/npd_setting" replace />} />
        <Route path="/npd_setting" element={<Navigate to="/npd_tool/npd_setting" replace />} />
        <Route path="/npd_regional_admin" element={<Navigate to="/npd_tool/npd_regional_admin" replace />} />
        <Route path="/npd_reginal_admin_option" element={<Navigate to="/npd_tool/npd_regional_admin" replace />} />
        <Route path="/regional_admin" element={<Navigate to="/npd_tool/npd_regional_admin" replace />} />
        <Route path="/npdtrack_setting_regional" element={<Navigate to="/npd_tool/npd_regional_admin" replace />} />
        <Route path="/npdsinglepageprojectview" element={<Navigate to="/npd_tool/npdsinglepageprojectview" replace />} />
        <Route path="/single_project" element={<Navigate to="/npd_tool/npdsinglepageprojectview" replace />} />
        <Route path="/add_npd_program" element={<Navigate to="/npd_tool/add_npd_program" replace />} />
        <Route path="/npd_form" element={<Navigate to="/npd_tool/add_npd_program" replace />} />

        {/* Legacy BPMN Portal Redirects */}
        <Route path="/bpmn/npdtrack_landing_page" element={<Navigate to="/npd_tool/npdtrack_landing_page" replace />} />
        <Route path="/bpmn/idea-hub" element={<Navigate to="/idea_hub" replace />} />
        <Route path="/idea-hub/*" element={<Navigate to="/idea_hub" replace />} />


          {/* Backward-Compatible Redirects for Legacy / Direct Overtime URLs */}
        <Route path="/ot_main" element={<Navigate to="/overtime" replace />} />
        <Route path="/bpmn/ot_main" element={<Navigate to="/overtime" replace />} />
        <Route path="/ot_requisition" element={<Navigate to="/overtime/requisition" replace />} />
        <Route path="/bpmn/ot_requisition" element={<Navigate to="/overtime/requisition" replace />} />
        <Route path="/ot_fixour_data" element={<Navigate to="/overtime/fixhour" replace />} />
        <Route path="/bpmn/ot_fixour_data" element={<Navigate to="/overtime/fixhour" replace />} />
        <Route path="/ot_report" element={<Navigate to="/overtime/report" replace />} />
        <Route path="/bpmn/ot_report" element={<Navigate to="/overtime/report" replace />} />
        <Route path="/ot_master" element={<Navigate to="/overtime/master" replace />} />
        <Route path="/bpmn/ot_master" element={<Navigate to="/overtime/master" replace />} />
        <Route path="/ot_approvaldetailview" element={<Navigate to="/overtime/detail" replace />} />
        <Route path="/bpmn/ot_approvaldetailview" element={<Navigate to="/overtime/detail" replace />} />
        <Route path="/ot_detailview" element={<Navigate to="/overtime/detail" replace />} />
        <Route path="/bpmn/ot_detailview" element={<Navigate to="/overtime/detail" replace />} />
        <Route path="/employee_process_data" element={<Navigate to="/overtime/process" replace />} />
        <Route path="/bpmn/employee_process_data" element={<Navigate to="/overtime/process" replace />} />

        {/* Main Layout Wrapping Modules */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Navigate to="/main" replace />} />
         
          <Route path="idea_hub/*" element={<IdeahubRoutes />} />
          <Route path="npd_tool/*" element={<NpdRoutes />} />
            <Route path="overtime/*" element={<OvertimeRoutes />} />
          <Route path="atr/*" element={<AtrRoutes />} />
        </Route>
      </Route>

      {/* Authentication Layout Subviews */}
      <Route path="/auth" element={<AuthLayout />}>
        <Route index element={<Navigate to="/auth/login" replace />} />
        <Route path="login" element={<Login />} />
      </Route>

      {/* Fallback routing */}
      <Route path="*" element={<Navigate to="/main" replace />} />
    </Routes>
  );
}
