export type CartItem = {
  productId: string;
  size: string;
  colorName: string;
  colorHex: string;
  quantity: number;
};

export type Route =
  | { name: "home" }
  | { name: "product"; productId: string }
  | { name: "checkout" }
  | { name: "admin" }
  | { name: "adminAddItem" }
  | { name: "content"; slug: ContentSlug };

export type DraftCollectionItem = {
  id: string;
  name: string;
  category: string;
  price: number;
  sizeStock: Record<string, number>;
  sku: string;
  color: string;
  fit: string;
  material: string;
  description: string;
  sizes: string[];
  details: string;
  care: string;
  images: string[];
};

export type ContentSlug =
  | "new-arrivals"
  | "gift-cards"
  | "shipping"
  | "returns-exchanges"
  | "size-guide"
  | "contact"
  | "the-fabric"
  | "g-town-studio"
  | "journal"
  | "sustainability";
