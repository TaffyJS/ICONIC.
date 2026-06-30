import { useEffect, useState } from "react";
import type { Order, Product, Review } from "../data";
import { type BestSellerSection, fetchCatalog } from "../services/commerceApi";

const emptyBestSellers: BestSellerSection = { title: "Best Sellers", productIds: [], products: [] };

export function useCatalogData() {
  const [products, setProducts] = useState<Product[]>([]);
  const [bestSellers, setBestSellers] = useState<BestSellerSection>(emptyBestSellers);
  const [orders, setOrders] = useState<Order[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadCatalog(shouldIgnore = () => false) {
    try {
      const catalog = await fetchCatalog();
      if (shouldIgnore()) return;
      setProducts(catalog.products);
      setBestSellers(catalog.bestSellers);
      setOrders(catalog.orders);
      setReviews(catalog.reviews);
      setError("");
    } catch {
      if (!shouldIgnore()) setError("catalog-unavailable");
    } finally {
      if (!shouldIgnore()) setLoading(false);
    }
  }

  useEffect(() => {
    let ignore = false;

    void loadCatalog(() => ignore);

    return () => {
      ignore = true;
    };
  }, []);

  return { products, bestSellers, orders, reviews, loading, error, reloadCatalog: () => loadCatalog() };
}
