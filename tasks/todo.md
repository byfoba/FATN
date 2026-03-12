# Task Plan

## Current Task: Readaptar proyecto a NinjaTrader CME Level 1 + VPS (sin Interactive Brokers)

- [x] Auditar referencias a IB/IB Gateway en código y documentación.
- [x] Refactorizar el adaptador live del bridge para nomenclatura NinjaTrader.
- [x] Actualizar README e infraestructura para setup NinjaTrader CME Level 1 + VPS.
- [x] Ejecutar checks automáticos relevantes y validar que no se rompió el flujo.
- [x] Documentar resultados en la sección de review.

## Previous Task: Resolver bloqueo de deploy en Vercel por CVE de Next.js

- [x] Revisar logs de Vercel y confirmar causa raíz del fallo de deploy.
- [x] Actualizar `next` y `eslint-config-next` en `frontend` a una versión parcheada.
- [x] Ejecutar instalación y build local del frontend para validar compatibilidad.
- [x] Documentar resultados en la sección de review.

## Review

- Se reemplazó la nomenclatura del adaptador live del bridge de `IB` a `NinjaTrader` (`liveNinjaTraderAdapter.ts` y `liveNinjaTraderTicks`) sin cambiar el contrato interno de `Tick`, manteniendo impacto mínimo.
- Se readaptó la documentación principal a flujo **NinjaTrader CME Level 1 + VPS**, eliminando referencias a Interactive Brokers/IB Gateway y actualizando el TODO técnico del integrador live.
- Se actualizó el script de setup Ubuntu para reflejar explícitamente el conector/feed de NinjaTrader.
- Verificación ejecutada: `npm test` y `npm run build`, ambos exitosos.
