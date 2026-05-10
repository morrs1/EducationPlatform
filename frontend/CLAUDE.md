# CLAUDE.md - frontend

React 19 client for the EducationPlatform monorepo. Vite, React Router 7, Redux Toolkit, Tailwind CSS 4. JavaScript / JSX, not TypeScript. Layout follows Feature-Sliced Design (FSD). Auth and catalog are currently mocked locally; there is no real backend integration yet.

## Read first

Read these before editing, in order:

1. `frontend/AGENTS.md` - architecture, routing, state slices, styling, validation. Authoritative for this service.
2. Root `CLAUDE.md` - monorepo overview and validation bar.
3. Root `.cursor/rules/monorepo.mdc` - cross-service orientation.

The root `.cursor/rules/clean-architecture.mdc`, `ddd.mdc`, and `tdd.mdc` are backend-oriented (Java + Python services). Do not apply them to the frontend.

## Architecture map

FSD has six layers. Higher layers may import from lower layers. The reverse is forbidden.

```
app -> pages -> widgets -> features -> entities -> shared
```

| Layer      | Purpose                                | Currently contains                                                              |
|------------|----------------------------------------|---------------------------------------------------------------------------------|
| `app/`     | Bootstrap, router, store, providers    | `entry/`, `router/AppRouter.jsx`, `layout/`, `store/index.js`, `providers/`     |
| `pages/`   | Route-level screens                    | `account`, `admin`, `course`, `course-builder`, `edit-profile`, `home`, `lesson`, `lesson-editor`, `search`, `teach` |
| `widgets/` | Composed UI sections                   | `header`, `footer`, `auth-modal`, `catalog-sidebar`, `course-*`, `account-sidebar`, `profile-section`, etc. |
| `features/`| Feature state and public exports       | `auth`, `catalog`, `assistant`, `change-email`, `change-password`, `lesson-session`, `theme`, `update-profile`, `viewer` |
| `entities/`| Reusable domain pieces                 | `course`, `lesson`, `user`, `viewer`                                            |
| `shared/`  | Shared infra (api, lib)                | `api/`, `lib/`                                                                  |

Per-slice public APIs live in `index.js`. Internal structure inside a slice is `ui/` (components) and `model/` (Redux logic, selectors).

## Hard rules

- Layer order is strict: `app -> pages -> widgets -> features -> entities -> shared`. Higher imports lower; never the reverse.
- Import another slice only through its public `index.js`. Do not reach into a sibling slice's internal files.
- For unavoidable same-layer cross-slice contracts, use the explicit `@x/<consumer>.js` pattern.
- Feature slices are flat. Do not create `src/features/user/change-email`. Use a top-level `src/features/change-email/` instead.
- Widgets do not compose other widgets. Compose widgets only from `app` or `pages`. Move private widget parts inside the owning widget slice.
- Do not recreate legacy folders: `src/components/`, old `src/pages/*.jsx`, old `src/features/account/...`.
- Function components only. No class components.
- Tailwind utility classes first. Reuse the semantic classes already defined in `src/index.css` (for example `header-btn`, `account-sidebar-navlink`, `profile-card`) when extending an existing UI area.
- No TypeScript. Match the existing JSX style. Do not add `.ts` / `.tsx` files.
- `auth` and `catalog` are mocked. Do not assume a backend exists. Login state is persisted via `localStorage`; the catalog sidebar reads mock data from `catalogSlice`.
- Access slice state through exported selectors, not inline `state.xxx.yyy` reads scattered across components.
- Keep app bootstrap in `src/main.jsx`; the root component comes from `src/app/entry`. Router setup stays in `src/app/router/AppRouter.jsx`. Store wiring stays in `src/app/store/index.js`. Provider wiring stays in `src/app/providers/StoreProvider.jsx`.
- Routing primitives are imported from `react-router`. Existing route paths use camelCase (for example `/account/currentCourses`, `/editProfile`); preserve that style unless the task explicitly normalizes routes.

## Anti-patterns

- A `.ts` or `.tsx` file appearing anywhere under `src/`.
- CSS Modules, styled-components, Emotion, or any styling system other than Tailwind + `src/index.css` semantic classes.
- A widget importing another widget.
- Importing a private path from another slice (for example `features/auth/model/authSlice.js` from outside `features/auth`).
- Adding a route definition outside `src/app/router/AppRouter.jsx`.
- Nested feature slices (`features/<feature>/<sub-feature>/`).
- Reading `state.auth.isAuthenticated` (etc.) directly in a component instead of going through a selector.
- Inventing an API client where none exists. If you add one, place it under `shared/api/` and make the boundary explicit.

## Validation

Run all commands from `frontend/`.

```sh
npm run lint
npm run build
```

`npm run lint` runs ESLint 9 plus the FSD boundary checker in `tools/check-fsd.mjs`. The checker is authoritative on layer boundaries - if it disagrees with this document, the checker wins.

Validation expectations:

- Small UI / content / classname change: `npm run lint`.
- Route, store, config, or large component change: `npm run lint` and `npm run build`.

There is no test framework configured in this repo. Do not claim Jest, Vitest, or Playwright coverage unless you add it intentionally as part of the task.
