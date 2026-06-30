import type { DbClient } from "../db/types.js";
import type {
  AdminOrderRecord,
  AdminReviewRecord,
  AdminStockItemRecord,
  BestSellerSection,
  CartRecord,
  CreateProductInput,
  OrderRecord,
  PaymentMethod,
  ProductImage,
  ProductRecord,
  ProductTranslation,
  ProductVariant,
  ReviewRecord,
} from "../types/commerce.js";

type ProductRow = {
  id: string;
  color_class: string;
  garment_class: string;
  price: number;
  colors_json: string;
  stock: number;
  sort_order: number;
  details_json: string;
  care_json: string;
};

type TranslationRow = ProductTranslation & {
  product_id: string;
  lang: "bg" | "en";
};

type VariantRow = {
  id: string;
  product_id: string;
  size: string;
  sku: string;
  price_delta: number;
  quantity: number;
  reserved_quantity: number;
};

type ImageRow = {
  id: string;
  product_id: string;
  storage_provider: string;
  storage_key: string;
  url: string;
  alt: string;
  mime_type: string | null;
  width: number | null;
  height: number | null;
  sort_order: number;
  metadata_json: string;
};

type CartItemRow = {
  id: string;
  cart_id: string;
  product_id: string;
  variant_id: string;
  size: string;
  quantity: number;
  unit_price: number;
};

type OrderRow = {
  id: string;
  customer: string;
  city: string;
  created_at: string;
  channel: "address" | "office";
  payment: PaymentMethod;
  status: OrderRecord["status"];
  total: number;
};

type OrderItemRow = {
  product_id: string;
  quantity: number;
};

export type CreateCartItemInput = {
  productId: string;
  size: string;
  quantity: number;
};

export type CreateOrderInput = {
  cartId?: string;
  customer: string;
  city: string;
  channel: "address" | "office";
  payment: PaymentMethod;
  total: number;
  items: CreateCartItemInput[];
};

export type CommerceRepository = {
  hasProducts(): boolean;
  upsertProduct(product: ProductRecord): void;
  upsertReview(review: ReviewRecord): void;
  upsertOrder(order: OrderRecord): void;
  createProduct(input: CreateProductInput): ProductRecord;
  listProducts(): ProductRecord[];
  getProduct(productId: string): ProductRecord | undefined;
  listReviews(): ReviewRecord[];
  listOrders(): OrderRecord[];
  getVariant(productId: string, size: string): ProductVariant | undefined;
  getOrCreateCart(cartId?: string): CartRecord;
  upsertCartItem(cartId: string, input: CreateCartItemInput): CartRecord;
  removeCartItem(cartId: string, productId: string, size: string): CartRecord;
  createOrder(input: CreateOrderInput): OrderRecord;
  getAdminStock(): AdminStockItemRecord[];
  getAdminOrders(): AdminOrderRecord[];
  getAdminReviews(): AdminReviewRecord[];
  getBestSellerSection(): BestSellerSection;
  updateBestSellerSection(input: { title: string; productIds: string[] }): BestSellerSection;
};

export function createCommerceRepository(db: DbClient): CommerceRepository {
  function listProducts(): ProductRecord[] {
    const products = db.query<ProductRow>("SELECT * FROM products ORDER BY sort_order, id");
    return products.map((product) => hydrateProduct(product));
  }

  function hydrateProduct(row: ProductRow): ProductRecord {
    const translations = db.query<TranslationRow>("SELECT * FROM product_translations WHERE product_id = ?", [row.id]);
    const variants = db.query<VariantRow>(
      `
        SELECT product_variants.*, inventory.quantity, inventory.reserved_quantity
        FROM product_variants
        JOIN inventory ON inventory.variant_id = product_variants.id
        WHERE product_variants.product_id = ?
        ORDER BY CASE size WHEN 'XS' THEN 1 WHEN 'S' THEN 2 WHEN 'M' THEN 3 WHEN 'L' THEN 4 WHEN 'XL' THEN 5 ELSE 99 END
      `,
      [row.id],
    );
    const images = db.query<ImageRow>("SELECT * FROM product_images WHERE product_id = ? ORDER BY sort_order, id", [row.id]);
    const sizeStock = Object.fromEntries(variants.map((variant) => [variant.size, variant.quantity]));

    return {
      id: row.id,
      colorClass: row.color_class,
      garmentClass: row.garment_class,
      price: row.price,
      colors: parseColors(row.colors_json, row.color_class),
      gallery: images.map((image) => image.url),
      images: images.map(mapImage),
      sizes: variants.map((variant) => variant.size),
      sizeStock,
      stock: variants.reduce((sum, variant) => sum + variant.quantity, 0),
      details: JSON.parse(row.details_json) as string[],
      care: JSON.parse(row.care_json) as string[],
      translations: {
        bg: mapTranslation(translations.find((translation) => translation.lang === "bg")),
        en: mapTranslation(translations.find((translation) => translation.lang === "en")),
      },
    };
  }

  function getCart(cartId: string): CartRecord | undefined {
    const cart = db.queryOne<{ id: string; status: CartRecord["status"]; currency: "EUR" }>("SELECT * FROM carts WHERE id = ?", [cartId]);
    if (!cart) return undefined;

    const items = db.query<CartItemRow>(
      `
        SELECT cart_items.*, product_variants.size
        FROM cart_items
        JOIN product_variants ON product_variants.id = cart_items.variant_id
        WHERE cart_items.cart_id = ?
        ORDER BY cart_items.created_at
      `,
      [cartId],
    );

    return {
      id: cart.id,
      status: cart.status,
      currency: cart.currency,
      items: items.map((item) => ({
        id: item.id,
        cartId: item.cart_id,
        productId: item.product_id,
        variantId: item.variant_id,
        size: item.size,
        quantity: item.quantity,
        unitPrice: item.unit_price,
      })),
    };
  }

  return {
    hasProducts() {
      return Boolean(db.queryOne<{ count: number }>("SELECT COUNT(*) as count FROM products")?.count);
    },

    upsertProduct(product) {
      db.run(
        `
          INSERT INTO products (id, color_class, garment_class, price, colors_json, stock, sort_order, details_json, care_json)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(id) DO UPDATE SET
            color_class = excluded.color_class,
            garment_class = excluded.garment_class,
            price = excluded.price,
            colors_json = excluded.colors_json,
            stock = excluded.stock,
            sort_order = excluded.sort_order,
            details_json = excluded.details_json,
            care_json = excluded.care_json,
            updated_at = CURRENT_TIMESTAMP
        `,
        [
          product.id,
          product.colorClass,
          product.garmentClass,
          product.price,
          JSON.stringify(product.colors),
          product.stock,
          product.sortOrder ?? 0,
          JSON.stringify(product.details),
          JSON.stringify(product.care),
        ],
      );

      for (const lang of ["bg", "en"] as const) {
        const translation = product.translations[lang];
        db.run(
          `
            INSERT INTO product_translations (product_id, lang, name, category, short, description, fit, material, badge)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(product_id, lang) DO UPDATE SET
              name = excluded.name,
              category = excluded.category,
              short = excluded.short,
              description = excluded.description,
              fit = excluded.fit,
              material = excluded.material,
              badge = excluded.badge
          `,
          [
            product.id,
            lang,
            translation.name,
            translation.category,
            translation.short,
            translation.description,
            translation.fit,
            translation.material,
            translation.badge,
          ],
        );
      }

      for (const size of product.sizes) {
        const variantId = `${product.id}-${size.toLowerCase()}`;
        db.run(
          `
            INSERT INTO product_variants (id, product_id, size, sku)
            VALUES (?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET size = excluded.size, sku = excluded.sku
          `,
          [variantId, product.id, size, `ICONIC-${product.id.toUpperCase()}-${size}`],
        );
        db.run(
          `
            INSERT INTO inventory (variant_id, quantity)
            VALUES (?, ?)
            ON CONFLICT(variant_id) DO UPDATE SET quantity = excluded.quantity, updated_at = CURRENT_TIMESTAMP
          `,
          [variantId, product.sizeStock[size] ?? 0],
        );
      }

      product.gallery.forEach((url, index) => {
        db.run(
          `
            INSERT INTO product_images (id, product_id, storage_provider, storage_key, url, alt, sort_order, metadata_json)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET
              storage_provider = excluded.storage_provider,
              storage_key = excluded.storage_key,
              url = excluded.url,
              alt = excluded.alt,
              sort_order = excluded.sort_order,
              metadata_json = excluded.metadata_json
          `,
          [`${product.id}-image-${index + 1}`, product.id, "remote", url, url, product.translations.en.name, index, "{}"],
        );
      });
    },

    upsertReview(review) {
      db.run(
        `
          INSERT INTO reviews (id, product_id, customer, rating, comment, created_at)
          VALUES (?, ?, ?, ?, ?, ?)
          ON CONFLICT(id) DO UPDATE SET
            product_id = excluded.product_id,
            customer = excluded.customer,
            rating = excluded.rating,
            comment = excluded.comment,
            created_at = excluded.created_at
        `,
        [review.id, review.productId, review.customer, review.rating, review.comment, review.createdAt],
      );
    },

    upsertOrder(order) {
      db.run(
        `
          INSERT INTO orders (id, customer, city, channel, payment, status, total, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(id) DO UPDATE SET
            customer = excluded.customer,
            city = excluded.city,
            channel = excluded.channel,
            payment = excluded.payment,
            status = excluded.status,
            total = excluded.total,
            created_at = excluded.created_at
        `,
        [order.id, order.customer, order.city, order.channel, order.payment, order.status, order.total, order.createdAt],
      );
      db.run("DELETE FROM order_items WHERE order_id = ?", [order.id]);
      for (const item of order.items) {
        const variant = db.queryOne<{ id: string }>("SELECT id FROM product_variants WHERE product_id = ? ORDER BY size LIMIT 1", [item.productId]);
        db.run(
          "INSERT INTO order_items (id, order_id, product_id, variant_id, quantity, unit_price) VALUES (?, ?, ?, ?, ?, ?)",
          [`${order.id}-${item.productId}`, order.id, item.productId, variant?.id ?? null, item.quantity, order.total / Math.max(1, item.quantity)],
        );
      }
    },

    createProduct(input) {
      return db.transaction(() => {
        const id = input.id || slugify(input.name);
        const existingProductCount = db.queryOne<{ count: number }>("SELECT COUNT(*) as count FROM products")?.count ?? 0;
        const product: ProductRecord = {
          id,
          sortOrder: existingProductCount,
          colorClass: getToneClass(input.color),
          garmentClass: getGarmentClass(input.category, input.name),
          price: input.price,
          colors: [{ name: input.color, hex: getToneHex(input.color) }],
          gallery: input.imageUrls,
          images: [],
          sizes: input.sizes,
          sizeStock: input.sizeStock,
          stock: Object.values(input.sizeStock).reduce((sum, value) => sum + value, 0),
          details: input.details,
          care: input.care,
          translations: {
            bg: input.translations?.bg ?? {
              name: input.name,
              category: input.category,
              short: input.short,
              description: input.description,
              fit: input.fit,
              material: input.material,
              badge: input.badge,
            },
            en: input.translations?.en ?? {
              name: input.name,
              category: input.category,
              short: input.short,
              description: input.description,
              fit: input.fit,
              material: input.material,
              badge: input.badge,
            },
          },
        };

        this.upsertProduct(product);
        return this.getProduct(id) as ProductRecord;
      });
    },

    listProducts,

    getProduct(productId) {
      const product = db.queryOne<ProductRow>("SELECT * FROM products WHERE id = ?", [productId]);
      return product ? hydrateProduct(product) : undefined;
    },

    listReviews() {
      return db.query<{ id: string; product_id: string; customer: string; rating: number; comment: string; created_at: string }>(
        "SELECT * FROM reviews ORDER BY created_at DESC",
      ).map((review) => ({
        id: review.id,
        productId: review.product_id,
        customer: review.customer,
        rating: review.rating,
        comment: review.comment,
        createdAt: review.created_at,
      }));
    },

    listOrders() {
      return db.query<OrderRow>("SELECT * FROM orders ORDER BY created_at DESC").map((order) => ({
        id: order.id,
        customer: order.customer,
        city: order.city,
        createdAt: order.created_at,
        channel: order.channel,
        payment: order.payment,
        status: order.status,
        total: order.total,
        items: db.query<OrderItemRow>("SELECT product_id, quantity FROM order_items WHERE order_id = ?", [order.id]).map((item) => ({
          productId: item.product_id,
          quantity: item.quantity,
        })),
      }));
    },

    getVariant(productId, size) {
      const variant = db.queryOne<VariantRow>(
        `
          SELECT product_variants.*, inventory.quantity, inventory.reserved_quantity
          FROM product_variants
          JOIN inventory ON inventory.variant_id = product_variants.id
          WHERE product_variants.product_id = ? AND product_variants.size = ?
        `,
        [productId, size],
      );
      return variant
        ? {
            id: variant.id,
            productId: variant.product_id,
            size: variant.size,
            sku: variant.sku,
            priceDelta: variant.price_delta,
            quantity: variant.quantity,
            reservedQuantity: variant.reserved_quantity,
          }
        : undefined;
    },

    getOrCreateCart(cartId) {
      if (cartId) {
        const existing = getCart(cartId);
        if (existing) return existing;
      }

      const id = cartId || `cart-${crypto.randomUUID()}`;
      db.run("INSERT INTO carts (id) VALUES (?)", [id]);
      return getCart(id) as CartRecord;
    },

    upsertCartItem(cartId, input) {
      return db.transaction(() => {
        const cart = this.getOrCreateCart(cartId);
        const product = this.getProduct(input.productId);
        const variant = this.getVariant(input.productId, input.size);
        if (!product || !variant) throw new Error("Product variant not found");
        if (input.quantity < 1) throw new Error("Quantity must be greater than zero");

        db.run(
          `
            INSERT INTO cart_items (id, cart_id, product_id, variant_id, quantity, unit_price)
            VALUES (?, ?, ?, ?, ?, ?)
            ON CONFLICT(cart_id, variant_id) DO UPDATE SET
              quantity = cart_items.quantity + excluded.quantity,
              updated_at = CURRENT_TIMESTAMP
          `,
          [`cart-item-${crypto.randomUUID()}`, cart.id, input.productId, variant.id, input.quantity, product.price + variant.priceDelta],
        );
        db.run("UPDATE carts SET updated_at = CURRENT_TIMESTAMP WHERE id = ?", [cart.id]);
        return getCart(cart.id) as CartRecord;
      });
    },

    removeCartItem(cartId, productId, size) {
      return db.transaction(() => {
        const variant = this.getVariant(productId, size);
        if (variant) {
          db.run("DELETE FROM cart_items WHERE cart_id = ? AND variant_id = ?", [cartId, variant.id]);
        }
        db.run("UPDATE carts SET updated_at = CURRENT_TIMESTAMP WHERE id = ?", [cartId]);
        return this.getOrCreateCart(cartId);
      });
    },

    createOrder(input) {
      return db.transaction(() => {
        const orderId = `ORD-${Date.now()}`;
        db.run(
          `
            INSERT INTO orders (id, cart_id, customer, city, channel, payment, status, total, created_at)
            VALUES (?, ?, ?, ?, ?, ?, 'pending', ?, ?)
          `,
          [orderId, input.cartId ?? null, input.customer, input.city, input.channel, input.payment, input.total, formatLocalDate(new Date())],
        );

        for (const item of input.items) {
          const product = this.getProduct(item.productId);
          const variant = this.getVariant(item.productId, item.size);
          if (!product || !variant) throw new Error("Product variant not found");
          db.run(
            "INSERT INTO order_items (id, order_id, product_id, variant_id, quantity, unit_price) VALUES (?, ?, ?, ?, ?, ?)",
            [`order-item-${crypto.randomUUID()}`, orderId, item.productId, variant.id, item.quantity, product.price + variant.priceDelta],
          );
        }

        if (input.cartId) {
          db.run("UPDATE carts SET status = 'ordered', updated_at = CURRENT_TIMESTAMP WHERE id = ?", [input.cartId]);
        }

        return this.listOrders().find((order) => order.id === orderId) as OrderRecord;
      });
    },

    getAdminStock() {
      return listProducts().map((product) => ({
        product: product.translations.en.name,
        category: product.translations.en.category,
        sizes: {
          XS: product.sizeStock.XS ?? 0,
          S: product.sizeStock.S ?? 0,
          M: product.sizeStock.M ?? 0,
          L: product.sizeStock.L ?? 0,
          XL: product.sizeStock.XL ?? 0,
        },
        total: product.stock,
      }));
    },

    getAdminOrders() {
      return this.listOrders().map((order) => ({
        order: order.id.replace("ORD-", "GT-"),
        customer: order.customer,
        items: order.items.map((item) => this.getProduct(item.productId)?.translations.en.name ?? item.productId).join(", "),
        totalBgn: `${order.total.toFixed(2)} BGN`,
        payment: order.payment === "card" ? "Card" : "Cash on delivery",
        status: mapAdminStatus(order.status),
        date: order.createdAt,
        deliveryMethod: order.channel === "address" ? "Address" : "Office",
      }));
    },

    getAdminReviews() {
      return this.listReviews().map((review) => ({
        customer: review.customer,
        date: review.createdAt,
        product: this.getProduct(review.productId)?.translations.en.name ?? review.productId,
        comment: review.comment,
        rating: review.rating,
        flagged: review.rating <= 2,
      }));
    },

    getBestSellerSection() {
      const section = db.queryOne<{ title: string; is_enabled: number }>(
        "SELECT title, is_enabled FROM merchandising_sections WHERE id = 'best-sellers'",
      ) ?? { title: "Best Sellers", is_enabled: 0 };
      const productIds = db
        .query<{ product_id: string }>(
          "SELECT product_id FROM merchandising_section_products WHERE section_id = 'best-sellers' ORDER BY sort_order, product_id",
        )
        .map((row) => row.product_id);
      const selectedProducts = productIds
        .map((productId) => this.getProduct(productId))
        .filter((product): product is ProductRecord => Boolean(product));

      return {
        title: section.title,
        productIds,
        products: section.is_enabled && selectedProducts.length >= 2 ? selectedProducts : [],
      };
    },

    updateBestSellerSection(input) {
      return db.transaction(() => {
        const productIds = Array.from(new Set(input.productIds)).filter((productId) => this.getProduct(productId));
        db.run(
          `
            INSERT INTO merchandising_sections (id, title, is_enabled, updated_at)
            VALUES ('best-sellers', ?, ?, CURRENT_TIMESTAMP)
            ON CONFLICT(id) DO UPDATE SET
              title = excluded.title,
              is_enabled = excluded.is_enabled,
              updated_at = CURRENT_TIMESTAMP
          `,
          [input.title.trim() || "Best Sellers", productIds.length >= 2 ? 1 : 0],
        );
        db.run("DELETE FROM merchandising_section_products WHERE section_id = 'best-sellers'");
        productIds.forEach((productId, index) => {
          db.run(
            "INSERT INTO merchandising_section_products (section_id, product_id, sort_order) VALUES ('best-sellers', ?, ?)",
            [productId, index],
          );
        });
        return this.getBestSellerSection();
      });
    },
  };
}

function mapImage(image: ImageRow): ProductImage {
  return {
    id: image.id,
    productId: image.product_id,
    storageProvider: image.storage_provider,
    storageKey: image.storage_key,
    url: image.url,
    alt: image.alt,
    mimeType: image.mime_type ?? undefined,
    width: image.width ?? undefined,
    height: image.height ?? undefined,
    sortOrder: image.sort_order,
    metadata: JSON.parse(image.metadata_json) as Record<string, unknown>,
  };
}

function mapTranslation(translation?: TranslationRow): ProductTranslation {
  if (!translation) {
    return { name: "", category: "", short: "", description: "", fit: "", material: "", badge: "" };
  }

  return {
    name: translation.name,
    category: translation.category,
    short: translation.short,
    description: translation.description,
    fit: translation.fit,
    material: translation.material,
    badge: translation.badge,
  };
}

function parseColors(value: string, colorClass: string) {
  try {
    const parsed = JSON.parse(value) as Array<{ name?: unknown; hex?: unknown }>;
    const colors = parsed
      .filter((color) => typeof color.name === "string" && typeof color.hex === "string")
      .map((color) => ({ name: String(color.name), hex: String(color.hex) }));
    if (colors.length > 0) return colors;
  } catch {
    // Fall back to a single swatch for products created before color options existed.
  }

  return [{ name: colorClass.replace(/^tone-/, ""), hex: getToneHex(colorClass) }];
}

function mapAdminStatus(status: OrderRecord["status"]): AdminOrderRecord["status"] {
  if (status === "completed") return "Delivered";
  if (status === "traveling" || status === "ready") return "In transit";
  if (status === "pending" || status === "received") return "Processing";
  return "Processing";
}

function formatLocalDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function slugify(value: string) {
  return (
    value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || `product-${Date.now()}`
  );
}

function getToneClass(color: string) {
  const normalized = color.toLowerCase();
  if (normalized.includes("green") || normalized.includes("moss")) return "tone-green";
  if (normalized.includes("clay") || normalized.includes("black") || normalized.includes("dark")) return "tone-clay";
  return "tone-cream";
}

function getToneHex(color: string) {
  const normalized = color.toLowerCase();
  if (normalized.includes("green") || normalized.includes("moss")) return "#2f5d4d";
  if (normalized.includes("clay") || normalized.includes("coral") || normalized.includes("terra")) return "#c94e2a";
  if (normalized.includes("black") || normalized.includes("dark")) return "#1c1510";
  if (normalized.includes("sky") || normalized.includes("blue")) return "#a8d4d2";
  if (normalized.includes("navy")) return "#1a2b5f";
  return "#f2ede4";
}

function getGarmentClass(category: string, name: string) {
  const normalized = `${category} ${name}`.toLowerCase();
  if (normalized.includes("trouser") || normalized.includes("pant")) return "garment-trouser";
  if (normalized.includes("tee") || normalized.includes("t-shirt")) return "garment-tee";
  return "garment-shirt";
}
