# AGENTS.md

## Scope

This file applies to everything under `frontend/`.

## Project Snapshot

This frontend is a React 19 + Vite application using:

- React 19
- React Router 7
- Redux Toolkit
- React Redux
- Tailwind CSS 4
- ESLint 9

The codebase is currently mid-refactor into an FSD-like structure. Treat the new structure as the source of truth:

- `src/app/` - application bootstrap, router, providers, store
- `src/pages/` - route pages
- `src/widgets/` - composed UI sections
- `src/features/` - feature state and public feature exports
- `src/entities/` - reusable lower-level UI/domain pieces

Do not recreate legacy folders like old `src/components/`, old `src/pages/*.jsx`, or old `src/features/account/...` paths unless the user explicitly asks for it.

## Architecture Rules

- Keep app bootstrap in `src/main.jsx` and `src/App.jsx`.
- Keep router setup in `src/app/router/AppRouter.jsx`.
- Keep Redux store wiring in `src/app/store/index.js`.
- Keep Redux provider wiring in `src/app/providers/StoreProvider.jsx`.
- Export feature public APIs from `src/features/<feature>/index.js`.
- Put route-level screens in `src/pages/.../ui/`.
- Put cross-page composed sections in `src/widgets/.../ui/`.
- Put smaller reusable building blocks in `src/entities/.../ui/`.

When adding new code, follow the existing folder naming convention:

- feature folders are lowercase
- UI components live in `ui/`
- Redux logic lives in `model/`

## Routing Conventions

- This app currently imports routing primitives from `react-router`.
- Route definitions live in a single browser router inside `AppRouter.jsx`.
- Existing route paths use the current camelCase style, for example:
  - `/account`
  - `/account/currentCourses`
  - `/account/completedCourses`
  - `/editProfile`

Preserve the current routing style unless the task explicitly includes a route normalization change.

## State Management Conventions

There are currently two Redux slices:

- `features/auth`
- `features/catalog`

Important current behavior:

- auth is mocked locally
- login state is persisted through `localStorage`
- the catalog sidebar is driven entirely from mock data in `catalogSlice`
- there is no real backend integration layer yet
- there is no RTK Query or API client in the current frontend

So:

- do not assume auth is real
- do not assume catalog data comes from the backend
- if you add API integration, do it deliberately and make the boundary explicit

Prefer accessing slice state through exported selectors rather than reading nested state inline all over the app.

## Styling Conventions

- Styling is primarily done with Tailwind utility classes.
- Shared semantic utility classes are defined in `src/index.css`.
- Reuse existing semantic classes like `header-btn`, `account-sidebar-navlink`, `profile-card`, etc. when extending an existing UI area.
- Prefer extending the current Tailwind/CSS pattern instead of introducing CSS Modules, styled-components, or another styling system.
- Keep responsive behavior intact. Existing components already use `sm:` and `md:` breakpoints heavily.

## UI Reality Check

A lot of the UI is currently static or placeholder-driven:

- home page is still minimal
- edit profile page is a placeholder
- many course/profile widgets use mock text and hardcoded assets
- auth modal only flips local Redux state and does not submit real credentials

Do not over-engineer around missing backend behavior unless the task specifically asks for implementation.

## Practical Editing Rules

- Check `git status --short` before changing frontend files. There is already an in-progress structural refactor in this area.
- Be careful with imports when moving files. Many paths were recently reorganized.
- Do not edit:
  - `node_modules/`
  - `dist/`
- Treat `.DS_Store` files as irrelevant unless the user explicitly mentions them.
- Keep components as function components.
- Match the existing JavaScript/JSX code style; do not introduce TypeScript unless asked.

## Validation

Run all frontend commands from `frontend/`.

Primary commands:

```sh
npm run dev
npm run lint
npm run build
```

Validation expectations:

- small UI/content/classname change: run `npm run lint`
- route/store/config/large component change: run `npm run lint` and `npm run build`

There is currently no frontend test suite configured in this repo. Do not claim Jest/Vitest/Playwright coverage unless you add it.

## Good Defaults for Agents

- Preserve the current module split instead of collapsing files back into monolithic components.
- Prefer small, local edits that fit the existing structure.
- Keep Russian UI copy consistent with surrounding screens where text already exists in Russian.
- If you introduce new shared state, first decide whether it belongs in a feature slice, local component state, or should remain mock data for now.
