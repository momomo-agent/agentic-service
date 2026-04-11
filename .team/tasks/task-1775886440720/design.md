# Design: Build Admin UI dist

## Module
UI → `src/ui/admin/` → `dist/admin/`

## Current State
- `src/server/api.js` line 378: `const adminDist = new URL('../../dist/admin', import.meta.url).pathname`
- `dist/admin/` already exists with `assets/` and `index.html` (from a previous build)
- `src/ui/admin/vite.config.js` sets `build: { outDir: '../../../dist/admin' }` — builds to project root `dist/admin/`
- `package.json` script: `"build": "cd src/ui/admin && npm install && npm run build"`

## Problem
The existing `dist/admin/` may be stale (built from an older version of the admin UI). The task requires confirming the build is current and `/admin` returns 200.

## Files Involved
- `src/ui/admin/` — Vue 3 + Vite source
- `dist/admin/` — build output (served by api.js)
- `src/server/api.js` — static file serving (no changes needed)

## Implementation Plan

### Step 1: Verify current dist is valid
```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/admin
```
If 200 → dist is already valid, task may already be done.

### Step 2: If stale or missing, rebuild
```bash
cd src/ui/admin && npm install && npm run build
```
This outputs to `dist/admin/` (relative to project root, per vite.config.js `outDir: '../../../dist/admin'`).

### Step 3: Verify path resolution
`api.js` uses `new URL('../../dist/admin', import.meta.url).pathname`
- `import.meta.url` = `file:///...agentic-service/src/server/api.js`
- `../../dist/admin` resolves to `agentic-service/dist/admin` ✓

### Step 4: Confirm routes work
- `GET /admin` → `dist/admin/index.html` (200)
- `GET /admin/assets/...` → static assets (200)

## Test Cases
- `GET /admin` returns HTTP 200
- `dist/admin/index.html` exists and is non-empty
- `dist/admin/assets/` contains JS/CSS bundles

## ⚠️ Assumptions
- `src/ui/admin/package.json` has `@vitejs/plugin-vue` and `vite` as devDependencies
- Node ≥18 available for build
- No `.env` required for admin UI build (it's a static SPA with API proxy)
