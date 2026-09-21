# CNI Business Rules & Validations

## Summary
- **Validation rules discovered**: 80+ instances mapped across Stage 1-5 HTML views.
- **External dependencies discovered**: 3 (mapped to standard React alternatives)

### Validation Rules (Zod Schemas)
- The legacy application relies heavily on `validator="required"` and `valid-method="watch;submit-only"` from the custom `validation` module on individual inputs and textareas.
- **File Uploads**: All file uploads enforce `required accept=".xls, .xlsx, .csv, .pdf, .doc, .docx, .png, .jpeg"`.
- **Length Limits**: Certain fields use `ng-maxlength="200"` and `ng-maxlength="5000"`.
- **Project Creation & Stages 1-5**: All mandatory inputs will be mapped directly to Zod schemas (e.g., `z.string().min(1, 'Required').max(5000)`). The schemas will perfectly mirror the `validator="required"` markup on the legacy views.

### Business Workflows & Calculations
- **Stage Progression**: A project moves from Stage N to Gate N to Stage N+1 via the `/db/updateProStagelevel` endpoint triggered upon Gate approval.
- **Return Project**: Gates B, C, and D contain a `/db/returnProject` workflow, presumably allowing a gate approver to send a project back to a previous stage.
- **Scrap / Shelve**: Projects can be scrapped or shelved at any Gate (A through D) via `/db/scrapProject` and `/db/shelveProject`.
- **Temporary Files**: Files uploaded in Stage 1 are stored in a temporary table (`/db/getTempFileInStage1`) before final submission.

### External Dependencies & Migration Strategy
- `naif.base64` (Base64 file uploads) &rarr; Standard `<input type="file">` handled via React Hook Form / Axios FormData.
- `ui.bootstrap` (Modals, Dropdowns) &rarr; Existing entgra_revamp UI framework (e.g., Headless UI or standard React Modals).
- `validation` and `validation.rule` (Custom Angular Validation) &rarr; React Hook Form + Zod resolvers.
