import { useMemo, useState } from "react";
import { dictionaries, type Product, type ProductColor } from "./data";
import { CartToast } from "./components/feedback/CartToast";
import { Footer } from "./components/layout/Footer";
import { Header } from "./components/layout/Header";
import { useAdminMode } from "./hooks/useAdminMode";
import { useAdminDashboard } from "./hooks/useAdminDashboard";
import { useCart } from "./hooks/useCart";
import { useCatalogData } from "./hooks/useCatalogData";
import { useHashRoute } from "./hooks/useHashRoute";
import { useLanguage } from "./hooks/useLanguage";
import { useProductRouteState } from "./hooks/useProductRouteState";
import { useScrollRestoration } from "./hooks/useScrollRestoration";
import AddCollectionItemPage from "./pages/admin/AddCollectionItemPage";
import AdminPanel from "./pages/admin/AdminPanel";
import { getAdminStats } from "./pages/admin/adminUtils";
import Checkout from "./pages/checkout/Checkout";
import ContentPage from "./pages/content/ContentPage";
import HomePage from "./pages/home/HomePage";
import ProductPage from "./pages/product/ProductPage";
import { createApiOrder, updateBestSellers } from "./services/commerceApi";

export default function App() {
  const { products, bestSellers, orders, reloadCatalog } = useCatalogData();
  const adminDashboard = useAdminDashboard();
  const { lang, changeLanguage } = useLanguage();
  const route = useHashRoute();
  const { selectedProduct, selectedSize, setSelectedSize } = useProductRouteState(route, products);
  const { cartId, cart, cartLines, subtotal, addToCart: addItemToCart, removeFromCart } = useCart(products);
  const [paymentStatus, setPaymentStatus] = useState("");
  const [cartPulse, setCartPulse] = useState(false);
  const [cartNotice, setCartNotice] = useState("");
  const t = dictionaries[lang];
  const adminStats = useMemo(() => getAdminStats(orders), [orders]);

  useAdminMode(route.name);
  useScrollRestoration(route);

  function openProduct(product: Product) {
    window.location.hash = `/product/${product.id}`;
  }

  function addToCart(product: Product, size = product.sizes[0], color: ProductColor = product.colors[0]) {
    setPaymentStatus("");
    setCartPulse(true);
    setCartNotice(product.translations[lang].name);
    window.setTimeout(() => setCartPulse(false), 650);
    window.setTimeout(() => setCartNotice(""), 1800);
    addItemToCart(product, size, color);
  }

  function submitPayment(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const customer = String(formData.get("fullName") || formData.get("cardholder") || "Demo Customer");
    const city = String(formData.get("city") || "Sofia");

    void createApiOrder({
      cartId: cartId || undefined,
      customer,
      city,
      channel: "address",
      payment: "card",
      total: subtotal,
      items: cart,
    }).catch(() => undefined);

    setPaymentStatus(t["checkout.success"]);
  }

  async function saveBestSellers(input: { title: string; productIds: string[] }) {
    await updateBestSellers(input);
    await Promise.all([reloadCatalog(), adminDashboard.reloadDashboard()]);
  }

  return (
    <>
      <Header lang={lang} setLang={changeLanguage} cartCount={cart.length} cartPulse={cartPulse} products={products} route={route} t={t} />
      <CartToast productName={cartNotice} t={t} />
      <main>
        {route.name === "home" && (
          <HomePage t={t} lang={lang} products={products} bestSellers={bestSellers} onOpenProduct={openProduct} onAddToCart={addToCart} />
        )}
        {route.name === "product" && selectedProduct && (
          <ProductPage
            lang={lang}
            product={selectedProduct}
            products={products}
            selectedSize={selectedSize}
            setSelectedSize={setSelectedSize}
            onAddToCart={addToCart}
            onOpenProduct={openProduct}
            t={t}
          />
        )}
        {route.name === "checkout" && (
          <Checkout
            lang={lang}
            cartLines={cartLines}
            subtotal={subtotal}
            onRemove={removeFromCart}
            onSubmit={submitPayment}
            paymentStatus={paymentStatus}
            t={t}
          />
        )}
        {route.name === "admin" && (
          <AdminPanel
            stats={adminStats}
            stock={adminDashboard.stock}
            orders={adminDashboard.orders}
            reviews={adminDashboard.reviews}
            products={adminDashboard.products}
            bestSellers={adminDashboard.bestSellers}
            onSaveBestSellers={saveBestSellers}
            t={t}
          />
        )}
        {route.name === "adminAddItem" && (
          <AddCollectionItemPage
            t={t}
            onSaved={async () => {
              await Promise.all([reloadCatalog(), adminDashboard.reloadDashboard()]);
            }}
          />
        )}
        {route.name === "content" && <ContentPage slug={route.slug} lang={lang} t={t} />}
      </main>
      <Footer t={t} />
    </>
  );
}
