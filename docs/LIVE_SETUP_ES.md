# Guía para novatos: cómo dejar FATN en **live** paso a paso

> Objetivo: que puedas levantar el sistema con datos reales de mercado (IB), bridge en VPS y frontend/API en Vercel, sin perderte.

---

## 0) Qué vas a tener al final

Cuando termines, vas a poder:

1. Enviar contexto de mercado desde el bridge (VPS) hacia `/api/context`.
2. Ejecutar análisis con Gemini a través de `/api/analyze`.
3. Ver resultados desde el frontend.
4. Verificar salud con endpoints de estado (`/api/status`, `/health`, `/metrics`).

---

## 1) Prerrequisitos mínimos (checklist)

Marca cada punto antes de seguir:

- [ ] Cuenta en **Supabase**.
- [ ] Cuenta en **Vercel**.
- [ ] Cuenta en **Google AI / Gemini API** con clave activa.
- [ ] Cuenta en **Interactive Brokers** con market data **CME L1 Non-Professional** activa.
- [ ] Un **VPS Linux (Ubuntu)** con acceso SSH.
- [ ] Git + Node.js 20+ instalados en tu máquina.

Comando para validar Node:

```bash
node -v
```

Si muestra `v20.x` o más, estás bien.

---

## 2) Clonar y preparar el proyecto local

```bash
git clone <tu-repo>
cd FATN
npm ci
```

Opcional (para validar que todo compile antes de deploy):

```bash
npm run test
```

---

## 3) Configurar Supabase (base de datos)

### 3.1 Crear proyecto

1. Entra a Supabase.
2. Crea un proyecto nuevo.
3. Guarda estos valores:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 3.2 Crear tablas

1. Abre el SQL Editor en Supabase.
2. Copia y ejecuta el archivo:
   - `infra/supabase_schema.sql`
3. Verifica que existan tablas:
   - `users`
   - `snapshots`
   - `analyses`
   - `analysis_queue`

---

## 4) Configurar Vercel (frontend + API)

### 4.1 Importar proyecto

1. En Vercel, `Add New Project`.
2. Selecciona este repo.
3. Framework detectado: Next.js.

### 4.2 Variables de entorno en Vercel

Carga estas variables (Project Settings → Environment Variables):

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `INTERNAL_API_SECRET` (créala tú, aleatoria y larga)
- `BRIDGE_SECRET` (créala tú, aleatoria y larga)
- `GEMINI_API_KEY`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

> Importante: `INTERNAL_API_SECRET` y `BRIDGE_SECRET` deben ser distintas.

### 4.3 Deploy

1. Ejecuta deploy en Vercel.
2. Guarda la URL final (ej: `https://tu-app.vercel.app`).

---

## 5) Configurar VPS + bridge live

## 5.1 Entrar por SSH al VPS

```bash
ssh <usuario>@<ip-vps>
```

### 5.2 Preparación base (Ubuntu)

Desde la raíz del repo en el VPS:

```bash
./infra/vps_setup_ubuntu.sh
```

### 5.3 Variables del bridge

Usa como base `infra/env.example` y define al menos:

- `API_BASE_URL=https://tu-app.vercel.app`
- `BRIDGE_SECRET=<igual al de Vercel>`
- `INTERNAL_API_SECRET=<igual al de Vercel>`
- `TICKER=ES`
- `EXCHANGE=CME`
- `ANALYSIS_CADENCE_SEC=15`

### 5.4 Levantar bridge en live

```bash
npm run bridge:live
```

> Si recién estás empezando, primero prueba playback para comprobar pipeline:

```bash
npm run bridge:playback
```

---

## 6) Integración con Interactive Brokers (IB)

El repositorio trae hooks/stub para live adapter. Para modo real:

1. Asegura que IB Gateway esté corriendo en el VPS o entorno conectado.
2. Activa sus credenciales/conectividad.
3. Completa implementación faltante en `bridge/src/adapters/liveIbAdapter.ts` si todavía está stub.

Si no hay ticks reales, revisa primero:
- Permiso de market data en IB.
- Sesión activa en IB Gateway.
- Símbolo/ticker correcto (`ES`, `NQ`, etc.).

---

## 7) Validación end-to-end (muy importante)

### 7.1 Validar API

Abre en navegador:

- `https://tu-app.vercel.app/api/status`

Debe responder salud (`200`).

### 7.2 Validar bridge

En el VPS, revisa logs del bridge en ejecución. Debes ver:

- Ingesta de ticks.
- Push de contexto hacia `/api/context`.
- Trigger de análisis cada `ANALYSIS_CADENCE_SEC`.

Si expones health local del bridge, valida:

- `/health`
- `/metrics`

### 7.3 Validar datos en Supabase

Revisa que se estén llenando:

- `snapshots`
- `analyses`

---

## 8) Checklist rápido de “está live”

- [ ] Vercel deploy en verde.
- [ ] `/api/status` responde 200.
- [ ] Bridge corriendo estable en VPS.
- [ ] Entradas nuevas en `snapshots`.
- [ ] Entradas nuevas en `analyses`.
- [ ] Frontend muestra análisis recientes.

Si todos están en verde, ya estás en live ✅

---

## 9) Errores comunes (y solución)

1. **401/403 en `/api/context` o `/api/analyze`**  
   Causa: secreto mal configurado o diferente entre Vercel y bridge.  
   Solución: revisar `BRIDGE_SECRET` e `INTERNAL_API_SECRET` en ambos lados.

2. **No hay análisis**  
   Causa: no llegan snapshots o falla llamada a Gemini.  
   Solución: revisar logs del bridge + validar `GEMINI_API_KEY`.

3. **No aparecen datos en frontend**  
   Causa: problema en claves públicas de Supabase o tablas vacías.  
   Solución: validar `NEXT_PUBLIC_SUPABASE_*` y contenido de `analyses`.

4. **Bridge conecta pero sin ticks**  
   Causa: IB sin market data habilitada / adapter incompleto.  
   Solución: validar suscripción CME L1 y `liveIbAdapter.ts`.

---

## 10) Siguiente paso recomendado

Cuando tengas esto funcionando, te conviene crear:

- Servicio `systemd` para el bridge (autostart + restart automático).
- Alertas sobre `/metrics` (latencia, reconnects, tick_rate).
- Procedimiento de rollback simple (volver a último deploy estable).

Si quieres, en el próximo mensaje te doy un **plan guiado de 60 minutos** (minuto a minuto) para hacerlo contigo en vivo.
