import { useEffect, useMemo, useState } from "react";
import { demoOrders, dictionaries, type Lang, type Product, products } from "./data";
import { CartToast } from "./components/feedback/CartToast";
import { Footer } from "./components/layout/Footer";
import { Header } from "./components/layout/Header";
import AddCollectionItemPage from "./pages/admin/AddCollectionItemPage";
import AdminPanel from "./pages/admin/AdminPanel";
import { getAdminStats } from "./pages/admin/adminUtils";
import Checkout from "./pages/checkout/Checkout";
import ContentPage from "./pages/content/ContentPage";
import HomePage from "./pages/home/HomePage";
import ProductPage from "./pages/product/ProductPage";
import type { CartItem, Route } from "./types/app";
import { deliveryPrice } from "./utils/format";
import { getRoute } from "./utils/routing";

export default function App() {
  const [lang, setLang] = useState<Lang>(() => {
    const stored = localStorage.getItem("iconic-language");
    return stored === "en" ? "en" : "bg";
  });
  const [selectedSize, setSelectedSize] = useState(products[0].sizes[1]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentStatus, setPaymentStatus] = useState("");
  const [route, setRoute] = useState<Route>(() => getRoute());
  const [cartPulse, setCartPulse] = useState(false);
  const [cartNotice, setCartNotice] = useState("");
  const t = dictionaries[lang];

  const selectedProduct =
    route.name === "product"
      ? products.find((product) => product.id === route.productId) ?? products[0]
      : products[0];

  useEffect(() => {
    const updateRoute = () => setRoute(getRoute());
    window.addEventListener("hashchange", updateRoute);
    return () => window.removeEventListener("hashchange", updateRoute);
  }, []);

  useEffect(() => {
    document.body.classList.toggle("admin-mode", route.name === "admin" || route.name === "adminAddItem");
    return () => document.body.classList.remove("admin-mode");
  }, [route.name]);

  useEffect(() => {
    if (route.name === "product") {
      setSelectedSize(selectedProduct.sizes[Math.min(1, selectedProduct.sizes.length - 1)]);
    }
    if (route.name === "home" && window.location.hash && !window.location.hash.startsWith("#/")) {
      const targetId = window.location.hash.replace(/^#/, "") || "top";
      window.setTimeout(() => {
        document.getElementById(targetId)?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 0);
      return;
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [route, selectedProduct]);

  const cartLines = useMemo(
    () =>
      cart
        .map((item) => {
          const product = products.find((entry) => entry.id === item.productId);
          return product ? { ...item, product } : null;
        })
        .filter((line): line is CartItem & { product: Product } => Boolean(line)),
    [cart],
  );

  const subtotal = cartLines.reduce((sum, line) => sum + line.product.price * line.quantity, 0);
  const total = subtotal > 0 ? subtotal + deliveryPrice : 0;
  const adminStats = useMemo(() => getAdminStats(demoOrders), []);

  function changeLanguage(nextLang: Lang) {
    setLang(nextLang);
    localStorage.setItem("iconic-language", nextLang);
    document.documentElement.lang = nextLang;
  }

  function openProduct(product: Product) {
    window.location.hash = `/product/${product.id}`;
  }

  function addToCart(product: Product, size = product.sizes[0]) {
    setPaymentStatus("");
    setCartPulse(true);
    setCartNotice(product.translations[lang].name);
    window.setTimeout(() => setCartPulse(false), 650);
    window.setTimeout(() => setCartNotice(""), 1800);
    setCart((current) => {
      const existing = current.find((item) => item.productId === product.id && item.size === size);
      if (existing) {
        return current.map((item) =>
          item.productId === product.id && item.size === size
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }
      return [...current, { productId: product.id, size, quantity: 1 }];
    });
  }

  function removeFromCart(productId: string, size: string) {
    setCart((current) => current.filter((item) => item.productId !== productId || item.size !== size));
  }

  function submitPayment(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPaymentStatus(t["checkout.success"]);
  }

  return (
    <>
      <Header lang={lang} setLang={changeLanguage} cartCount={cart.length} cartPulse={cartPulse} t={t} />
      <CartToast productName={cartNotice} t={t} />
      <main>
        {route.name === "home" && (
          <HomePage t={t} lang={lang} onOpenProduct={openProduct} onAddToCart={addToCart} />
        )}
        {route.name === "product" && (
          <ProductPage
            lang={lang}
            product={selectedProduct}
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
        {route.name === "admin" && <AdminPanel stats={adminStats} t={t} />}
        {route.name === "adminAddItem" && <AddCollectionItemPage t={t} />}
        {route.name === "content" && <ContentPage slug={route.slug} lang={lang} t={t} />}
      </main>
      <Footer t={t} />
    </>
  );
}
