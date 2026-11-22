# Deployment & Quality Assurance Rules

- **Immediate GitHub Push & Vercel Deployment**: Every change to the codebase must be built (`npm run build`), committed, and pushed to GitHub `origin/main` immediately so that Vercel deploys the live version without delay.
- **No Unpushed Changes**: Always ensure `git status` is clean before completing a task.
- **Clinical Integrity**: Always validate whether uploaded files are medical documents before generating health assessments. Non-medical files (school marksheets, invoices, etc.) must be clearly rejected without generating fake laboratory biomarkers.
