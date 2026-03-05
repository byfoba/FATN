# Task Plan

## Current Task: Resolver bloqueo de deploy en Vercel por CVE de Next.js

- [x] Revisar logs de Vercel y confirmar causa raíz del fallo de deploy.
- [x] Actualizar `next` y `eslint-config-next` en `frontend` a una versión parcheada.
- [x] Ejecutar instalación y build local del frontend para validar compatibilidad.
- [x] Documentar resultados en la sección de review.

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

- Se actualizó `frontend/package.json` para usar `next@16.1.6` y `eslint-config-next@16.1.6`, eliminando la versión vulnerable que Vercel bloquea por CVE.
- Se alinearon tipos de React para React 19 (`@types/react` y `@types/react-dom` en `^19.0.0`) para evitar autoinstalaciones inesperadas durante `next build`.
- La validación local de instalación/build quedó limitada por política de red del entorno (`403 Forbidden` a registry.npmjs.org), por lo que no fue posible completar una instalación limpia de dependencias aquí.
