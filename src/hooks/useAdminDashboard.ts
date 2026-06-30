import { useEffect, useState } from "react";
import type { AdminOrderRecord, AdminReviewRecord, AdminStockItem, Product } from "../data";
import { type BestSellerSection, fetchAdminDashboard } from "../services/commerceApi";

const emptyBestSellers: BestSellerSection = { title: "Best Sellers", productIds: [], products: [] };

export function useAdminDashboard() {
  const [stock, setStock] = useState<AdminStockItem[]>([]);
  const [orders, setOrders] = useState<AdminOrderRecord[]>([]);
  const [reviews, setReviews] = useState<AdminReviewRecord[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [bestSellers, setBestSellers] = useState<BestSellerSection>(emptyBestSellers);

  async function loadDashboard(shouldIgnore = () => false) {
    try {
      const dashboard = await fetchAdminDashboard();
      if (shouldIgnore()) return;
      setStock(dashboard.stock);
      setOrders(dashboard.orders);
      setReviews(dashboard.reviews);
      setProducts(dashboard.products);
      setBestSellers(dashboard.bestSellers);
    } catch {
      // Keep the admin dashboard empty when the local API is unavailable.
    }
  }

  useEffect(() => {
    let ignore = false;

    void loadDashboard(() => ignore);

    return () => {
      ignore = true;
    };
  }, []);

  return { stock, orders, reviews, products, bestSellers, reloadDashboard: () => loadDashboard() };
}
