import type { DbClient, Migration } from "./types.js";

export const migrations: Migration[] = [
  {
    id: "001_initial_commerce_schema",
    up: `
      CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
        color_class TEXT NOT NULL,
        garment_class TEXT NOT NULL,
        price REAL NOT NULL CHECK (price >= 0),
        stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
        sort_order INTEGER NOT NULL DEFAULT 0,
        details_json TEXT NOT NULL,
        care_json TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS product_translations (
        product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        lang TEXT NOT NULL CHECK (lang IN ('bg', 'en')),
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        short TEXT NOT NULL,
        description TEXT NOT NULL,
        fit TEXT NOT NULL,
        material TEXT NOT NULL,
        badge TEXT NOT NULL,
        PRIMARY KEY (product_id, lang)
      );

      CREATE TABLE IF NOT EXISTS product_variants (
        id TEXT PRIMARY KEY,
        product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        size TEXT NOT NULL,
        sku TEXT NOT NULL UNIQUE,
        price_delta REAL NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (product_id, size)
      );

      CREATE TABLE IF NOT EXISTS inventory (
        variant_id TEXT PRIMARY KEY REFERENCES product_variants(id) ON DELETE CASCADE,
        quantity INTEGER NOT NULL CHECK (quantity >= 0),
        reserved_quantity INTEGER NOT NULL DEFAULT 0 CHECK (reserved_quantity >= 0),
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS product_images (
        id TEXT PRIMARY KEY,
        product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        storage_provider TEXT NOT NULL DEFAULT 'remote',
        storage_key TEXT NOT NULL,
        url TEXT NOT NULL,
        alt TEXT NOT NULL DEFAULT '',
        mime_type TEXT,
        width INTEGER,
        height INTEGER,
        sort_order INTEGER NOT NULL DEFAULT 0,
        metadata_json TEXT NOT NULL DEFAULT '{}'
      );

      CREATE TABLE IF NOT EXISTS reviews (
        id TEXT PRIMARY KEY,
        product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        customer TEXT NOT NULL,
        rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
        comment TEXT NOT NULL,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS carts (
        id TEXT PRIMARY KEY,
        status TEXT NOT NULL CHECK (status IN ('active', 'ordered', 'abandoned')) DEFAULT 'active',
        currency TEXT NOT NULL DEFAULT 'EUR',
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS cart_items (
        id TEXT PRIMARY KEY,
        cart_id TEXT NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
        product_id TEXT NOT NULL REFERENCES products(id),
        variant_id TEXT NOT NULL REFERENCES product_variants(id),
        quantity INTEGER NOT NULL CHECK (quantity > 0),
        unit_price REAL NOT NULL CHECK (unit_price >= 0),
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (cart_id, variant_id)
      );

      CREATE TABLE IF NOT EXISTS orders (
        id TEXT PRIMARY KEY,
        cart_id TEXT REFERENCES carts(id) ON DELETE SET NULL,
        customer TEXT NOT NULL,
        city TEXT NOT NULL,
        channel TEXT NOT NULL CHECK (channel IN ('address', 'office')),
        payment TEXT NOT NULL CHECK (payment IN ('card', 'cash')),
        status TEXT NOT NULL CHECK (status IN ('pending', 'received', 'traveling', 'ready', 'completed')) DEFAULT 'pending',
        total REAL NOT NULL CHECK (total >= 0),
        currency TEXT NOT NULL DEFAULT 'EUR',
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS order_items (
        id TEXT PRIMARY KEY,
        order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
        product_id TEXT NOT NULL REFERENCES products(id),
        variant_id TEXT REFERENCES product_variants(id),
        quantity INTEGER NOT NULL CHECK (quantity > 0),
        unit_price REAL NOT NULL CHECK (unit_price >= 0)
      );

      CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON product_variants(product_id);
      CREATE INDEX IF NOT EXISTS idx_products_sort_order ON products(sort_order, id);
      CREATE INDEX IF NOT EXISTS idx_product_images_product_order ON product_images(product_id, sort_order);
      CREATE INDEX IF NOT EXISTS idx_reviews_product_created ON reviews(product_id, created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_cart_items_cart_id ON cart_items(cart_id);
      CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
      CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
    `,
  },
  {
    id: "002_home_merchandising",
    up: `
      CREATE TABLE IF NOT EXISTS merchandising_sections (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        is_enabled INTEGER NOT NULL DEFAULT 0,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS merchandising_section_products (
        section_id TEXT NOT NULL REFERENCES merchandising_sections(id) ON DELETE CASCADE,
        product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        sort_order INTEGER NOT NULL DEFAULT 0,
        PRIMARY KEY (section_id, product_id)
      );

      CREATE INDEX IF NOT EXISTS idx_merchandising_section_products_order
        ON merchandising_section_products(section_id, sort_order);

      INSERT INTO merchandising_sections (id, title, is_enabled)
      VALUES ('best-sellers', 'Best Sellers', 0)
      ON CONFLICT(id) DO NOTHING;

      DELETE FROM products WHERE id IN ('relaxed-shirt', 'easy-trouser', 'core-tee');
    `,
  },
];

export function runMigrations(db: DbClient) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id TEXT PRIMARY KEY,
      applied_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  db.transaction(() => {
    for (const migration of migrations) {
      const applied = db.queryOne<{ id: string }>("SELECT id FROM schema_migrations WHERE id = ?", [migration.id]);
      if (applied) continue;

      db.exec(migration.up);
      db.run("INSERT INTO schema_migrations (id) VALUES (?)", [migration.id]);
    }
  });
}
