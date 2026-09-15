# Supplier Quality Module — Legacy Analysis & Migration Documentation

**Module:** Quality-Process → Supplier-Quality
**Source:** Legacy Express/jQuery frontend (`Supplier_Zip.zip`)
**Purpose:** Complete inventory of features, pages, endpoints, and open questions before starting React migration — so no scope is missed.
**Status:** Frontend-only analysis (backend controller/routes/SQL not reviewed — see Section 6)

---

## 1. Module Overview

The Supplier Quality legacy code lives under `Supplier/` and has two folders:
- `Supplier/views/` — 8 HTML pages
- `Supplier/transaction/` — 8 JS files (jQuery-based logic)

It covers 3 core business flows:
1. **Raising and tracking supplier complaints** (with material rejection data)
2. **NCR (Non-Conformance Report) + CAPA (Corrective/Preventive Action)** workflow, in two variants (standard and "190")
3. **Supplier-facing external verification/authorization** (accessed via email link, no login)

---

## 2. Page-by-Page Inventory

### 2.1 Supplier Dashboard & Notifications
| | |
|---|---|
| **Legacy view** | `supplier_notifi.html` |
| **Legacy JS** | `getsupplier.js` (3,229 lines — largest file in module) |
| **Status** | Not started |

**What it does:** Main landing dashboard for the Supplier Quality team — notification list, material rejection graphs, lot rejection analytics, top supplier performance, inter-plant comparisons, quick reports.

**Endpoints used:**
`getlocation`, `getNCRInitiateNoti`, `getPlantBYRegion`, `getRCS_report`, `getRecentActivities`, `getRow4_data_mat_graph`, `getRow5_data_mat_graph`, `getRow_lot_data_mat_graph`, `getStackholdermaildata`, `getSupplier_noti`, `getSupplr_cat`, `getSupplr_name`, `get_and_merge_rec`, `get_inter_plant`, `get_mat_graph`, `get_mat_table_data`, `get_material_group`, `get_no_complaints`, `get_quick_report`, `get_stakeholders_name`, `get_top_5_inter_plant`, `get_top_suppier_append_record`, `getcutomr_resp_noti`, `getdataByID`, `top_5_lot_rejection`

**Cross-module dependency (flagged):** This page imports `chartsFunctions.js` from the **Customer Quality** module (`Quality/Customer/transaction/`). In React, chart logic should become a shared component in `Quality-Process/components/`, not duplicated.

**Open item:** `getRCS_report`, `getRecentActivities`, `get_stakeholders_name` were not present in the original Master API Catalog document — confirm whether these are active/needed or deprecated.

---

### 2.2 Raise Complaint
| | |
|---|---|
| **Legacy views** | `raisecomplaint.html`, `suppli_file_upload.html` |
| **Legacy JS** | `raisecomplaint.js` (632 lines) |
| **Status** | Not started |

**What it does:** Form to log a new supplier complaint — material/defect details, quantities, cost impact, and file attachments.

**Key form fields (from legacy HTML):** supplier category/name, plant, material code/name, vendor code, invoice/GIR doc no., inspection lot no., dates (invoice, receipt, complaint sent), quantities (lot, complaint, accepted, incoming, in-process), sorting cost, downtime loss, unit price, currency/UOM, defect type, nature of complaint, complaint description, test method used, supplier risk assessment, credit note, 8D report reference, response timeline, business center.

**Endpoints used:**
`getlocation`, `deleteFileTemp`, `deletesRaisecomplaintImage`, `editfiledescri`, `getDefect_typ`, `getFile_dataByID`, `getNatur_defect`, `getSupplr_cat`, `get_currancy_uom`, `getdataByID`, `save_data`

**Note:** This is the page that will consume the shared `SupplierQualityContext` (categories, plants, defect types) once populated.

---

### 2.3 NCR (Non-Conformance Report) — Standard
| | |
|---|---|
| **Legacy view** | `ncr.html` |
| **Legacy JS** | `supplier_ncr.js` (1,044 lines) |
| **Status** | Not started |

**What it does:** NCR creation/management with root cause analysis, CAPA action tracking, responsible-person assignment, and a reject/mail workflow.

**Distinguishing features (vs. NCR190 — see 2.4):** interplant handling, reject-mail modal, team member table, email-recipient management. This variant appears oriented toward **internal team-driven NCR management**.

**Endpoints used:**
`RejectMail`, `UpdateRejection`, `addresponsible`, `get_interplant_users`, `getcapaactions`, `getcorrectroot`, `getmember_byId`, `getroot`, `removeresponsible`, `supplier_ncr`, `supplier_ncr_insert`, `add_user_mail`, `delete_user_mail`

---

### 2.4 NCR — "190" Variant
| | |
|---|---|
| **Legacy view** | `ncr190.html` |
| **Legacy JS** | `supplier_ncr190.js` (860 lines) |
| **Status** | Not started — **blocked on clarification** |

**What it does:** Also an NCR/CAPA workflow, but structurally different from the standard NCR page.

**Distinguishing features (vs. standard NCR):** supplier-side file upload capability (`supplierframe1`, `add_supp_file`), explicit root-cause fields (`root1`–`root4`), separate update buttons for CAP/PAP/ROOT (`UpdtbtnCAP`, `UpdtbtnPAP`, `UpdtbtnROOT`). This variant looks oriented toward **supplier-facing / supplier-submitted NCR response**, possibly reached from the Authorization flow (Section 2.6 redirects here after supplier verifies their email).

**Endpoints used:**
`addresponsible`, `deletesupplierfile_190`, `editresponsible`, `getFile_dataByID190`, `getcapaactions`, `getcorrectroot`, `getmember_byId`, `getroot`, `removeresponsible`, `supplier_ncr`, `supplier_ncr_insert`, `updateresponsible`

**⚠️ OPEN QUESTION (needs answer before building):**
Is "190" a **plant-specific code** (i.e., NCR flow differs by plant) or a **supplier-facing counterpart** to the internal NCR page (i.e., standard NCR = internal team view, NCR190 = external supplier response view — which would align with the Authorization page redirecting here)? This determines whether we build **one NCR component with a `variant` prop** or **two separate page implementations**.

---

### 2.5 NCR Attachment Viewer
| | |
|---|---|
| **Legacy view** | `ncr_attachment.html` |
| **Legacy JS** | `ncr_attachmnets.js` (177 lines) |
| **Status** | Not started — **blocked on clarification** |

**What it does:** Simple file listing/viewer tied to an NCR record.

**Endpoints used:** `getAttachmentdata`

**⚠️ OPEN QUESTION:** Should this be a standalone routed page, or a section/modal embedded inside the NCR page? (Legacy has it as a separate HTML file, which in old iframe-based architectures often just means "separate popup," not necessarily a distinct top-level page in React.)

---

### 2.6 CAPA Form
| | |
|---|---|
| **Legacy view** | `capa_form.html` |
| **Legacy JS** | Uses `getsupplier.js` (shared) + **external files not in this zip** |
| **Status** | Not started — **blocked, missing source files** |

**What it does:** CAPA report submission form — this is the page suppliers land on after being verified via the Authorization flow (per the "Thanks for submitting CAPA report" message seen in `supplier_authorization_190.html`).

**⚠️ Missing dependencies:** References `insertDetail_qp.js` and `getrequest.js`, which are **not present in the supplied zip**. These likely belong to a core/shared `qlProController`-adjacent module. Need to locate these before this page's full logic can be documented/migrated.

---

### 2.7 Supplier Authorization ✅ *In Progress*
| | |
|---|---|
| **Legacy view** | `supplier_authorization_190.html` |
| **Legacy JS** | `supplier_authorization_190.js` (68 lines — smallest file, used as migration pilot) |
| **Status** | **In progress** (React version being built) |

**What it does:** External, no-login page reached via email link. Supplier enters their email to verify identity against a notification (`s_noti_no` + `n_status` read from URL). On success, sets a cookie and redirects to the CAPA form (2.6) or NCR190 (2.4) flow.

**Endpoints used:** `verify_supplier`

**Architectural note (already decided):** Standalone route under `AuthLayout` (no sidebar/header), since this is shown to external suppliers, not internal staff.

---

## 3. Complete Endpoint Catalog (Supplier Quality — All Pages Combined)

| Endpoint | Used In |
|---|---|
| `getlocation` | Dashboard, Raise Complaint |
| `verify_supplier` | Authorization |
| `save_data` | Raise Complaint |
| `getdataByID` | Dashboard, Raise Complaint |
| `getSupplr_cat` | Dashboard, Raise Complaint |
| `getSupplr_name` | Dashboard |
| `getPlantBYRegion` | Dashboard |
| `getDefect_typ` | Raise Complaint |
| `getNatur_defect` | Raise Complaint |
| `get_currancy_uom` | Raise Complaint |
| `get_material_group` | Dashboard |
| `getFile_dataByID` / `getFile_dataByID190` | Raise Complaint / NCR190 |
| `deleteFileTemp`, `deletesRaisecomplaintImage`, `deletesupplierfile_190` | Raise Complaint / NCR190 |
| `editfiledescri` | Raise Complaint |
| `getAttachmentdata` | NCR Attachment |
| `supplier_ncr`, `supplier_ncr_insert` | NCR, NCR190 |
| `getroot`, `getcorrectroot` | NCR, NCR190 |
| `getcapaactions` | NCR, NCR190 |
| `addresponsible`, `removeresponsible`, `getmember_byId` | NCR, NCR190 |
| `editresponsible`, `updateresponsible` | NCR190 only |
| `add_user_mail`, `delete_user_mail`, `add_email` | NCR only |
| `RejectMail`, `UpdateRejection` | NCR only |
| `get_interplant_users` | NCR only |
| `get_mat_graph`, `get_mat_table_data` | Dashboard |
| `getRow4_data_mat_graph`, `getRow5_data_mat_graph`, `getRow_lot_data_mat_graph` | Dashboard |
| `top_5_lot_rejection`, `get_top_suppier_append_record` | Dashboard |
| `get_inter_plant`, `get_top_5_inter_plant` | Dashboard |
| `get_quick_report` | Dashboard |
| `getNCRInitiateNoti`, `getcutomr_resp_noti`, `getSupplier_noti` | Dashboard |
| `get_and_merge_rec`, `get_no_complaints` | Dashboard |
| `getStackholdermaildata`, `get_stakeholders_name` | Dashboard *(unconfirmed)* |
| `getRCS_report`, `getRecentActivities` | Dashboard *(unconfirmed)* |

**Total distinct endpoints identified: 38**

---

## 4. Dead Code (Excluded From Migration)

| File | Lines | Reason |
|---|---|---|
| `getsupplier1.js` | 3,202 | Not referenced by any HTML view. Backup/duplicate. |
| `getsupplier_13_06_22.js` | 2,828 | Not referenced by any HTML view. Dated backup copy. |

These remain in `Legacy-Folder` for reference only — not to be migrated or treated as source of truth.

---

## 5. Proposed React Structure (Recap)

```
Supplier-Quality/
├── components/
│   ├── dashboard/        (5 components — graphs, tables)
│   ├── raise-complaint/  (2 components)
│   ├── ncr/              (5 components — shared between NCR/NCR190 pending Q1)
│   └── authorization/    (1 component — DONE)
├── pages/
│   ├── SupplierDashboardPage.jsx
│   ├── RaiseComplaintPage.jsx
│   ├── NCRPage.jsx
│   ├── NCR190Page.jsx            (pending Q1)
│   ├── NCRAttachmentPage.jsx     (pending Q2 — may not be a page at all)
│   ├── CAPAFormPage.jsx          (pending Q3 — missing source)
│   └── SupplierAuthorizationPage.jsx  ✅ DONE
├── hooks/  (one per page, matching above)
├── context/
│   └── SupplierQualityContext.jsx  (skeleton done, not yet wired to any page)
├── constants/
│   └── supplierConstants.js
└── routes/
    └── SupplierQualityRoutes.jsx
```

**Migration order (recommended):**
1. ✅ Supplier Authorization (done/in progress — pilot)
2. Raise Complaint (medium complexity, activates `SupplierQualityContext`)
3. NCR — standard (complex)
4. NCR190 (blocked on Q1)
5. NCR Attachment (blocked on Q2)
6. CAPA Form (blocked on Q3 — missing files)
7. Dashboard (most complex, has cross-module dependency — do last)

---

## 6. Open Items — Need Answers Before Full Completion

| # | Question | Blocks |
|---|---|---|
| 1 | Is "190" a plant-specific variant, or the supplier-facing counterpart to the internal NCR page? | NCR190Page structure |
| 2 | Should NCR Attachment be a standalone route, or a section/modal inside NCR page? | NCRAttachmentPage |
| 3 | Where are `insertDetail_qp.js` and `getrequest.js` (used by CAPA form, not in this zip)? | CAPAFormPage |
| 4 | Are `getRCS_report`, `getRecentActivities`, `get_stakeholders_name`, `getStackholdermaildata` active/current endpoints, or legacy leftovers? | Dashboard scope |
| 5 | **Not yet reviewed:** backend controller/routes/SQL — exact request/response payloads, DB fields. Needed if precise API contracts are required beyond endpoint names. | Service layer accuracy (all pages) |

---

## 7. Cross-Module Notes

- `chartsFunctions.js` (Customer Quality) is reused by Supplier Dashboard — plan to lift into `Quality-Process/components/` as a shared chart utility.
- `getSupplr_cat`, `getPlantBYRegion`/`getPlantBYRegion`-type master data appear in multiple pages within this module — candidate for `SupplierQualityContext`.

---

*This document should be updated as each page moves from "Not started" → "In progress" → "Done", and as open questions (Section 6) get resolved.*