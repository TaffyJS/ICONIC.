# AGENTS.md

## Application Overview

ICONIC is a single-page React storefront prototype for a limited fashion brand. It presents a seasonal clothing collection, product detail pages, a demo checkout flow, informational footer pages, and an admin dashboard for demo operational data.

Main user flows:
- Browse the home page sections: hero, brand metrics, positioning copy, Summer Collection, Best Sellers, full collection, and brand standard.
- Open product detail pages from collection/showcase cards via hash routes like `#/product/relaxed-shirt`.
- Select a product size, add items to an in-memory cart, and review cart lines in checkout.
- Use the demo checkout UI with delivery method, card/cash payment choice, discount code `ICONIC10`, and a fake submit success message. No real payment is processed.
- Visit footer content pages: New Arrivals, Gift Cards, Shipping, Returns & Exchanges, Size Guide, Contact, The Fabric, G-Town Studio, Journal, and Sustainability.
- View the admin panel at `#/admin`, including overview, stock, orders, delivery, and reviews tabs based on local demo data.

Important features:
- Bilingual Bulgarian/English UI via `dictionaries` in `src/data.ts`; language is persisted in `localStorage` under `iconic-language`.
- Hash-based routing implemented manually in `src/main.tsx`; there is no router library.
- Product, order, stock, review, dictionary, and shared type data live in `src/data.ts`.
- Global style imports live in `src/styles/index.css`, with base/responsive styles in `src/styles/`, shared component styles in `src/components/*/*.css`, and page styles in `src/pages/*/*.css`.
- Static brand images live in `assets/`; product gallery images currently use remote Unsplash URLs.

Primary technology:
- React 19, React DOM, TypeScript, Vite, and `@vitejs/plugin-react`.
- Plain CSS, no CSS framework, no component library, no state management library, and no backend/API layer.
- Architecture is currently a compact single-entry app: most components and route logic are in `src/main.tsx`.

Cannot be determined from the repository:
- Real payment integration details, backend API contracts, authentication, persistence, deployment target, and production CMS/data source are not present.

## Project Structure

- `index.html`: Vite HTML entry, document metadata, favicon/touch icon, image preloads, and `#root`.
- `src/main.tsx`: React entry point only; it imports global styles and renders `App`.
- `src/App.tsx`: Manual hash routing, app-level cart/language state, and route composition.
- `src/components/`: Shared reusable layout/feedback/UI pieces and their component-specific styles.
- `src/pages/`: Route/page implementations grouped by page area, with page-specific CSS beside the page code.
- `src/data.ts`: Shared TypeScript types, bilingual dictionaries, product data, detail labels, demo order/review data, and admin stock/order/review records.
- `src/styles/`: Global CSS entry, base styles, and responsive rules.
- `src/types/`: Shared app-level route/cart/draft types.
- `src/utils/`: Shared utilities for formatting and hash routing.
- `assets/`: Brand/logo/editorial PNG assets referenced from HTML and components.
- `package.json`: npm scripts and dependencies. Current scripts are `dev`, `build`, and `preview`.
- `package-lock.json`: npm lockfile; use npm for dependency operations.
- `vite.config.ts`: Vite config using React plugin.
- `tsconfig.json`: Strict TypeScript config with `noEmit` and React JSX transform.

There are currently no hooks or API logic directories because the app has no backend/API layer. Shared data types remain in `src/data.ts`; app-level route/cart/draft types are in `src/types/app.ts`.

## Development Rules

- Follow the existing page/component folder architecture and keep new route code inside the relevant `src/pages/*` folder.
- Keep manual hash routing consistent with the existing `#/...` and `#section-id` pattern.
- Reuse existing components, helper functions, CSS classes, data types, dictionaries, and layout patterns before creating new ones.
- Keep bilingual copy in `src/data.ts` for global UI labels; page-specific structured content currently lives in `getContentPage` in `src/pages/content/ContentPage.tsx`.
- Preserve existing behavior unless the task explicitly asks to change it.
- Do not perform unrelated refactors or move large sections solely for tidiness.
- Avoid duplicated UI and repeated business logic. If the same card/table/metric pattern grows in multiple places, consider a focused reusable component.
- Keep components focused and prefer composition over large conditional branches when adding new UI.
- Do not introduce a new dependency unless it is clearly necessary and native React/TypeScript/CSS or existing code cannot reasonably solve the task.
- Maintain the current visual language: sharp rectangular controls/cards, heritage boutique colors from CSS variables, responsive CSS grids, and admin dark mode via `body.admin-mode`.
- Keep accessibility consistent: use semantic buttons/links, useful `alt` text for meaningful images, `aria-label` where existing patterns use it, and preserve keyboard-friendly controls.
- Never commit secrets, credentials, API keys, generated build output, local environment files, or unrelated workspace changes.

## Validation Requirements

- Use npm; this repo has `package-lock.json`.
- Determine available commands from `package.json` before running validation.
- Current commands:
  - `npm run dev` starts Vite on `127.0.0.1`.
  - `npm run build` runs `tsc && vite build`.
  - `npm run preview` serves the production build on `127.0.0.1`.
- There are no configured lint or formatter scripts in `package.json`. Do not invent commands such as `npm run lint` or `npm run format`.
- After code changes, run `npm run build` when appropriate and fix errors caused by the change.
- Do not add or run React, TypeScript, unit, integration, end-to-end, or other automated tests unless a future task explicitly asks for tests.
- Do not create test files solely for routine validation.

## Agent Workflow

- Before implementing, inspect the relevant files and search for existing reusable implementations with `rg`.
- Make the smallest coherent change that fully solves the task.
- Keep edits scoped to the requested behavior and do not overwrite user/unrelated changes.
- Update bilingual labels/copy when a user-facing feature appears in both languages.
- After implementation, review the diff for duplication, dead code, accidental changes, inconsistent names, and responsive/accessibility regressions.
- Before reporting changed files to the user, run or verify the app locally so the latest UI can be checked in the browser.
- Report which validation commands were run and whether they passed.
- If a command cannot be run, is not configured, or fails for a pre-existing reason, state that clearly.
