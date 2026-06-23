import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";
import {
  adminOrders,
  adminReviews,
  adminStock,
  demoOrders,
  detailLabels,
  dictionaries,
  type AdminOrderRecord,
  type AdminReviewRecord,
  type AdminStockItem,
  type Lang,
  type Order,
  type OrderStatus,
  type Product,
  products,
} from "./data";

type CartItem = {
  productId: string;
  size: string;
  quantity: number;
};

type Route =
  | { name: "home" }
  | { name: "product"; productId: string }
  | { name: "checkout" }
  | { name: "admin" };

const deliveryPrice = 3;

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 2,
  }).format(value);
}

function getRoute(): Route {
  const hash = window.location.hash.replace(/^#/, "");
  if (hash.startsWith("/product/")) {
    return { name: "product", productId: decodeURIComponent(hash.replace("/product/", "")) };
  }
  if (hash === "/checkout") {
    return { name: "checkout" };
  }
  if (hash === "/admin") {
    return { name: "admin" };
  }
  return { name: "home" };
}

function App() {
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
    document.body.classList.toggle("admin-mode", route.name === "admin");
    return () => document.body.classList.remove("admin-mode");
  }, [route.name]);

  useEffect(() => {
    if (route.name === "product") {
      setSelectedSize(selectedProduct.sizes[Math.min(1, selectedProduct.sizes.length - 1)]);
    }
    if (route.name === "home" && window.location.hash === "#collection") {
      window.setTimeout(() => {
        document.getElementById("collection")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 0);
      return;
    }
    if (route.name === "home" && window.location.hash === "#standard") {
      window.setTimeout(() => {
        document.getElementById("standard")?.scrollIntoView({ behavior: "smooth", block: "start" });
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
      </main>
      <Footer t={t} />
    </>
  );
}

function HomePage({
  t,
  lang,
  onOpenProduct,
  onAddToCart,
}: {
  t: Record<string, string>;
  lang: Lang;
  onOpenProduct: (product: Product) => void;
  onAddToCart: (product: Product) => void;
}) {
  return (
    <>
      <Hero t={t} />
      <Metrics t={t} />
      <Intro t={t} />
      <Collection lang={lang} t={t} onOpenProduct={onOpenProduct} onAddToCart={onAddToCart} />
      <Standard t={t} />
    </>
  );
}

function Header({
  lang,
  setLang,
  cartCount,
  cartPulse,
  t,
}: {
  lang: Lang;
  setLang: (lang: Lang) => void;
  cartCount: number;
  cartPulse: boolean;
  t: Record<string, string>;
}) {
  return (
    <header className="site-header">
      <a className="brand" href="#top" aria-label="ICONIC home">
        <img src="/assets/iconic-wordmark-black.png" alt="ICONIC." />
      </a>
      <nav className="nav-links" aria-label="Primary navigation">
        <a href="#collection">{t["nav.collection"]}</a>
        <a href="#standard">{t["nav.standard"]}</a>
        <a href="#/checkout">{t["nav.checkout"]}</a>
        <a href="#/admin">{t["nav.admin"]}</a>
      </nav>
      <div className="header-actions">
        <div className="language-switch" aria-label="Language selector">
          {(["bg", "en"] as Lang[]).map((code) => (
            <button
              className={`lang-button ${lang === code ? "is-active" : ""}`}
              key={code}
              type="button"
              onClick={() => setLang(code)}
              aria-pressed={lang === code}
            >
              {code.toUpperCase()}
            </button>
          ))}
        </div>
        <a className={`cart-pill ${cartPulse ? "is-pulsing" : ""}`} href="#/checkout" aria-label={`${t["nav.cart"]}: ${cartCount}`}>
          <span>{t["nav.cart"]}</span>
          <strong>{cartCount}</strong>
        </a>
      </div>
    </header>
  );
}

function CartToast({ productName, t }: { productName: string; t: Record<string, string> }) {
  return (
    <div className={`cart-toast ${productName ? "is-visible" : ""}`} aria-live="polite">
      <span>{t["product.add"]}</span>
      <strong>{productName}</strong>
    </div>
  );
}

function Hero({ t }: { t: Record<string, string> }) {
  return (
    <section className="hero" id="top">
      <div className="hero-copy">
        <p className="eyebrow">{t["hero.eyebrow"]}</p>
        <h1>{t["hero.title"]}</h1>
        <p className="lead">{t["hero.text"]}</p>
        <div className="hero-actions">
          <a className="button button-dark" href="#collection">
            {t["hero.primary"]}
          </a>
          <a className="button button-light" href="#standard">
            {t["hero.secondary"]}
          </a>
        </div>
      </div>
      <div className="hero-visual">
        <img src="/assets/iconic-editorial.png" alt="ICONIC packaging and fabric moodboard" />
        <div className="hero-card">
          <span>{t["hero.cardLabel"]}</span>
          <strong>{t["hero.cardTitle"]}</strong>
        </div>
      </div>
    </section>
  );
}

function Metrics({ t }: { t: Record<string, string> }) {
  return (
    <section className="metrics" aria-label="Brand principles">
      {[t["metrics.one"], t["metrics.two"], t["metrics.three"], t["metrics.four"]].map((label, index) => (
        <div key={label}>
          <strong>{String(index + 1).padStart(2, "0")}</strong>
          <span>{label}</span>
        </div>
      ))}
    </section>
  );
}

function Intro({ t }: { t: Record<string, string> }) {
  return (
    <section className="section brand-section">
      <div className="section-label">{t["intro.label"]}</div>
      <div className="two-column">
        <h2>{t["intro.title"]}</h2>
        <div className="copy-stack">
          <p>{t["intro.text"]}</p>
          <p>{t["intro.text2"]}</p>
        </div>
      </div>
    </section>
  );
}

function Collection({
  lang,
  t,
  onOpenProduct,
  onAddToCart,
}: {
  lang: Lang;
  t: Record<string, string>;
  onOpenProduct: (product: Product) => void;
  onAddToCart: (product: Product) => void;
}) {
  return (
    <section className="section collection-section" id="collection">
      <div className="section-heading">
        <div>
          <div className="section-label">{t["collection.label"]}</div>
          <h2>{t["collection.title"]}</h2>
        </div>
        <p>{t["collection.text"]}</p>
      </div>
      <div className="collection-grid">
        {products.map((product) => {
          const copy = product.translations[lang];
          return (
            <article className={`collection-card ${product.colorClass}`} key={product.id}>
              <button className="product-visual-button" type="button" onClick={() => onOpenProduct(product)}>
                <div className={`garment ${product.garmentClass}`} aria-hidden="true" />
              </button>
              <div className="card-copy">
                <span>{copy.category}</span>
                <h3>{copy.name}</h3>
                <p>{copy.short}</p>
                <div className="card-actions">
                  <strong>{formatPrice(product.price)}</strong>
                  <button className="text-button" type="button" onClick={() => onOpenProduct(product)}>
                    {t["product.view"]}
                  </button>
                  <button className="button button-dark" type="button" onClick={() => onAddToCart(product)}>
                    {t["product.add"]}
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function ProductPage({
  lang,
  product,
  selectedSize,
  setSelectedSize,
  onAddToCart,
  onOpenProduct,
  t,
}: {
  lang: Lang;
  product: Product;
  selectedSize: string;
  setSelectedSize: (size: string) => void;
  onAddToCart: (product: Product, size: string) => void;
  onOpenProduct: (product: Product) => void;
  t: Record<string, string>;
}) {
  const related = products.filter((entry) => entry.id !== product.id);

  return (
    <>
      <ProductDetail
        lang={lang}
        product={product}
        selectedSize={selectedSize}
        setSelectedSize={setSelectedSize}
        onAddToCart={onAddToCart}
        t={t}
      />
      <RelatedProducts
        lang={lang}
        products={related}
        t={t}
        onOpenProduct={onOpenProduct}
        onAddToCart={(item) => onAddToCart(item, item.sizes[0])}
      />
    </>
  );
}

function ProductDetail({
  lang,
  product,
  selectedSize,
  setSelectedSize,
  onAddToCart,
  t,
}: {
  lang: Lang;
  product: Product;
  selectedSize: string;
  setSelectedSize: (size: string) => void;
  onAddToCart: (product: Product, size: string) => void;
  t: Record<string, string>;
}) {
  const copy = product.translations[lang];
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    setActiveImage(0);
  }, [product.id]);

  function moveImage(direction: -1 | 1) {
    setActiveImage((current) => (current + direction + product.gallery.length) % product.gallery.length);
  }

  return (
    <section className="product-detail" id="product-detail">
      <div className="product-gallery" aria-label={t["product.image"]}>
        <div className="gallery-main">
          <img src={product.gallery[activeImage]} alt={`${copy.name} ${activeImage + 1}`} />
          <button className="gallery-button gallery-prev" type="button" onClick={() => moveImage(-1)} aria-label={t["detail.previousImage"]}>
            ‹
          </button>
          <button className="gallery-button gallery-next" type="button" onClick={() => moveImage(1)} aria-label={t["detail.nextImage"]}>
            ›
          </button>
        </div>
        <div className="gallery-thumbs">
          {product.gallery.map((image, index) => (
            <button
              className={activeImage === index ? "is-active" : ""}
              key={image}
              type="button"
              onClick={() => setActiveImage(index)}
              aria-label={`${t["product.image"]} ${index + 1}`}
            >
              <img src={image} alt="" />
            </button>
          ))}
        </div>
      </div>
      <div className="detail-copy">
        <a className="back-link" href="#collection">
          {t["detail.back"]}
        </a>
        <div className="detail-title-row">
          <div>
            <span className="product-badge">{copy.badge}</span>
            <h2>{copy.name}</h2>
          </div>
          <strong>{formatPrice(product.price)}</strong>
        </div>
        <p className="lead compact">{copy.description}</p>
        <div className="detail-specs">
          <div>
            <span>{t["detail.fit"]}</span>
            <strong>{copy.fit}</strong>
          </div>
          <div>
            <span>{t["detail.material"]}</span>
            <strong>{copy.material}</strong>
          </div>
          <div>
            <span>{t["detail.stock"]}</span>
            <strong>{t["detail.stockValue"].replace("{count}", String(product.stock))}</strong>
          </div>
        </div>
        <div>
          <div className="field-label">{t["detail.size"]}</div>
          <div className="size-grid">
            {product.sizes.map((size) => (
              <button
                className={selectedSize === size ? "is-selected" : ""}
                key={size}
                type="button"
                onClick={() => setSelectedSize(size)}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
        <div className="detail-lists">
          <InfoList title={t["detail.details"]} items={product.details.map((key) => detailLabels[lang][key])} />
          <InfoList title={t["detail.care"]} items={product.care.map((key) => detailLabels[lang][key])} />
        </div>
        <button className="button button-dark detail-add" type="button" onClick={() => onAddToCart(product, selectedSize)}>
          {t["detail.add"]}
        </button>
      </div>
    </section>
  );
}

function RelatedProducts({
  lang,
  products: relatedProducts,
  t,
  onOpenProduct,
  onAddToCart,
}: {
  lang: Lang;
  products: Product[];
  t: Record<string, string>;
  onOpenProduct: (product: Product) => void;
  onAddToCart: (product: Product) => void;
}) {
  return (
    <section className="related-section">
      <div className="section-heading compact-heading">
        <div>
          <div className="section-label">{t["related.label"]}</div>
          <h2>{t["related.title"]}</h2>
        </div>
      </div>
      <div className="related-grid">
        {relatedProducts.map((product) => {
          const copy = product.translations[lang];
          return (
            <article className={`related-card ${product.colorClass}`} key={product.id}>
              <button className="related-visual" type="button" onClick={() => onOpenProduct(product)}>
                <div className={`garment ${product.garmentClass}`} aria-hidden="true" />
              </button>
              <div className="related-copy">
                <span>{copy.category}</span>
                <h3>{copy.name}</h3>
                <p>{copy.short}</p>
                <div className="card-actions">
                  <strong>{formatPrice(product.price)}</strong>
                  <button className="text-button" type="button" onClick={() => onOpenProduct(product)}>
                    {t["product.view"]}
                  </button>
                  <button className="button button-dark" type="button" onClick={() => onAddToCart(product)}>
                    {t["product.add"]}
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function InfoList({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h3>{title}</h3>
      <ul>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

function Standard({ t }: { t: Record<string, string> }) {
  return (
    <section className="standard-section" id="standard">
      <div className="standard-visual">
        <img src="/assets/iconic-logo-tile.png" alt="ICONIC logo" />
      </div>
      <div className="standard-copy">
        <div className="section-label">{t["standard.label"]}</div>
        <h2>{t["standard.title"]}</h2>
        <p>{t["standard.text"]}</p>
        <div className="process-list">
          {[t["standard.point1"], t["standard.point2"], t["standard.point3"]].map((item, index) => (
            <div key={item}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <p>{item}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Checkout({
  lang,
  cartLines,
  subtotal,
  onRemove,
  onSubmit,
  paymentStatus,
  t,
}: {
  lang: Lang;
  cartLines: Array<CartItem & { product: Product }>;
  subtotal: number;
  onRemove: (productId: string, size: string) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  paymentStatus: string;
  t: Record<string, string>;
}) {
  const [delivery, setDelivery] = useState<"address" | "office">("address");
  const [payment, setPayment] = useState<"card" | "cash">("card");
  const [discountInput, setDiscountInput] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState("");
  const [discountError, setDiscountError] = useState("");
  const discountRate = appliedDiscount === "ICONIC10" ? 0.1 : 0;
  const discount = subtotal * discountRate;
  const afterDiscount = subtotal - discount;
  const cardSaving = payment === "card" ? afterDiscount * 0.03 : 0;
  const checkoutDelivery = subtotal > 0 ? (delivery === "address" ? 3 : 2) : 0;
  const checkoutTotal = Math.max(0, afterDiscount - cardSaving + checkoutDelivery);

  function applyDiscountCode() {
    const code = discountInput.trim().toUpperCase();
    if (code === "ICONIC10") {
      setAppliedDiscount(code);
      setDiscountError("");
      return;
    }
    setAppliedDiscount("");
    setDiscountError(t["checkout.discountInvalid"]);
  }

  return (
    <section className="checkout-section" id="checkout">
      <div className="checkout-copy">
        <a className="back-link" href="#collection">
          {t["checkout.back"]}
        </a>
        <div className="section-label">{t["checkout.label"]}</div>
        <h2>{t["checkout.title"]}</h2>
        <p>{t["checkout.text"]}</p>
        <div className="provider-card">
          <span>{t["checkout.provider"]}</span>
          <strong>Stripe Checkout / Payment Element</strong>
        </div>
      </div>
      <div className="checkout-panel">
        <CartSummary lang={lang} cartLines={cartLines} subtotal={subtotal} total={checkoutTotal} onRemove={onRemove} t={t} />
        <form className="payment-form" onSubmit={onSubmit}>
          <CheckoutStep title={t["checkout.deliveryStep"]}>
            <div className="choice-grid">
              <ChoiceCard
                checked={delivery === "address"}
                title={t["checkout.addressDelivery"]}
                text={t["checkout.addressDeliveryText"]}
                onSelect={() => setDelivery("address")}
              />
              <ChoiceCard
                checked={delivery === "office"}
                title={t["checkout.officeDelivery"]}
                text={t["checkout.officeDeliveryText"]}
                onSelect={() => setDelivery("office")}
              />
            </div>
            {delivery === "address" ? (
              <div className="payment-grid">
                <label className="wide-field">
                  <span>{t["checkout.fullName"]}</span>
                  <input placeholder="ICONIC CUSTOMER" required />
                </label>
                <label className="wide-field">
                  <span>{t["checkout.street"]}</span>
                  <input placeholder="ul. Shipka 12" required />
                </label>
                <label>
                  <span>{t["checkout.city"]}</span>
                  <input placeholder="Sofia" required />
                </label>
                <label>
                  <span>{t["checkout.postalCode"]}</span>
                  <input placeholder="1000" required />
                </label>
              </div>
            ) : (
              <div className="payment-grid">
                <label className="wide-field">
                  <span>{t["checkout.fullName"]}</span>
                  <input placeholder="ICONIC CUSTOMER" required />
                </label>
                <label className="wide-field">
                  <span>{t["checkout.courierOffice"]}</span>
                  <select required defaultValue="speedy-center">
                    <option value="speedy-center">Speedy - Sofia Center</option>
                    <option value="econt-mall">Econt - Paradise Center</option>
                    <option value="econt-station">Econt - Central Station</option>
                  </select>
                </label>
              </div>
            )}
          </CheckoutStep>

          <CheckoutStep title={t["checkout.paymentStep"]}>
            <div className="choice-grid">
              <ChoiceCard
                checked={payment === "card"}
                title={t["checkout.cardPayment"]}
                text={t["checkout.cardPaymentText"]}
                onSelect={() => setPayment("card")}
              />
              <ChoiceCard
                checked={payment === "cash"}
                title={t["checkout.cashPayment"]}
                text={t["checkout.cashPaymentText"]}
                onSelect={() => setPayment("cash")}
              />
            </div>
            {payment === "card" && (
              <div className="payment-grid">
                <label className="wide-field">
                  <span>{t["checkout.card"]}</span>
                  <input inputMode="numeric" placeholder="4242 4242 4242 4242" required />
                </label>
                <label>
                  <span>MM/YY</span>
                  <input placeholder="12/30" required />
                </label>
                <label>
                  <span>CVC</span>
                  <input placeholder="123" required />
                </label>
                <label className="wide-field">
                  <span>{t["checkout.name"]}</span>
                  <input placeholder="ICONIC CUSTOMER" required />
                </label>
              </div>
            )}
          </CheckoutStep>

          <CheckoutStep title={t["checkout.discountStep"]}>
            <div className="discount-row">
              <label>
                <span>{t["checkout.discountCode"]}</span>
                <input value={discountInput} onChange={(event) => setDiscountInput(event.target.value)} placeholder="ICONIC10" />
              </label>
              <button className="button button-light" type="button" onClick={applyDiscountCode}>
                {t["checkout.applyCode"]}
              </button>
            </div>
            {(appliedDiscount || discountError) && (
              <p className={`form-note ${appliedDiscount ? "is-success" : "is-error"}`}>
                {appliedDiscount ? `${t["checkout.discountApplied"]}: ${appliedDiscount}` : discountError}
              </p>
            )}
          </CheckoutStep>

          <div className="checkout-total-card">
            <h3>{t["checkout.summary"]}</h3>
            <TotalLine label={t["cart.subtotal"]} value={formatPrice(subtotal)} />
            {discount > 0 && <TotalLine label={`${t["checkout.discount"]} (${Math.round(discountRate * 100)}%)`} value={`-${formatPrice(discount)}`} />}
            {cardSaving > 0 && <TotalLine label={t["checkout.cardSaving"]} value={`-${formatPrice(cardSaving)}`} />}
            <TotalLine label={t["cart.delivery"]} value={formatPrice(checkoutDelivery)} />
            <TotalLine label={t["cart.total"]} value={formatPrice(checkoutTotal)} strong />
          </div>
          <button className="button button-dark" type="submit" disabled={cartLines.length === 0}>
            {t["checkout.pay"]} · {formatPrice(checkoutTotal)}
          </button>
          <p className="form-note">{paymentStatus || t["checkout.note"]}</p>
        </form>
      </div>
    </section>
  );
}

function CheckoutStep({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="checkout-step">
      <div className="field-label">{title}</div>
      {children}
    </div>
  );
}

function ChoiceCard({
  checked,
  title,
  text,
  onSelect,
}: {
  checked: boolean;
  title: string;
  text: string;
  onSelect: () => void;
}) {
  return (
    <label className={`choice-card ${checked ? "is-selected" : ""}`}>
      <input type="radio" checked={checked} onChange={onSelect} />
      <span>
        <strong>{title}</strong>
        <small>{text}</small>
      </span>
    </label>
  );
}

function TotalLine({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={strong ? "total-line is-strong" : "total-line"}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function AdminPanel({
  stats,
  t,
}: {
  stats: ReturnType<typeof getAdminStats>;
  t: Record<string, string>;
}) {
  const [adminTab, setAdminTab] = useState<"overview" | "stock" | "orders" | "delivery" | "reviews">("overview");
  const overviewVisible = adminTab === "overview";
  const lowStockProducts = adminStock.slice().sort((a, b) => a.total - b.total).slice(0, 3);
  const flaggedReviews = adminReviews.filter((review) => review.flagged);
  const completedOrders = adminOrders.filter((order) => order.status === "Delivered");
  const activeOrders = adminOrders.filter((order) => order.status !== "Delivered" && order.status !== "Cancelled");
  const completedRevenueBgn = completedOrders.reduce((sum, order) => sum + Number.parseFloat(order.totalBgn), 0);
  const openRevenueBgn = activeOrders.reduce((sum, order) => sum + Number.parseFloat(order.totalBgn), 0);
  const averageRating =
    adminReviews.length > 0
      ? (adminReviews.reduce((sum, review) => sum + review.rating, 0) / adminReviews.length).toFixed(1)
      : "0.0";
  const totalStock = adminStock.reduce((sum, item) => sum + item.total, 0);
  const deliveryAddressCount = adminOrders.filter((order) => order.deliveryMethod === "Address").length;
  const deliveryOfficeCount = adminOrders.filter((order) => order.deliveryMethod === "Office").length;
  const cardCount = adminOrders.filter((order) => order.payment === "Card").length;
  const codCount = adminOrders.filter((order) => order.payment === "Cash on delivery").length;
  const completedStatusData: Array<{ label: string; value: number; tone: "sand" | "moss" | "clay" }> = [
    { label: "Delivered", value: completedOrders.length, tone: "sand" },
    { label: "Card", value: completedOrders.filter((order) => order.payment === "Card").length, tone: "moss" },
    {
      label: "Cash on delivery",
      value: completedOrders.filter((order) => order.payment === "Cash on delivery").length,
      tone: "clay",
    },
  ];
  const activeStatusData: Array<{ label: string; value: number; tone: "sand" | "moss" | "clay" }> = [
    { label: "Processing", value: adminOrders.filter((order) => order.status === "Processing").length, tone: "sand" },
    { label: "In transit", value: adminOrders.filter((order) => order.status === "In transit").length, tone: "moss" },
    { label: "Cancelled", value: adminOrders.filter((order) => order.status === "Cancelled").length, tone: "clay" },
  ];
  const inTransitOrders = adminOrders.filter((order) => order.status === "In transit");

  return (
    <section className="admin-shell admin-dashboard">
      <div className="admin-topbar">
        <div>
          <div className="section-label">{t["admin.label"]}</div>
          <h2>{t["admin.title"]}</h2>
        </div>
        <div className="admin-pill-row">
          <StatChip label={t["admin.totalOrders"]} value={String(stats.totalOrders)} />
          <StatChip label={t["admin.revenue"]} value={formatPrice(stats.revenue)} />
          <StatChip label={t["admin.items"]} value={String(stats.items)} />
        </div>
      </div>

      <div className="admin-layout">
        {overviewVisible && (
          <aside className="admin-sidebar">
            <div className="sidebar-block sidebar-primary">
              <span>{t["admin.overview"]}</span>
              <strong>{formatPrice(stats.revenue)}</strong>
              <p>{t["admin.text"]}</p>
            </div>
            <SplitMetric
              label={t["admin.channelAddress"]}
              secondLabel={t["admin.channelOffice"]}
              first={stats.channelAddress}
              second={stats.channelOffice}
            />
            <SplitMetric
              label={t["admin.paymentCard"]}
              secondLabel={t["admin.paymentCash"]}
              first={stats.paymentCard}
              second={stats.paymentCash}
            />
          </aside>
        )}

        <div className={`admin-main ${overviewVisible ? "" : "admin-main-wide"}`}>
          <div className="admin-tabs" role="tablist" aria-label={t["admin.label"]}>
            {[
              ["overview", t["admin.tabOverview"]],
              ["stock", t["admin.tabStock"]],
              ["orders", t["admin.tabOrders"]],
              ["delivery", t["admin.tabDelivery"]],
              ["reviews", t["admin.tabReviews"]],
            ].map(([key, label]) => (
              <button
                className={adminTab === key ? "is-active" : ""}
                key={key}
                type="button"
                onClick={() => setAdminTab(key as "overview" | "stock" | "orders" | "delivery" | "reviews")}
              >
                {label}
              </button>
            ))}
          </div>

          {adminTab === "overview" && (
            <>
              <section className="admin-card admin-section-card">
                <div className="card-head">
                  <div>
                    <div className="section-label">{t["admin.priority"]}</div>
                    <h3>{t["admin.overview"]}</h3>
                  </div>
                  <div className="admin-mini-stats">
                    <StatChip label={t["admin.avgRating"]} value={averageRating} />
                    <StatChip label={t["admin.totalStock"]} value={String(totalStock)} />
                  </div>
                </div>
                <div className="attention-grid">
                  <AttentionCard
                    title={t["admin.lowStock"]}
                    text={t["admin.lowStockText"]}
                    items={lowStockProducts.map((product) => `${product.product} · ${product.total}`)}
                  />
                  <AttentionCard
                    title={t["admin.reviewWatch"]}
                    text={t["admin.reviewWatchText"]}
                    items={flaggedReviews.map((review) => `${review.product} · ${review.rating}/5`)}
                  />
                </div>
              </section>

              <section className="admin-card admin-section-card">
                <div className="card-head">
                  <div>
                    <div className="section-label">{t["admin.completed"]}</div>
                    <h3>{`BGN ${completedRevenueBgn.toFixed(2)}`}</h3>
                  </div>
                  <StatChip label="Delivered" value={String(completedOrders.length)} />
                </div>
                <div className="chart-panel-grid">
                  <StatusBarChart title="Completed orders" data={completedStatusData} />
                  <MetricList
                    title="Completed split"
                    items={[
                      { label: "To address", value: String(completedOrders.filter((o) => o.deliveryMethod === "Address").length) },
                      { label: "To office", value: String(completedOrders.filter((o) => o.deliveryMethod === "Office").length) },
                      { label: "Paid by card", value: String(completedOrders.filter((o) => o.payment === "Card").length) },
                      { label: "Cash on delivery", value: String(completedOrders.filter((o) => o.payment === "Cash on delivery").length) },
                    ]}
                  />
                </div>
              </section>

              <section className="admin-card admin-section-card">
                <div className="card-head">
                  <div>
                    <div className="section-label">{t["admin.statusBoard"]}</div>
                    <h3>{`BGN ${openRevenueBgn.toFixed(2)}`}</h3>
                  </div>
                  <StatChip label={t["admin.openOrders"]} value={String(activeOrders.length)} />
                </div>
                <div className="chart-panel-grid">
                  <StatusBarChart title="Open order stages" data={activeStatusData} />
                  <MetricList
                    title="Current queue"
                    items={[
                      { label: "Processing", value: String(activeStatusData[0].value) },
                      { label: "In transit", value: String(activeStatusData[1].value) },
                      { label: "Cancelled", value: String(activeStatusData[2].value) },
                      { label: "Ready to watch", value: String(inTransitOrders.length + activeStatusData[0].value) },
                    ]}
                  />
                </div>
              </section>
            </>
          )}

          {adminTab === "stock" && (
            <section className="admin-card">
              <div className="card-head">
                <div>
                  <div className="section-label">{t["admin.stock"]}</div>
                  <h3>Size balance</h3>
                </div>
                <StatChip label={t["admin.totalStock"]} value={String(totalStock)} />
              </div>
              <DataTable
                className="stock-table"
                columns={["Product", "Category", "XS", "S", "M", "L", "XL", "Total"]}
                rows={adminStock.map((item) => [
                  item.product,
                  item.category,
                  String(item.sizes.XS),
                  String(item.sizes.S),
                  String(item.sizes.M),
                  String(item.sizes.L),
                  String(item.sizes.XL),
                  String(item.total),
                ])}
              />
            </section>
          )}

          {adminTab === "orders" && (
            <section className="admin-card">
              <div className="card-head">
                <div>
                  <div className="section-label">{t["admin.statusBoard"]}</div>
                  <h3>Order ledger</h3>
                </div>
              </div>
              <DataTable
                className="orders-table"
                columns={["Order", "Customer", "Items", "Total", "Payment", "Status", "Date"]}
                rows={adminOrders.map((order) => [
                  order.order,
                  order.customer,
                  order.items,
                  order.totalBgn,
                  order.payment,
                  order.status,
                  order.date,
                ])}
              />
            </section>
          )}

          {adminTab === "delivery" && (
            <section className="admin-card admin-section-card">
              <div className="card-head">
                <div>
                  <div className="section-label">{t["admin.delivery"]}</div>
                  <h3>Fulfilment flow</h3>
                </div>
              </div>
              <div className="delivery-admin-grid">
                <InfoPanel
                  title="By delivery method"
                  rows={[
                    { label: "Door delivery", value: `${deliveryAddressCount} orders` },
                    { label: "Courier office", value: `${deliveryOfficeCount} orders` },
                  ]}
                />
                <InfoPanel
                  title="Payment mix"
                  rows={[
                    { label: "Paid by card", value: String(cardCount) },
                    { label: "Cash on delivery", value: String(codCount) },
                  ]}
                />
                <InfoPanel
                  className="wide-panel"
                  title="In-transit shipments"
                  rows={inTransitOrders.map((order) => ({
                    label: `${order.order} · ${order.customer}`,
                    value: order.deliveryMethod,
                  }))}
                />
              </div>
            </section>
          )}

          {adminTab === "reviews" && (
            <section className="admin-card">
              <div className="card-head">
                <div>
                  <div className="section-label">{t["admin.reviews"]}</div>
                  <h3>Customer notes</h3>
                </div>
                <StatChip label={t["admin.avgRating"]} value={averageRating} />
              </div>
              <div className="review-list">
                {adminReviews.map((review) => (
                  <article className="review-card" key={`${review.customer}-${review.date}`}>
                    <div className="review-head">
                      <div>
                        <strong>{review.customer}</strong>
                        <span>{review.date}</span>
                      </div>
                      <ReviewStars rating={review.rating} />
                    </div>
                    <div className="review-meta">
                      <span>{review.product}</span>
                      {review.flagged ? <strong className="review-flag">FLAGGED</strong> : null}
                    </div>
                    <p>{review.comment}</p>
                  </article>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </section>
  );
}

function AttentionCard({ title, text, items }: { title: string; text: string; items: string[] }) {
  return (
    <div className="attention-card">
      <span>{title}</span>
      <p>{text}</p>
      <div className="attention-list">
        {items.map((item) => (
          <strong key={item}>{item}</strong>
        ))}
      </div>
    </div>
  );
}

function DataTable({
  columns,
  rows,
  className = "",
}: {
  columns: string[];
  rows: string[][];
  className?: string;
}) {
  return (
    <div className={`data-table ${className}`.trim()}>
      <table>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column}>{column}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, cellIndex) => (
                <td key={`${rowIndex}-${cellIndex}`}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SplitMetric({
  label,
  secondLabel,
  first,
  second,
}: {
  label: string;
  secondLabel: string;
  first: number;
  second: number;
}) {
  const total = Math.max(first + second, 1);
  const firstWidth = `${Math.round((first / total) * 100)}%`;
  return (
    <div className="split-metric">
      <div className="split-row">
        <span>{label}</span>
        <strong>{first}</strong>
      </div>
      <div className="split-track">
        <div style={{ width: firstWidth }} />
      </div>
      <div className="split-row">
        <span>{secondLabel}</span>
        <strong>{second}</strong>
      </div>
    </div>
  );
}

function StatusBarChart({
  title,
  data,
}: {
  title: string;
  data: Array<{ label: string; value: number; tone: "sand" | "moss" | "clay" }>;
}) {
  const max = Math.max(...data.map((item) => item.value), 1);
  return (
    <div className="chart-card">
      <div className="panel-title">{title}</div>
      <div className="status-bar-chart">
        {data.map((item) => (
          <div className="status-bar-row" key={item.label}>
            <div className="status-bar-head">
              <span>{item.label}</span>
              <strong>{item.value}</strong>
            </div>
            <div className="status-bar-track">
              <div
                className={`status-bar-fill tone-${item.tone}`}
                style={{ width: `${Math.max(10, Math.round((item.value / max) * 100))}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MetricList({ title, items }: { title: string; items: Array<{ label: string; value: string }> }) {
  return (
    <div className="chart-card">
      <div className="panel-title">{title}</div>
      <div className="metric-list">
        {items.map((item) => (
          <div className="metric-list-row" key={item.label}>
            <span>{item.label}</span>
            <strong>{item.value}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}

function InfoPanel({
  title,
  rows,
  className = "",
}: {
  title: string;
  rows: Array<{ label: string; value: string }>;
  className?: string;
}) {
  return (
    <div className={`chart-card ${className}`.trim()}>
      <div className="panel-title">{title}</div>
      <div className="metric-list">
        {rows.map((row) => (
          <div className="metric-list-row" key={`${row.label}-${row.value}`}>
            <span>{row.label}</span>
            <strong>{row.value}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}

function ReviewStars({ rating }: { rating: number }) {
  return <div className="review-stars">{Array.from({ length: 5 }, (_, i) => (i < rating ? "★" : "☆")).join("")}</div>;
}

function StatChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="stat-chip">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function getAdminStats(orders: Order[]) {
  const byStatus = orders.reduce(
    (acc, order) => {
      acc[order.status] += 1;
      return acc;
    },
    {
      pending: 0,
      received: 0,
      traveling: 0,
      ready: 0,
      completed: 0,
    } as Record<OrderStatus, number>,
  );

  return orders.reduce(
    (acc, order) => {
      acc.totalOrders += 1;
      acc.revenue += order.total;
      acc.items += order.items.reduce((sum, item) => sum + item.quantity, 0);
      if (order.channel === "address") acc.channelAddress += 1;
      if (order.channel === "office") acc.channelOffice += 1;
      if (order.payment === "card") acc.paymentCard += 1;
      if (order.payment === "cash") acc.paymentCash += 1;
      acc.byStatus = byStatus;
      return acc;
    },
    {
      totalOrders: 0,
      revenue: 0,
      items: 0,
      channelAddress: 0,
      channelOffice: 0,
      paymentCard: 0,
      paymentCash: 0,
      byStatus,
    },
  );
}

function CartSummary({
  lang,
  cartLines,
  subtotal,
  total,
  onRemove,
  t,
}: {
  lang: Lang;
  cartLines: Array<CartItem & { product: Product }>;
  subtotal: number;
  total: number;
  onRemove: (productId: string, size: string) => void;
  t: Record<string, string>;
}) {
  return (
    <aside className="cart-summary">
      <h3>{t["cart.title"]}</h3>
      {cartLines.length === 0 ? (
        <p className="empty-cart">{t["cart.empty"]}</p>
      ) : (
        <div className="cart-lines">
          {cartLines.map((line) => (
            <div className="cart-line" key={`${line.productId}-${line.size}`}>
              <div>
                <img className="cart-thumb" src={line.product.gallery[0]} alt={line.product.translations[lang].name} />
              </div>
              <div>
                <strong>{line.product.translations[lang].name}</strong>
                <span>
                  {t["cart.size"]}: {line.size} · x{line.quantity}
                </span>
              </div>
              <div>
                <strong>{formatPrice(line.product.price * line.quantity)}</strong>
                <button type="button" onClick={() => onRemove(line.productId, line.size)}>
                  {t["cart.remove"]}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="totals">
        <div>
          <span>{t["cart.subtotal"]}</span>
          <strong>{formatPrice(subtotal)}</strong>
        </div>
        <div>
          <span>{t["cart.delivery"]}</span>
          <strong>{subtotal > 0 ? formatPrice(deliveryPrice) : formatPrice(0)}</strong>
        </div>
        <div className="grand-total">
          <span>{t["cart.total"]}</span>
          <strong>{formatPrice(total)}</strong>
        </div>
      </div>
    </aside>
  );
}

function Footer({ t }: { t: Record<string, string> }) {
  const footerGroups = [
    {
      title: t["footer.shop"],
      links: [t["footer.shop1"], t["footer.shop2"], t["footer.shop3"], t["footer.shop4"]],
    },
    {
      title: t["footer.help"],
      links: [t["footer.help1"], t["footer.help2"], t["footer.help3"], t["footer.help4"]],
    },
    {
      title: t["footer.about"],
      links: [t["footer.about1"], t["footer.about2"], t["footer.about3"], t["footer.about4"]],
    },
  ];

  return (
    <footer className="site-footer">
      <div className="footer-brand">
        <img src="/assets/iconic-wordmark-white.png" alt="ICONIC." />
        <strong>{t["footer.kicker"]}</strong>
        <p>{t["footer.text"]}</p>
      </div>
      <div className="footer-links">
        {footerGroups.map((group) => (
          <div className="footer-column" key={group.title}>
            <h3>{group.title}</h3>
            {group.links.map((link) => (
              <a href="#top" key={link}>
                {link}
              </a>
            ))}
          </div>
        ))}
      </div>
      <div className="footer-bottom">
        <span>{t["footer.rights"]}</span>
        <span>{t["footer.made"]}</span>
      </div>
    </footer>
  );
}

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
