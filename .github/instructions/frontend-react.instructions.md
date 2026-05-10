---
applyTo: "frontend/**/*.{js,jsx,ts,tsx,css}"
---

# Frontend (React + Vite, FSD) — Copilot Instructions

Apply to every file in `frontend/`. Read alongside `frontend/AGENTS.md`.

## Stack

- React 19, React Router 7, Redux Toolkit, React Redux, Tailwind CSS 4, Vite, ESLint 9. **JavaScript / JSX, not TypeScript** — do not introduce TypeScript unless explicitly asked.

## Architecture — Feature-Sliced Design (FSD)

```
src/
├── app/         # bootstrap, router, providers, store
├── pages/       # route-level screens
├── widgets/     # composed UI sections
├── features/    # feature state and public feature exports
├── entities/    # reusable lower-level UI / domain pieces
└── shared/      # shared API / lib infrastructure
```

Layer order (top → bottom): `app → pages → widgets → features → entities → shared`. Higher layers may import from lower; never the reverse.

## Rules

- Import another slice **only through its public `index.js`** API. Use `@x/<consumer>.js` contracts for unavoidable same-layer cross-slice dependencies.
- Feature slices are **flat**: no `src/features/user/change-email`.
- Widgets **do not compose other widgets**. Compose widgets only from `app` or `pages`.
- Do not recreate legacy folders (`src/components/`, old `src/pages/*.jsx`, old `src/features/account/...`) unless the user explicitly asks.
- Keep app bootstrap in `src/main.jsx`; mount root from `src/app/entry` (`App.jsx` + public `index.js`).
- Router lives in `src/app/router/AppRouter.jsx`. App shell in `src/app/layout/`. Redux store in `src/app/store/index.js`. Redux provider in `src/app/providers/StoreProvider.jsx`.
- Route paths use camelCase as in the existing routes (`/account/currentCourses`).

## State

- Two existing slices: `features/auth` (mocked, persisted to `localStorage`) and `features/catalog` (mock data). No real backend integration yet — do not assume otherwise.
- No RTK Query or HTTP client in the current code. If you add API integration, make the boundary explicit.
- Access slice state through exported selectors.

## Styling

- Tailwind utility classes first. Reuse semantic classes defined in `src/index.css` (`header-btn`, `account-sidebar-navlink`, `profile-card`, etc.).
- Do not introduce CSS Modules / styled-components / another styling system.
- Preserve responsive breakpoints (`sm:`, `md:`).

## Components

- Function components only.
- File naming: `ui/` for components, `model/` for Redux slices.
- Keep Russian UI copy consistent with surrounding screens.

## Validation

```sh
npm run lint    # includes the FSD boundary checker in tools/check-fsd.mjs
npm run build   # after route / store / config / large component changes
```

There is no test framework configured. Do not claim Jest / Vitest / Playwright coverage unless you add it.
