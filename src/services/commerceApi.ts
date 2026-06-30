import type { AdminOrderRecord, AdminReviewRecord, AdminStockItem, Order, Product, Review } from "../data";
import type { CartItem } from "../types/app";
import { postJson } from "./http";

export type BestSellerSection = {
  title: string;
  productIds: string[];
  products: Product[];
};

export type CatalogResponse = {
  products: Product[];
  bestSellers: BestSellerSection;
  reviews: Review[];
  orders: Order[];
};

export type AdminDashboardResponse = {
  stock: AdminStockItem[];
  orders: AdminOrderRecord[];
  reviews: AdminReviewRecord[];
  products: Product[];
  bestSellers: BestSellerSection;
};

export type ApiCart = {
  id: string;
  status: "active" | "ordered" | "abandoned";
  currency: "EUR";
  items: Array<{
    productId: string;
    size: string;
    quantity: number;
  }>;
};

async function getJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Request failed with status ${response.status}`);
  }
  return (await response.json()) as T;
}

export function fetchCatalog() {
  return getJson<CatalogResponse>("/api/catalog");
}

export function fetchAdminDashboard() {
  return getJson<AdminDashboardResponse>("/api/admin/dashboard");
}

export function createProduct(input: {
  name: string;
  category: string;
  price: number;
  sku?: string;
  color: string;
  fit: string;
  material: string;
  description: string;
  short: string;
  badge: string;
  sizes: string[];
  sizeStock: Record<string, number>;
  details: string[];
  care: string[];
  imageUrls: string[];
}) {
  return postJson<{ product: Product }>("/api/products", input);
}

export function updateBestSellers(input: { title: string; productIds: string[] }) {
  return postJson<{ bestSellers: BestSellerSection }>("/api/admin/best-sellers", input);
}

export function addApiCartItem(input: { cartId?: string; productId: string; size: string; quantity: number }) {
  return postJson<{ cart: ApiCart }>("/api/carts/items", input);
}

export function removeApiCartItem(input: { cartId: string; productId: string; size: string }) {
  return postJson<{ cart: ApiCart }>("/api/carts/items/remove", { ...input, quantity: 1 });
}

export function createApiOrder(input: {
  cartId?: string;
  customer: string;
  city: string;
  channel: "address" | "office";
  payment: "card" | "cash";
  total: number;
  items: CartItem[];
}) {
  return postJson<{ order: Order }>("/api/orders", input);
}
