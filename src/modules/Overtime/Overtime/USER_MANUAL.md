# Overtime (OT) Module - User Manual & Workflow Documentation

## 1. Introduction & Objectives

The **Overtime (OT) Module** in the Entgra platform provides an enterprise solution to record, authorize, audit, and analyze employee overtime hours across various plants, regions, and departments.

### Key Capabilities:
- **Statutory Limits Compliance**: Automatically tracks weekly, monthly, and quarterly overtime limits per employee and flags threshold breaches.
- **Multi-Level Approval Hierarchy**: Enforces strict sequential approvals: **HOD &rarr; Unit Head &rarr; Unit HR / HC Manager**.
- **Transparent Audit Trail**: Full visibility into each approver's action, decision timestamp, and rejection reasons.
- **Bulk CSV Ingestion**: Fast bulk upload of employee-to-supervisor mappings.
- **Operational Reporting**: Filterable reports with Excel/CSV export and copy-to-clipboard functionality for payroll reconciliation.

---

## 2. System Architecture & Routes

| Route | Component | Purpose |
| :--- | :--- | :--- |
| `/overtime` or `/overtime/ot_main` | `OvertimeIndexPage` | Main portal dashboard (My Created & Pending Approvals) |
| `/overtime/ot_requisition` | `OtRequisitionPage` | Overtime requisition creation form |
| `/overtime/ot_fixhour` / `ot_fixour_data` | `OtFixHourPage` | Overtime limit configuration (Super Admin only) |
| `/overtime/ot_report` | `OtReportPage` | Operational overtime reporting & Excel/CSV export |
| `/overtime/ot_master` | `OtMasterPage` | Employee directory & CSV bulk upload |
| `/overtime/employee_process_data` | `OtApprovalProcessPage` | Actionable approval interface for supervisors |
| `/overtime/ot_detailview` | `OtApprovalDetailViewPage` | Read-only inspection of application & audit trail |

*Note: Backward-compatible redirects exist in `AppRoutes.jsx` for all legacy URLs (e.g. `/ot_main`, `/ot_requisition`, `/ot_fixhour`, `/ot_report`, `/ot_master`, `/employee_process_data`).*

---

## 3. Roles & Sequential Approval Workflow

```
[Employee Overtime Claim Created]
               │
               ▼
   [Tier 1: Department Head (HOD)]
      ├── Reject ──> [Cascaded Rejection with Reason]
      └── Accept ──> [Forward to Unit Head]
               │
               ▼
     [Tier 2: Unit Head]
      ├── Reject ──> [Cascaded Rejection with Reason]
      └── Accept ──> [Forward to Unit HR]
               │
               ▼
  [Tier 3: Unit HR / HC Manager]
      ├── Reject ──> [Cascaded Rejection with Reason]
      └── Accept ──> [Final Approval for Payroll Processing]
```

### Hierarchy Rules:
1. **Unit Head** cannot approve any record until the **HOD** has reviewed and approved it.
2. **Unit HR** cannot approve any record until the **Unit Head** has reviewed and approved it.
3. If an approver rejects a request, a **Rejection Reason is mandatory**, and the request status is marked as rejected.

---

## 4. Detailed Feature & Page Guide

### 4.1. Overtime Portal Dashboard (`/overtime` or `/overtime/ot_main`)
- **Top Quick Links**:
  - `Apply OT`: Create a new overtime claim.
  - `OT Hour Master`: (Visible only to Super Admins) Configure overtime limit rules.
  - `Report`: View filtered reports and export data.
  - `Master Data`: Access employee directories and bulk CSV upload.
- **My Created Overtime List**:
  - Displays all applications initiated by the logged-in user.
  - Includes **Audit Trail** modal and **Cancel** button (for unapproved claims).
- **Pending for Approval Overtime List**:
  - Displays applications awaiting the logged-in user's approval.
  - Quick **Accept** and **Reject** buttons for fast processing.
  - Link to the detailed multi-employee approval page.

---

### 4.2. Overtime Requisition (`/overtime/ot_requisition`)
Used by supervisors to apply for team overtime hours.
1. **Header**:
   - Select **Unit Name**, **OT Date**, and **Shift** (`Morning`, `Evening`, `Night`, `General`).
   - **7-Day Restriction Rule**: Requisitions cannot be applied for dates more than 7 calendar days in the past (`Current Date - OT Date <= 7 days`).
   - Click **Create Header**.
2. **Adding Employees**:
   - Choose employee from the dropdown list.
   - Enter **OT Start Time** and **OT End Time** (system converts and displays in 12-hour AM/PM format).
   - Enter **Reason for OT** and detailed **Description**.
3. **Threshold Check**:
   - Automatically queries `/otPro/emp_ot_hrs` to calculate:
     - Accumulated weekly minutes vs. weekly threshold.
     - Accumulated monthly minutes vs. monthly threshold.
     - Accumulated quarterly minutes vs. quarterly threshold.
   - Prompts warning if any limit is exceeded.
4. **Save & Notify**:
   - Saves child records and sends automatic notification email to the assigned HOD.

---

### 4.3. Overtime Fix Hour Master (`/overtime/ot_fixhour`)
*Super Administrator access only.*
- Configures statutory and company overtime thresholds per plant location and department.
- Fields:
  - Unit Name (Locations filtered for AMESA region; `ASSAM` mapped to `GUWAHATI`).
  - Department Name.
  - From Date and To Date (`DD-MM-YYYY`).
  - Weekly OT Limit (in minutes).
  - Monthly OT Limit (in minutes).
  - Quarterly OT Limit (in minutes).
- Provides editing and updating of existing rules.

---

### 4.4. Employee Approval Process (`/overtime/employee_process_data?id=...`)
The active review page for HODs, Unit Heads, and Unit HRs.
- **Role Detection**: Detects user role (`HOD`, `Unit Head`, `Unit HR`).
- **Review Line Items**: Shows employee code, name, start time, end time.
- **Actions**:
  - **Accept**: Validates sequential hierarchy and marks record as approved.
  - **Reject**: Opens modal for mandatory rejection explanation.
  - **Click Employee Code**: Displays full audit trail and breakdown modal.
  - **Submit to Next Level**: Once all entries are reviewed, moves the entire application forward.

---

### 4.5. Overtime Report (`/overtime/ot_report`)
Operational reporting for HR, accounts, and management.
- **Date Filter**: Select Start Date & End Date, then click **Show**.
- **Master Resolution**: Matches employee code with employee master data to show employee name, region, plant, and department.
- **Approval Breakdown**: Shows exact dates for HOD, Unit Head, and HC Manager approvals (or red `Pending` badge).
- **Exporting**:
  - **Excel / CSV**: Generates UTF-8 CSV with all columns.
  - **Copy Table**: Copies formatted table to clipboard for quick pasting into Excel or Google Sheets.
- **Plantwise OT Summary**: Collapsible accordion showing monthly overtime minutes per plant.

---

### 4.6. Overtime Master Data (`/overtime/ot_master`)
Maintains employee and HOD directory information.
- **Bulk CSV Upload**:
  - Upload employee records via `.csv`.
  - **Download Sample CSV**: One-click download of `Sample_OT_master.csv`.
  - **CSV Requirements**:
    1. Enter only the username prefix for emails (e.g. for `john.doe@eplglobal.com`, enter **`john.doe`**).
    2. Separate multiple HOD IDs with commas (e.g. `hod1.id,hod2.id`).
- **Individual Add / Edit**:
  - Enter Region, Plant, Emp ID, Name, Department, HOD ID, Email ID, Role (`EMP`/`USER`).
  - XSS validation blocks input with `<script>` tags.
- **Master Table**: Searchable, paginated directory with edit, delete, and CSV export.

---

## 5. API Endpoints Reference

| Endpoint | Method | Payload / Parameters | Purpose |
| :--- | :--- | :--- | :--- |
| `/otPro/getAuth` | `POST` | `{ uid }` | Check user role & super admin status |
| `/otPro/my_created_application` | `POST` | `{ uid }` | Fetch user's created overtime requisitions |
| `/otPro/ot_approval_list` | `POST` | `{ uid }` | Fetch requisitions pending user's approval |
| `/otPro/save_ot_header` | `POST` | `{ uid, plant, department, ot_date, shift }` | Create overtime requisition header |
| `/otPro/emp_ot_hrs` | `POST` | `{ emp_id, ot_date, start_time, end_time }` | Calculate hours vs weekly/monthly/quarterly limits |
| `/otPro/save_ot_child` | `POST` | `{ header_id, emp_id, start_time, end_time, reason, ... }` | Add employee claim line item |
| `/otPro/mail_to_hod` | `POST` | `{ header_id }` | Send email notification to HOD |
| `/otPro/get_employee_process_data_level_wise` | `POST` | `{ n_application_id, s_name }` | Fetch application items for current approval tier |
| `/otPro/get_employee_process_workflow_data1` | `POST` | `{ headrid, childid }` | Check workflow state before accept/reject |
| `/otPro/approve_ot_process` | `POST` | `{ headrid, childid, level, sts }` | Submit approval for tier |
| `/otPro/reject_ot_process` | `POST` | `{ headrid, childid, level, sts, s_reject_reason, uid }` | Reject with mandatory explanation |
| `/otPro/sbmt_to_next_level` | `POST` | `{ n_application_id, s_name, level, hdr_data }` | Move application to next approval level |
| `/otPro/ot_report` | `POST` | `{ uid, startDate, endDate, flag, type }` | Retrieve report rows |
| `/otPro/get_otmaster` | `POST` | - | Retrieve master data for name/plant lookup |
| `/otPro/get_usermaster` | `POST` | `{ region, plant_id, role }` | Query user master directory |
| `/otPro/add_ot_user` | `POST` | `{ region, plant_name, plant_id, emp_id, emp_name, ... }` | Create employee master entry |
| `/otPro/update_ot_user` | `POST` | `{ emp_auto_id, region, plant_name, ... }` | Update employee master entry |
| `/otPro/delete_by_id` | `POST` | `{ emp_auto_id }` | Delete employee master entry |
| `/otPro/get_fixhour_data` | `POST` | - | Query configured overtime hour limits |
| `/otPro/add_Otfixhour_data` | `POST` | `{ n_plant_id, s_department, s_start_date, ... }` | Create overtime hour limit rule |
| `/otPro/update_Otfixhour_data` | `POST` | `{ n_plant_id, s_department, n_OT_fix_id, ... }` | Update overtime hour limit rule |
| `/otPro/get_approval_process_detail` | `POST` | `{ n_child_id, n_emp_id, dept, plant }` | Query detailed claim statistics |
| `/otPro/OtTrail` | `POST` | `{ ...detailObject }` | Retrieve multi-level audit trail logs |

---

## 6. Frequently Asked Questions (FAQ)

### Q: Why does the system say "You are not yet allowed to approve... HOD not approve yet"?
**A**: Sequential approval is strictly enforced. The Unit Head cannot approve until the HOD approves, and Unit HR cannot approve until the Unit Head approves.

### Q: Why can't I apply overtime for a date older than 7 days?
**A**: Company policy restricts retrospective overtime applications beyond 7 calendar days.

### Q: What format is expected for email usernames in CSV bulk upload?
**A**: Use only the username prefix before the `@` sign (e.g. `suresh.kumar` for `suresh.kumar@eplglobal.com`). Do not include `@eplglobal.com`.

### Q: In what unit are overtime hours stored?
**A**: Overtime is tracked and stored in **minutes** for accurate payroll calculations. In UI display tables, start and end times are shown in standard 12-hour AM/PM format.
