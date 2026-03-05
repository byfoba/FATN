# Task Plan

## Current Task: Fix Vercel frontend deploy blockers

- [x] Reproduce or inspect the failing build conditions from Vercel logs.
- [x] Upgrade frontend Next.js to a patched version that resolves CVE-2025-66478.
- [x] Add missing ESLint dependency in the frontend workspace so `next build` can run lint/type checks.
- [x] Run local install + frontend build to verify the fix.
- [x] Record review notes and outcomes.

## Previous Task (MVP scaffold)

- [x] Capture project scope and constraints from user brief.
- [x] Scaffold repository structure for frontend, API, bridge, infra, model, shared, tests.
- [x] Implement shared TypeScript contracts and validation schemas.
- [x] Implement Vercel serverless endpoints: `/api/context`, `/api/analyze`, `/api/status`, `/api/admin/rerun`.
- [x] Implement Gemini prompt builder and strict response validation.
- [x] Implement bridge service with playback/live modes, dedupe, 1s bars, replay buffer, triggers, push + auth signature.
- [x] Add frontend MVP pages (dashboard/settings/analysis) + timezone detection and Supabase profile save flow.
- [x] Add infra assets: Supabase SQL schema, env templates, deployment notes, Vercel config, alerting examples.
- [x] Add model prompt files and JSON examples.
- [x] Add tests (unit + integration playback/analyze contract) and CI workflow.
- [x] Run lint/tests and record results.
- [x] Write review notes and readiness summary.

## Review

- Updated `frontend/package.json` to pin Next.js to `15.2.4` (patched line) and add frontend-local lint dependencies expected by Vercel builds.
- Normalized frontend dependency split by moving TypeScript + `@types/*` to `devDependencies`.
- Local verification was partially blocked by registry policy (`npm`/`yarn` 403 from registry.npmjs.org), so fresh dependency installation could not be completed in this environment.
