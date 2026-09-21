# CNI Route Mapping

## Summary
- **Legacy Routes Discovered**: 22
- **React Routes Mapped**: 22
- **Unmapped/Unknown Routes**: 0

| Legacy Route (Angular) | Legacy Controller | React Route (Proposed) | Migration Status |
| :--- | :--- | :--- | :--- |
| `/regulatory_dashboard` | (Implicit in view / `regulatory_dashboardCtrl`) | `/cni/dashboard` | DISCOVERED |
| `/CreateProject` | `CreateProjectCtrl` | `/cni/projects/create` | DISCOVERED |
| `/viewProject/:id` | `ViewInitiatorCtrl` | `/cni/projects/:projectId` | DISCOVERED |
| `/stageTbl` | `stageTblCtrl` | `/cni/stages` | DISCOVERED |
| `/status/:id` | `stageTblCtrl` | `/cni/projects/:projectId/status` | DISCOVERED |
| `/status/:id/:emp` | `stageTblCtrl` | `/cni/projects/:projectId/status/:empId` | DISCOVERED |
| `/stage1/:id` | `CNICtrl` | `/cni/projects/:projectId/stage/1` | DISCOVERED |
| `/gate1/:id` | `GateACtrl` | `/cni/projects/:projectId/gate/A` | DISCOVERED |
| `/stage2/:id` | `Stage2Ctrl` | `/cni/projects/:projectId/stage/2` | DISCOVERED |
| `/gate2/:id` | `GateBCtrl` | `/cni/projects/:projectId/gate/B` | DISCOVERED |
| `/stage3/:id` | `Stage3Ctrl` | `/cni/projects/:projectId/stage/3` | DISCOVERED |
| `/gate3/:id` | `GateCCtrl` | `/cni/projects/:projectId/gate/C` | DISCOVERED |
| `/stage4/:id` | `Stage4Ctrl` | `/cni/projects/:projectId/stage/4` | DISCOVERED |
| `/gate4/:id` | `GateDCtrl` | `/cni/projects/:projectId/gate/D` | DISCOVERED |
| `/stage5/:id` | `Stage5Ctrl` | `/cni/projects/:projectId/stage/5` | DISCOVERED |
| `/gate5/:id` | `GateECtrl` | `/cni/projects/:projectId/gate/E` | DISCOVERED |
| `/provisional_CIF/:id` | `Provisional_CIFCtrl` | `/cni/projects/:projectId/provisional-cif` | DISCOVERED |
| `/final-Cfi/:id` | `cfiApprovalCtrl` | `/cni/projects/:projectId/final-cfi` | DISCOVERED |
| `/final-Cif/:id` | `cfiApprovalCtrl` | (Duplicate of above) | DISCOVERED |
| `/final-Cif-Approved/:id` | `cfiApprovedCtrl` | `/cni/projects/:projectId/final-cfi-approved` | DISCOVERED |
| `/view-previous/:id` | `printOrVIewCNICtrl` | `/cni/projects/:projectId/view-previous` | DISCOVERED |
| `/cni-reports` | `CNIReportCtrl` | `/cni/reports` | DISCOVERED |

*Note: Some routes overlap in terminology (e.g., Cfi vs Cif). We will normalize these in the React implementation.*
