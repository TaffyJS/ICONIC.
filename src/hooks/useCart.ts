import { useMemo, useState } from "react";
import type { Product } from "../data";
import type { CartItem } from "../types/app";
import { cartIdStorageKey } from "../config/storage";
import { addApiCartItem, removeApiCartItem } from "../services/commerceApi";
import { addCartItem, getCartLines, removeCartItem } from "../state/cartState";

export function useCart(products: Product[]) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartId, setCartId] = useState(() => localStorage.getItem(cartIdStorageKey) || "");
  const cartLines = useMemo(() => getCartLines(cart, products), [cart, products]);
  const subtotal = cartLines.reduce((sum, line) => sum + line.product.price * line.quantity, 0);

  function addToCart(product: Product, size = product.sizes[0]) {
    setCart((current) => addCartItem(current, product, size));
    void addApiCartItem({ cartId: cartId || undefined, productId: product.id, size, quantity: 1 })
      .then(({ cart: apiCart }) => {
        setCartId(apiCart.id);
        localStorage.setItem(cartIdStorageKey, apiCart.id);
      })
      .catch(() => undefined);
  }

  function removeFromCart(productId: string, size: string) {
    setCart((current) => removeCartItem(current, productId, size));
    if (cartId) {
      void removeApiCartItem({ cartId, productId, size }).catch(() => undefined);
    }
  }

  return {
    cartId,
    cart,
    cartLines,
    subtotal,
    addToCart,
    removeFromCart,
  };
}
