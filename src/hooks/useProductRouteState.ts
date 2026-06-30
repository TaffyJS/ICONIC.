import { useEffect, useMemo, useState } from "react";
import type { Product } from "../data";
import type { Route } from "../types/app";

export function useProductRouteState(route: Route, products: Product[]) {
  const selectedProduct = useMemo(
    () =>
      route.name === "product"
        ? products.find((product) => product.id === route.productId) ?? products[0]
        : products[0],
    [products, route],
  );
  const [selectedSize, setSelectedSize] = useState(selectedProduct?.sizes[Math.min(1, selectedProduct.sizes.length - 1)] ?? "");

  useEffect(() => {
    if (route.name === "product" && selectedProduct) {
      setSelectedSize(selectedProduct.sizes[Math.min(1, selectedProduct.sizes.length - 1)]);
    }
  }, [route.name, selectedProduct]);

  return { selectedProduct, selectedSize, setSelectedSize };
}
