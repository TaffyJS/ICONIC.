import type { Product } from "../data";
import type { CartItem } from "../types/app";

export type CartLine = CartItem & { product: Product };

export function addCartItem(cart: CartItem[], product: Product, size: string, color = product.colors[0]): CartItem[] {
  const selectedColor = color ?? product.colors[0] ?? { name: "Default", hex: "#f2ede4" };
  const existing = cart.find((item) => item.productId === product.id && item.size === size && item.colorName === selectedColor.name);
  if (existing) {
    return cart.map((item) =>
      item.productId === product.id && item.size === size && item.colorName === selectedColor.name
        ? { ...item, quantity: item.quantity + 1 }
        : item,
    );
  }
  return [...cart, { productId: product.id, size, colorName: selectedColor.name, colorHex: selectedColor.hex, quantity: 1 }];
}

export function removeCartItem(cart: CartItem[], productId: string, size: string, colorName: string): CartItem[] {
  return cart.filter((item) => item.productId !== productId || item.size !== size || item.colorName !== colorName);
}

export function getCartLines(cart: CartItem[], products: Product[]): CartLine[] {
  return cart
    .map((item) => {
      const product = products.find((entry) => entry.id === item.productId);
      return product ? { ...item, product } : null;
    })
    .filter((line): line is CartLine => Boolean(line));
}
