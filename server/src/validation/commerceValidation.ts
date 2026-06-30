import type { CreateCartItemInput, CreateOrderInput } from "../repositories/commerceRepository.js";
import type { CreateProductInput } from "../types/commerce.js";

type ValidationResult<T> = { ok: true; value: T } | { ok: false; error: string };

export function parseCartItemRequest(body: Record<string, unknown>): ValidationResult<CreateCartItemInput> {
  const productId = String(body.productId || "").trim();
  const size = String(body.size || "").trim();
  const quantity = Number(body.quantity || 1);

  if (!productId || !size) {
    return { ok: false, error: "productId and size are required" };
  }
  if (!Number.isInteger(quantity) || quantity < 1) {
    return { ok: false, error: "quantity must be a positive integer" };
  }

  return { ok: true, value: { productId, size, quantity } };
}

export function parseOrderRequest(body: Record<string, unknown>): ValidationResult<CreateOrderInput> {
  const customer = String(body.customer || "Demo Customer").trim();
  const city = String(body.city || "Sofia").trim();
  const channel = String(body.channel || "address");
  const payment = String(body.payment || "card");
  const total = Number(body.total || 0);
  const rawItems = Array.isArray(body.items) ? body.items : [];

  if (!customer || !city) {
    return { ok: false, error: "customer and city are required" };
  }
  if (channel !== "address" && channel !== "office") {
    return { ok: false, error: "channel must be address or office" };
  }
  if (payment !== "card" && payment !== "cash") {
    return { ok: false, error: "payment must be card or cash" };
  }
  if (!Number.isFinite(total) || total < 0) {
    return { ok: false, error: "total must be a non-negative number" };
  }

  const items: CreateCartItemInput[] = [];
  for (const item of rawItems) {
    if (!item || typeof item !== "object") {
      return { ok: false, error: "items must contain objects" };
    }
    const parsed = parseCartItemRequest(item as Record<string, unknown>);
    if (!parsed.ok) return parsed;
    items.push(parsed.value);
  }

  if (items.length === 0) {
    return { ok: false, error: "at least one order item is required" };
  }

  return {
    ok: true,
    value: {
      cartId: typeof body.cartId === "string" ? body.cartId : undefined,
      customer,
      city,
      channel,
      payment,
      total,
      items,
    },
  };
}

export function parseProductRequest(body: Record<string, unknown>): ValidationResult<CreateProductInput> {
  const name = String(body.name || "").trim();
  const category = String(body.category || "").trim();
  const price = Number(body.price);
  const description = String(body.description || "").trim();
  const sizes = Array.isArray(body.sizes) ? body.sizes.map(String).map((size) => size.trim()).filter(Boolean) : [];
  const sizeStock = isRecord(body.sizeStock) ? Object.fromEntries(Object.entries(body.sizeStock).map(([size, value]) => [size, Number(value)])) : {};
  const imageUrls = Array.isArray(body.imageUrls)
    ? body.imageUrls.map(String).map((url) => url.trim()).filter(Boolean)
    : [];

  if (!name || !category || !description) {
    return { ok: false, error: "name, category, and description are required" };
  }
  if (!Number.isFinite(price) || price <= 0) {
    return { ok: false, error: "price must be a positive number" };
  }
  if (sizes.length === 0) {
    return { ok: false, error: "at least one size is required" };
  }
  if (sizes.some((size) => !Number.isFinite(sizeStock[size]) || sizeStock[size] < 0)) {
    return { ok: false, error: "every selected size needs a non-negative stock amount" };
  }
  if (imageUrls.length === 0) {
    return { ok: false, error: "at least one image URL is required" };
  }

  return {
    ok: true,
    value: {
      name,
      category,
      price,
      sku: typeof body.sku === "string" ? body.sku.trim() : undefined,
      color: String(body.color || "Natural cream").trim(),
      fit: String(body.fit || "Relaxed fit").trim(),
      material: String(body.material || "Linen blend").trim(),
      description,
      short: String(body.short || description).trim(),
      badge: String(body.badge || "New arrival").trim(),
      sizes,
      sizeStock,
      details: parseLines(body.details),
      care: parseLines(body.care),
      imageUrls,
    },
  };
}

export function parseBestSellerRequest(body: Record<string, unknown>): ValidationResult<{ title: string; productIds: string[] }> {
  const title = String(body.title || "Best Sellers").trim();
  const productIds = Array.isArray(body.productIds)
    ? body.productIds.map(String).map((productId) => productId.trim()).filter(Boolean)
    : [];

  return { ok: true, value: { title, productIds } };
}

function parseLines(value: unknown) {
  if (Array.isArray(value)) return value.map(String).map((entry) => entry.trim()).filter(Boolean);
  return String(value || "")
    .split(/\r?\n/)
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}
