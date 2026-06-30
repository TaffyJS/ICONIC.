# ICONIC Architecture

## Overview

ICONIC is split into a React/Vite frontend and a standalone Node.js/TypeScript API. Vite owns frontend development and proxies `/api` calls to the API. The API owns courier integrations, commerce data, local persistence, validation, transactions, and future cloud provider seams.

## Local Database

The local database adapter uses Node's built-in SQLite module. Database access is isolated behind repository interfaces so the SQL adapter can later be replaced with Azure Database for PostgreSQL without changing controllers or React code.

Default local configuration:

```env
DB_PROVIDER=sqlite
DATABASE_URL=sqlite:server/db/iconic.sqlite
```

Commands:

```bash
npm run db:migrate
npm run db:seed
npm run api
```

`npm run api` also bootstraps migrations on startup for local development. The seed step intentionally does not create demo products; product cards should come from products saved through the admin/database flow.

## Schema

Commerce tables:
- `products`
- `product_translations`
- `product_variants`
- `inventory`
- `product_images`
- `reviews`
- `carts`
- `cart_items`
- `orders`
- `order_items`
- `merchandising_sections`
- `merchandising_section_products`
- `schema_migrations`

Important relationships:
- Product translations, variants, images, and reviews cascade from `products`.
- Inventory is keyed by `product_variants`.
- Cart items reference carts, products, and variants.
- Order items reference orders, products, and variants.

Images store references and metadata only. Binary image files are not stored in the database.

## Backend Layers

- `server/src/routes`: path and method routing.
- `server/src/controllers`: request validation handling and JSON response shaping.
- `server/src/validation`: typed parsing for bad-input paths.
- `server/src/services`: business rules and orchestration.
- `server/src/repositories`: database access and local projections.
- `server/src/db`: database client, migrations, seeding, and bootstrap.
- `server/src/api`: external courier API clients.
- `server/src/storage`: storage abstraction for image references.

## Frontend Data Flow

- `src/services/commerceApi.ts` calls catalog, cart, order, and admin APIs.
- `src/hooks/useCatalogData.ts` loads product/order/review data from `/api/catalog`.
- `src/hooks/useAdminDashboard.ts` loads admin stock/order/review projections from `/api/admin/dashboard`.
- `src/hooks/useCart.ts` keeps the UI instant with local state while syncing cart mutations to `/api/carts/*`.
- Checkout submission calls `/api/orders` and preserves the existing demo success flow.
- The home Best Sellers band reads the `best-sellers` merchandising section and renders only when two or more products are selected in admin.

The product grid does not fall back to demo products. If the local API has no products, the home page shows an empty product state.

## Storage

Local storage configuration:

```env
STORAGE_PROVIDER=local
LOCAL_STORAGE_ROOT=assets
STORAGE_PUBLIC_BASE_URL=/assets
```

The storage service currently creates image reference records for remote/local URLs. A future Azure Blob implementation should keep the same service contract and return:
- `storageProvider`
- `storageKey`
- `url`
- `alt`
- metadata

## Azure PostgreSQL Migration Path

1. Add a PostgreSQL database adapter implementing `DbClient` or a richer repository adapter under `server/src/db`.
2. Set:

```env
DB_PROVIDER=postgres
DATABASE_URL=postgres://USER:PASSWORD@HOST:5432/DATABASE?sslmode=require
```

3. Port migration SQL from SQLite-compatible syntax to PostgreSQL where needed.
4. Keep controllers, services, validation, and frontend API clients unchanged.
5. Run migrations against Azure Database for PostgreSQL.
6. Seed non-production data only when explicitly needed.

## Azure Blob Storage Migration Path

1. Add an Azure implementation behind `StorageService`.
2. Set:

```env
STORAGE_PROVIDER=azure-blob
AZURE_STORAGE_CONNECTION_STRING=...
AZURE_STORAGE_CONTAINER=...
STORAGE_PUBLIC_BASE_URL=https://<account>.blob.core.windows.net/<container>
```

3. Store only blob keys, public URLs, dimensions, MIME type, alt text, and metadata in `product_images`.
4. Keep product API response shape unchanged so React image rendering does not change.

## Validation

Use:

```bash
npm run build
npm test
```

There is currently no lint script configured.
