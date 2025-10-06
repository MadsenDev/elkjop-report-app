# Elkjøp Report App

A desktop/web application for Elkjøp's aftersales operations team to capture weekly activity, monitor goal progress, and generate shareable daily or weekly summaries.

## Getting started

### Prerequisites

* Node.js 18+
* npm 9+

### Installation

```bash
npm install --ignore-scripts
```

The project ships with a Puppeteer-powered postinstall step for Electron builds. In CI or environments without the necessary system dependencies you can continue to use `--ignore-scripts` and run `node scripts/postinstall.js` manually when the chromium binary is required.

### Available scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite development server. |
| `npm run build` | Type-check and build the production bundle. |
| `npm run lint` | Run ESLint across the repo. |
| `npm run typecheck` | Run the TypeScript compiler without emitting files. |
| `npm run test` | Execute unit tests via Vitest. |
| `npm run test:watch` | Run Vitest in watch mode. |
| `npm run electron:dev` | Build and launch the Electron shell for local development. |
| `npm run electron:build` | Produce Electron distributables. |

## Project structure highlights

* `src/store/` – Modular Zustand store slices (`data`, `ui`, `settings`, `budget`, `export`) and shared types/defaults.
* `src/hooks/` – UI hooks such as `useAutoSelectDay`, `useDayProgress`, `useReportExport`, and `useWeekReset` for keeping components light.
* `src/components/` – React components for the main layout, reports, settings, and utilities.

## Testing

Vitest powers the unit test suite. The initial coverage focuses on configuration merging logic to guard against regressions when importing or resetting settings:

```bash
npm run test
```

Add new tests under `src/**/__tests__` or alongside modules using the `.test.ts(x)` suffix.

## Type checking

Use the `typecheck` script to surface type errors without generating build artifacts:

```bash
npm run typecheck
```

## Electron builds

The Electron build pipeline lives under `/electron` and `/scripts`. After running `npm install` without `--ignore-scripts`, `node scripts/postinstall.js` will download the Chromium bundle necessary for PDF generation and screenshot utilities.
