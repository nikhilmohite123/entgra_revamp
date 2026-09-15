# Quality Process Module Folder Structure: 
Quality-Process/
├── components/          ← SIRF cross-sub-module shared components
│   ├── StatusBadge.jsx        (Customer, HMP, Supplier teeno use karte hain)
│   ├── ApprovalTimeline.jsx   (agar QH/UH pattern common hai)
│   └── FileUploader.jsx       (agar file upload logic same hai)
├── pages/               ← SIRF Quality-Process level landing/overview page
│   └── QualityProcessHome.jsx  (jahan se Customer/HMP/Supplier choose karte hain)
├── services/
│   ├── apiClient.js
│   ├── customerQualityService.js
│   ├── hmpAuditService.js
│   └── supplierQualityService.js
├── layouts/
│   └── QualityProcessLayout.jsx
└── modules/
    ├── Customer-Quality/
    │   ├── components/    ← 8D Form, Fishbone Canvas, CauseLibrary
    │   ├── pages/          ← ComplaintDashboard, 8DDetailPage
    │   ├── routes/
    │   ├── constants/
    │   └── styles/
    ├── HMP-Audit/
    │   ├── components/    ← SurveyExecutor, RatingScale, CalendarGrid
    │   ├── pages/          ← AuditDashboard, ScheduleTracker
    │   ├── routes/
    │   └── constants/
    └── Supplier-Quality/
        ├── components/    ← NCRForm, CAPATracker, RejectionCharts
        ├── pages/          ← SupplierDashboard, RaiseComplaint
        ├── routes/
        └── constants/