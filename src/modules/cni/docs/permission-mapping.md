# CNI Permission Mapping

## Summary
- **Permission rules discovered**: 7 (Partial List)

| Legacy Role / Check | Origin (LocalStorage/DB) | Proposed React Hook / Service | Migration Status |
| :--- | :--- | :--- | :--- |
| `isAdmin` | LocalStorage (`$rootScope.isAdmin`) | `useAuth().isAdmin` | DISCOVERED |
| `cniHead` | LocalStorage (`$rootScope.cniHead`) | `useAuth().cniHead` | DISCOVERED |
| `cust_Admin` | LocalStorage (`$rootScope.cust_Admin`) | `useAuth().custAdmin` | DISCOVERED |
| `empId` / `loginId` | LocalStorage | `useAuth().user` | DISCOVERED |
| `/db/regulatoryAccess` | DB (checked in Dashboard) | `useCniPermissions().hasRegulatoryAccess` | DISCOVERED |
| `/db/getverify` | DB | `useCniPermissions().hasVerifyAccess` | DISCOVERED |
| `Gate approvals` | Specific role required (TBD) | `useGatePermissions(stage)` | UNKNOWN — REQUIRES REVIEW |

*Note: The frontend currently relies heavily on LocalStorage for role checks (`isAdmin`, `cniHead`). We will map these to our `useAuth` hook in React.*
