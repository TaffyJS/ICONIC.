import type { DeliveryMethod } from "./courier.js";

export type Lang = "bg" | "en";

export type ProductTranslation = {
  name: string;
  category: string;
  short: string;
  description: string;
  fit: string;
  material: string;
  badge: string;
};

export type ProductImage = {
  id: string;
  productId: string;
  storageProvider: string;
  storageKey: string;
  url: string;
  alt: string;
  mimeType?: string;
  width?: number;
  height?: number;
  sortOrder: number;
  metadata: Record<string, unknown>;
};

export type ProductVariant = {
  id: string;
  productId: string;
  size: string;
  sku: string;
  priceDelta: number;
  quantity: number;
  reservedQuantity: number;
};

export type ProductRecord = {
  id: string;
  sortOrder?: number;
  colorClass: string;
  garmentClass: string;
  price: number;
  gallery: string[];
  images: ProductImage[];
  sizes: string[];
  sizeStock: Record<string, number>;
  stock: number;
  details: string[];
  care: string[];
  translations: Record<Lang, ProductTranslation>;
};

export type BestSellerSection = {
  title: string;
  productIds: string[];
  products: ProductRecord[];
};

export type CreateProductInput = {
  id?: string;
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
};

export type ReviewRecord = {
  id: string;
  productId: string;
  customer: string;
  rating: number;
  comment: string;
  createdAt: string;
};

export type OrderChannel = DeliveryMethod;
export type PaymentMethod = "card" | "cash";
export type OrderStatus = "pending" | "received" | "traveling" | "ready" | "completed";

export type OrderRecord = {
  id: string;
  customer: string;
  city: string;
  createdAt: string;
  channel: OrderChannel;
  payment: PaymentMethod;
  status: OrderStatus;
  total: number;
  items: Array<{
    productId: string;
    quantity: number;
  }>;
};

export type CartRecord = {
  id: string;
  status: "active" | "ordered" | "abandoned";
  currency: "EUR";
  items: CartItemRecord[];
};

export type CartItemRecord = {
  id: string;
  cartId: string;
  productId: string;
  variantId: string;
  size: string;
  quantity: number;
  unitPrice: number;
};

export type AdminStockItemRecord = {
  product: string;
  category: string;
  sizes: {
    XS: number;
    S: number;
    M: number;
    L: number;
    XL: number;
  };
  total: number;
};

export type AdminOrderRecord = {
  order: string;
  customer: string;
  items: string;
  totalBgn: string;
  payment: "Card" | "Cash on delivery";
  status: "Delivered" | "In transit" | "Processing" | "Cancelled";
  date: string;
  deliveryMethod: "Address" | "Office";
};

export type AdminReviewRecord = {
  customer: string;
  date: string;
  product: string;
  comment: string;
  rating: number;
  flagged?: boolean;
};
