# CNI API Mapping

## Summary
- **API Endpoints Discovered**: 40+
- **API Services Mapped**: 40+

| Legacy Controller | Legacy API Endpoint (POST) | Proposed React Hook / Service | Migration Status |
| :--- | :--- | :--- | :--- |
| `regulatory_dashboardCtrl` | `/db/getAllRecord` | `dashboardApi.getAll()` | Partially mapped (Phase 0) |
| `regulatory_dashboardCtrl` | `/db/getFilterAllRecord` | `dashboardApi.getFiltered()` | Partially mapped (Phase 0) |
| `regulatory_dashboardCtrl` | `/uploadRegltryDocmnt` | `dashboardApi.uploadDocument()` | Discovered Phase 3, multipart/FormData |
| `regulatory_dashboardCtrl` | `/db/getverify` | `dashboardApi.getVerify()` | Discovered Phase 3, fire-and-forget auth/track |
| `regulatory_dashboardCtrl` | `/db/removefile` | `dashboardApi.removeFile()` | Partially mapped (Phase 0) |
| `regulatory_dashboardCtrl` | `/db/editfile` | `dashboardApi.editFile()` | Partially mapped (Phase 0) |
| `regulatory_dashboardCtrl` | `/db/regulatoryAccess` | `dashboardApi.getAccess()` | Partially mapped (Phase 0) |
| `regulatory_dashboardCtrl` | `/db/clickOn_tds` | `dashboardApi.getTdsClick()` | Discovered Phase 3, click tracker |
| `regulatory_dashboardCtrl` | `/db/clickOn_GhsSds` | `dashboardApi.getGhsSdsClick()` | Discovered Phase 3, click tracker |
| `CreateProjectCtrl.js` | `/db/createNewProject` | `useCreateProject()` / `projectApi.create()` | DISCOVERED |
| `CreateProjectCtrl.js` | `/db/getTempFileInStage1` | `useTempFiles(stage1)` / `projectApi.getTempFiles()` | DISCOVERED |
| `CreateProjectCtrl.js` | `/db/deleteTempFileInStage1` | `useDeleteTempFile()` / `projectApi.deleteTempFile()` | DISCOVERED |
| `CNICtrl.js` (Stage 1) | `/db/getProById` | `useProject(id)` / `projectApi.getById()` | DISCOVERED |
| `CNICtrl.js` (Stage 1) | `/db/getProS1AttchById` | `useStageAttachments(1)` / `stageApi.getAttachments()` | DISCOVERED |
| `CNICtrl.js` (Stage 1) | `/db/getApprovelDetetail` | `useApprovalDetails()` / `stageApi.getApprovalDetails()` | DISCOVERED |
| `CNICtrl.js` (Stage 1) | `/db/Updatestage1Remark` | `useUpdateRemark()` / `stageApi.updateRemark()` | DISCOVERED |
| `CNICtrl.js` (Stage 1) | `/db/goAheadByCNIHead` | `useGoAhead()` / `stageApi.goAhead()` | DISCOVERED |
| `Stage2Ctrl.js` | `/db/updateProStage2` | `useUpdateStage2()` / `stageApi.updateStage2()` | DISCOVERED |
| `Stage2Ctrl.js` | `/db/addProjectDetail` | `useAddProjectDetail()` / `stageApi.addProjectDetail()` | DISCOVERED |
| `Stage3Ctrl.js` | `/db/updateProStage3` | `useUpdateStage3()` / `stageApi.updateStage3()` | DISCOVERED |
| `Stage3Ctrl.js` | `/db/getRawMaterialListById` | `useRawMaterialList()` / `stageApi.getRawMaterialList()` | DISCOVERED |
| `Stage4Ctrl.js` | `/db/updateProStage4` | `useUpdateStage4()` / `stageApi.updateStage4()` | DISCOVERED |
| `Stage4Ctrl.js` | `/db/addCustVDetail` | `useAddCustVDetail()` / `stageApi.addCustVDetail()` | DISCOVERED |
| `Stage5Ctrl.js` | `/db/updateProStage5` | `useUpdateStage5()` / `stageApi.updateStage5()` | DISCOVERED |
| `Stage5Ctrl.js` | `/db/getGate5ApprvalsDetails`| `useGateApprovals(5)` / `stageApi.getGateApprovals()` | DISCOVERED |
| `GateACtrl.js` | `/db/getGateADetailById` | `useGateData('A')` / `gateApi.getGateA()` | DISCOVERED |
| `GateACtrl.js` | `/db/addGateA` | `useSubmitGateA()` / `gateApi.submitGateA()` | DISCOVERED |
| `GateBCtrl.js` | `/db/getGateBDetailById` | `useGateData('B')` / `gateApi.getGateB()` | DISCOVERED |
| `GateBCtrl.js` | `/db/addGateB` | `useSubmitGateB()` / `gateApi.submitGateB()` | DISCOVERED |
| `GateCCtrl.js` | `/db/getGateCDetailById` | `useGateData('C')` / `gateApi.getGateC()` | DISCOVERED |
| `GateCCtrl.js` | `/db/addGateC` | `useSubmitGateC()` / `gateApi.submitGateC()` | DISCOVERED |
| `GateDCtrl.js` | `/db/getGateDDetailById` | `useGateData('D')` / `gateApi.getGateD()` | DISCOVERED |
| `GateDCtrl.js` | `/db/addGateD` | `useSubmitGateD()` / `gateApi.submitGateD()` | DISCOVERED |
| `GateECtrl.js` | `/db/addGateEDetail` | `useSubmitGateE()` / `gateApi.submitGateE()` | DISCOVERED |
| *Common/Shared* | `/db/updateProStagelevel` | `useUpdateStageLevel()` / `gateApi.updateLevel()` | DISCOVERED |
| *Common/Shared* | `/db/deleteGateRec` | `useDeleteGateRecord()` / `gateApi.deleteRecord()` | DISCOVERED |
| *Common/Shared* | `/db/scrapProject` | `useScrapProject()` / `projectApi.scrap()` | DISCOVERED |
| *Common/Shared* | `/db/shelveProject` | `useShelveProject()` / `projectApi.shelve()` | DISCOVERED |
| *Common/Shared* | `/db/returnProject` | `useReturnProject()` / `projectApi.returnProject()` | DISCOVERED |
| `cfiApprovalCtrl.js` | `/db/cfiProjectById` | `useCfiProject(id)` / `projectApi.getCfiProject()` | DISCOVERED |
| `cfiApprovalCtrl.js` | `/db/ApprovedCFIProjectById` | `useApprovedCfi(id)` / `projectApi.getApprovedCfi()` | DISCOVERED |
| `cfiApprovalCtrl.js` | `/db/getCNIStageFileInTable` | `useStageFiles()` / `stageApi.getStageFiles()` | DISCOVERED |
| `cfiApprovalCtrl.js` | `/db/deleteStageFileInStage` | `useDeleteStageFile()` / `stageApi.deleteStageFile()` | DISCOVERED |
| `CNIReportCtrl.js` | `/db/get_project_name` | `useProjectNames()` / `reportApi.getProjectNames()` | DISCOVERED |
| *Common/Shared* | `/db/getEpmDetail` | `useEpmDetails()` / `apiClient.getEpm()` | DISCOVERED |
| *Common/Shared* | `/db/getEpmDetailByEmpId` | `useEpmDetails(empId)` / `apiClient.getEpmByEmpId()` | DISCOVERED |
