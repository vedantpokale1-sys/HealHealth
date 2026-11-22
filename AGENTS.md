# HEAL HEALTH Core Assistant Guidelines & Memory Rules

## Mandatory Deployment Rule (CRITICAL)
For EVERY change, fix, feature, or refactoring in this repository:
1. **Always build the project first**:
   `npm run build`
   *(This builds the Vite frontend to `dist/` and compiles the serverless bundle `api/index.js` for Vercel).*
2. **Always commit and push immediately to GitHub**:
   `git add . ; git commit -m "<Clear description of change>" ; git push origin main`
3. **Automatic Vercel Deployment**:
   Pushing to `origin main` immediately triggers and deploys the updates to Vercel at `https://heal-health-xobh.vercel.app/`.
4. **Clean Tree Verification**:
   Never leave uncommitted or unpushed changes. Always confirm `git status` is clean and synchronized with `origin/main`.

## Clinical Authenticity & Report Analysis Rules
1. **Non-Medical Document Rejection**:
   Never hallucinate fake blood test values or medical biomarkers (such as SGPT/ALT, cholesterol, bilirubin) when a user uploads a non-medical document (e.g. school report cards, academic marksheets, homework, invoices, receipts).
2. **Explicit User Communication**:
   If an uploaded document or image is non-medical, explicitly detect and reject it, explaining that HEALHEALTH is strictly designed for clinical diagnostic laboratory reports (e.g. CBC, lipid profiles, thyroid panels, blood sugar, dengue serology).
3. **Genuine Clinical Extraction**:
   For authentic laboratory reports, parse the genuine biomarkers, units, and reference ranges.

## User & Identity Context
- Primary authenticated patient: **Vedant Pokale** (`vedant.pokale@example.com`).
- All demo dashboards, medical records, appointments, and report previews must belong to Vedant Pokale.
