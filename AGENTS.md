# AGENTS.md

## Application Overview

ICONIC is a React storefront prototype for a limited fashion brand with a standalone Node.js API and local SQLite database layer. The frontend is a single-page Vite app with manual hash routing. The backend supports courier data, catalog/admin/cart/order APIs, local persistence, migrations, seed data, storage references, and request validation outside of Vite.

Main user flows:
- Browse the home page sections: hero, brand metrics, positioning copy, database-backed collection, optional admin-selected Best Sellers, and brand standard.
- Open product detail pages from collection/showcase cards via hash routes like `#/product/relaxed-shirt`.
- Select a product size, add items to an in-memory cart, and review cart lines in checkout.
- Use the demo checkout UI with delivery method, card/cash payment choice, discount code `ICONIC10`, courier office pickup, and a fake submit success message. No real payment is processed.
- Visit footer content pages: New Arrivals, Gift Cards, Shipping, Returns & Exchanges, Size Guide, Contact, The Fabric, G-Town Studio, Journal, and Sustainability.
- View the admin panel at `#/admin`, including overview, stock, orders, delivery, and reviews tabs based on local demo data.

Important features:
- Bilingual Bulgarian/English UI via `dictionaries` in `src/data.ts`; language is persisted in `localStorage` under `iconic-language`.
- Hash-based routing is implemented manually in `src/utils/routing.ts` and exposed to the app through `src/hooks/useHashRoute.ts`; there is no router library.
- Product, order, stock, review, dictionary, and shared fallback demo data live in `src/data.ts`.
- Runtime catalog/admin/cart/order data comes from the Node API. Product cards are not seeded with demo products; an empty database should render an empty product state until products are saved from admin.
- Checkout courier API calls use the frontend service boundary in `src/services/courierApi.ts`; commerce API calls use `src/services/commerceApi.ts`.
- The Node API exposes `/health`, `/api/couriers/*`, `/api/catalog`, `/api/products/*`, `/api/carts/*`, `/api/orders`, and `/api/admin/dashboard`; Vite proxies `/api` to the Node server during dev/preview.
- Local database schema includes products, product translations, product variants, inventory, reviews, carts, cart items, orders, order items, and product image references/metadata.
- Best Sellers are configured from the admin merchandising tab and display on the home page only when at least two products are selected.
- Image binaries are not stored in the database. Store image references, storage provider, storage key, URL, alt text, and metadata.
- Fallback courier data lives in `server/db/couriers.json`; live courier provider calls are isolated in `server/src/api/`.
- Static brand images live in `assets/`; product gallery images currently use remote Unsplash URLs.

Primary technology:
- Frontend: React 19, React DOM, TypeScript, Vite, and `@vitejs/plugin-react`.
- Backend: Node.js built-in HTTP server, TypeScript, native `fetch`, Node SQLite for local persistence, and a JSON fallback data store for courier offices.
- Styling: plain CSS, no CSS framework, no component library, no state management library.
- Package manager: npm with `package-lock.json`.

Out of scope / not present:
- Real payment processing, authentication, production CMS/data source, deployment scripts, PostgreSQL adapter, and Azure Blob implementation are not implemented.

## Project Structure

- `index.html`: Vite HTML entry, document metadata, favicon/touch icon, image preloads, and `#root`.
- `src/main.tsx`: React entry point only; it imports global styles and renders `App`.
- `src/App.tsx`: Route composition and top-level app wiring. Keep it thin; move reusable behavior into hooks/state/services.
- `src/components/`: Shared reusable layout/feedback/UI pieces and their component-specific styles.
- `src/pages/`: Route/page implementations grouped by page area, with page-specific CSS beside page code.
- `src/hooks/`: Reusable frontend behavior such as language persistence, hash route tracking, scroll restoration, admin body mode, product route state, and cart access.
- `src/services/`: Browser-side API clients and shared HTTP helpers. Do not call `fetch` directly from page components when a service boundary exists.
- `src/state/`: Pure frontend state helpers and reducers. Keep side effects in hooks or services, not pure state helpers.
- `src/config/`: Frontend constants such as localStorage keys.
- `src/types/`: Shared app-level route/cart/draft/courier types used by the frontend.
- `src/utils/`: Shared frontend utilities for formatting and hash routing.
- `src/styles/`: Global CSS entry, base styles, and responsive rules.
- `server/src/index.ts`: API process entry point.
- `server/src/app.ts`: HTTP server composition and top-level route dispatch.
- `server/src/config/`: Environment loading and typed runtime config.
- `server/src/db/`: Database connection, migrations, seed data, and bootstrap. Keep SQL migration work here.
- `server/src/routes/`: Request method/path routing.
- `server/src/controllers/`: HTTP request handling, validation result handling, and response shaping.
- `server/src/services/`: Business logic and fallback/live source decisions.
- `server/src/repositories/`: Local data access, currently the JSON courier fallback store.
- `server/src/storage/`: Storage abstraction for local image references now and Azure Blob later.
- `server/src/api/`: Upstream API clients for Speedy/Econt and shared upstream HTTP helper.
- `server/src/validation/`: Request parsing and validation for API inputs.
- `server/src/http/`: Low-level HTTP JSON helpers.
- `server/src/types/`: Backend-specific courier and config-adjacent domain types.
- `server/db/`: Lightweight JSON courier fallback data and ignored local SQLite files.
- `server/test/`: Node test files for backend database/repository behavior.
- `docs/architecture.md`: Project architecture, local DB/storage setup, and Azure migration notes.
- `assets/`: Brand/logo/editorial PNG assets referenced from HTML and components.
- `vite.config.ts`: Vite React config and `/api` proxy only. Do not put backend route logic here.
- `tsconfig.json`: Strict frontend TypeScript config with `noEmit`.
- `tsconfig.server.json`: Backend TypeScript config that emits compiled API files to ignored `server-dist/`.

## Architecture Conventions

Frontend:
- Keep route/page code inside the relevant `src/pages/*` folder.
- Keep reusable UI in `src/components/*`; avoid duplicating cards, buttons, tables, and repeated metrics when a focused component would fit existing patterns.
- Keep reusable behavior in `src/hooks/*`; hooks may coordinate browser APIs, localStorage, timers, and app state.
- Keep pure cart/state transformations in `src/state/*`; pure helpers should not access the DOM, storage, network, or timers.
- Keep browser API calls in `src/services/*`; pages/components should consume typed service functions.
- Keep app-level route/cart/draft types in `src/types/*`. Shared demo data types that are tightly coupled to `src/data.ts` may remain there.
- Keep bilingual global UI labels in `src/data.ts`; update both Bulgarian and English when adding user-facing labels.
- Keep manual hash routing consistent with existing `#/...` and `#section-id` behavior.

Backend:
- Keep `server/src/index.ts` limited to process startup.
- Keep server construction and global routing in `server/src/app.ts`.
- Add new endpoint families as `routes -> controllers -> validation -> services -> repositories/api clients`.
- Controllers should validate input, call services, and return JSON. They should not know provider credential details or fallback data shapes.
- Services should own business decisions, such as live-vs-fallback courier data and quote estimation.
- Repositories should own local data access. Keep SQL and database projections out of controllers and React.
- Use migrations for schema changes, indexes for lookup paths, foreign keys for relations, and repository/service transactions for multi-write operations.
- Keep database logic separate from business logic: repositories talk SQL, services decide behavior, controllers shape HTTP.
- Design new repository/service interfaces so a PostgreSQL adapter can replace SQLite with minimal controller/frontend changes.
- API clients should own upstream request details, auth headers, endpoint URLs, and response mapping for external providers.
- Validation functions should return typed success/error results and should not throw for normal bad input.
- Keep Vite config free of backend logic; use the Vite proxy to forward `/api` to the Node server.

## Development Rules

- Preserve existing behavior unless the task explicitly asks to change it.
- Do not perform unrelated refactors or move large sections solely for tidiness.
- Prefer native React/TypeScript/CSS and the existing Node standard-library backend. Do not introduce a dependency unless it clearly reduces real complexity.
- Maintain the current visual language: sharp rectangular controls/cards, heritage boutique colors from CSS variables, responsive CSS grids, and admin dark mode via `body.admin-mode`.
- Keep accessibility consistent: semantic buttons/links, useful `alt` text for meaningful images, `aria-label` where existing patterns use it, and keyboard-friendly controls.
- Never commit secrets, credentials, API keys, generated build output, local environment files, or unrelated workspace changes.
- Treat `server-dist/`, `dist/`, `node_modules/`, and local SQLite files under `server/db/*.sqlite*` as generated/ignored output.

## Environment

Expected local API variables:
- `API_HOST=127.0.0.1`
- `API_PORT=8787`
- `API_PROXY_TARGET=http://127.0.0.1:8787`
- `CORS_ORIGIN=http://127.0.0.1:5173`
- `DB_PROVIDER=sqlite`
- `DATABASE_URL=sqlite:server/db/iconic.sqlite`
- `STORAGE_PROVIDER=local`
- `LOCAL_STORAGE_ROOT=assets`
- `STORAGE_PUBLIC_BASE_URL=/assets`
- Future Azure storage: `AZURE_STORAGE_CONNECTION_STRING`, `AZURE_STORAGE_CONTAINER`
- `SPEEDY_API_URL`, `SPEEDY_USERNAME`, `SPEEDY_PASSWORD`
- `ECONT_API_URL`, `ECONT_USERNAME`, `ECONT_PASSWORD`, `ECONT_USE_DEMO`

Keep `.env.example` updated when adding configuration. Do not commit real `.env` files.

## Validation Requirements

- Use npm; this repo has `package-lock.json`.
- Determine available commands from `package.json` before running validation.
- Current commands:
  - `npm run api` builds the TypeScript API and starts the compiled Node server from `server-dist/`.
  - `npm run build:api` type-checks and compiles the backend only.
  - `npm run db:migrate` compiles and applies local database migrations.
- `npm run db:seed` compiles, migrates, and runs the seed step. It does not create demo products.
  - `npm run dev` starts Vite on `127.0.0.1` and proxies `/api` to the Node API target.
  - `npm run build` runs frontend TypeScript, backend TypeScript, and the Vite production build.
  - `npm run preview` serves the production build on `127.0.0.1` and uses the same `/api` proxy target.
- `npm test` compiles the backend and runs Node tests for database/repository behavior.
- There are no configured lint, formatter, integration test, or end-to-end scripts. Do not invent commands such as `npm run lint` or `npm run format`.
- After code changes, run `npm run build` when appropriate and fix errors caused by the change.
- When backend behavior changes, also run or smoke-test `npm run api` and hit the affected endpoint(s).
- Before reporting UI-facing changes, run or verify the app locally so the latest UI can be checked in the browser.

## Agent Workflow

- Before implementing, inspect relevant files and search for existing reusable implementations with `rg`.
- Make the smallest coherent change that fully solves the task.
- Keep edits scoped to the requested behavior and do not overwrite user/unrelated changes.
- Update bilingual labels/copy when a user-facing feature appears in both languages.
- Review the diff for duplication, dead code, accidental changes, inconsistent names, type looseness, and responsive/accessibility regressions.
- Report which validation commands were run and whether they passed.
- If a command cannot be run, is not configured, or fails for a pre-existing reason, state that clearly.
