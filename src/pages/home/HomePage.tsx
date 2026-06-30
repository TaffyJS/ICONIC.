import type { Lang, Product } from "../../data";
import type { BestSellerSection } from "../../services/commerceApi";
import { formatPrice } from "../../utils/format";

export default function HomePage({
  t,
  lang,
  onOpenProduct,
  onAddToCart,
  products,
  bestSellers,
}: {
  t: Record<string, string>;
  lang: Lang;
  products: Product[];
  bestSellers: BestSellerSection;
  onOpenProduct: (product: Product) => void;
  onAddToCart: (product: Product) => void;
}) {
  return (
    <>
      <Hero t={t} />
      <Metrics t={t} />
      <Intro t={t} />
      <ShopHighlights lang={lang} t={t} products={products} bestSellers={bestSellers} onOpenProduct={onOpenProduct} onAddToCart={onAddToCart} />
      <Collection lang={lang} t={t} products={products} onOpenProduct={onOpenProduct} onAddToCart={onAddToCart} />
      <Standard t={t} />
    </>
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
  products,
}: {
  lang: Lang;
  t: Record<string, string>;
  products: Product[];
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
      {products.length === 0 ? (
        <div className="empty-product-band">{t["collection.empty"]}</div>
      ) : (
        <div className="collection-grid">
        {products.map((product) => {
          const copy = product.translations[lang];
          return (
            <article className={`collection-card ${product.colorClass}`} key={product.id}>
              <button className="product-visual-button" type="button" onClick={() => onOpenProduct(product)}>
                {product.gallery[0] ? (
                  <img src={product.gallery[0]} alt={copy.name} />
                ) : (
                  <div className={`garment ${product.garmentClass}`} aria-hidden="true" />
                )}
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
      )}
    </section>
  );
}

function ShopHighlights({
  lang,
  t,
  onOpenProduct,
  onAddToCart,
  products,
  bestSellers,
}: {
  lang: Lang;
  t: Record<string, string>;
  products: Product[];
  bestSellers: BestSellerSection;
  onOpenProduct: (product: Product) => void;
  onAddToCart: (product: Product) => void;
}) {
  if (products.length === 0) return null;

  const summerItems = products;
  const showBestSellers = bestSellers.products.length >= 2;

  return (
    <section className="shop-highlights">
      <ProductShowcase
        id="summer-collection"
        label={t["home.summer.label"]}
        title={t["home.summer.title"]}
        text={t["home.summer.text"]}
        products={summerItems}
        lang={lang}
        t={t}
        onOpenProduct={onOpenProduct}
        onAddToCart={onAddToCart}
      />
      {showBestSellers ? (
        <ProductShowcase
          id="best-sellers"
          label={t["home.best.label"]}
          title={bestSellers.title}
          text={t["home.best.text"]}
          products={bestSellers.products}
          lang={lang}
          t={t}
          featured
          onOpenProduct={onOpenProduct}
          onAddToCart={onAddToCart}
        />
      ) : null}
    </section>
  );
}

function ProductShowcase({
  id,
  label,
  title,
  text,
  products: showcaseProducts,
  lang,
  t,
  featured = false,
  onOpenProduct,
  onAddToCart,
}: {
  id: string;
  label: string;
  title: string;
  text: string;
  products: Product[];
  lang: Lang;
  t: Record<string, string>;
  featured?: boolean;
  onOpenProduct: (product: Product) => void;
  onAddToCart: (product: Product) => void;
}) {
  return (
    <div className={`showcase-band ${featured ? "showcase-band-featured" : ""}`} id={id}>
      <div className="showcase-heading">
        <div>
          <div className="section-label">{label}</div>
          <h2>{title}</h2>
        </div>
        <p>{text}</p>
      </div>
      <div className={featured ? "showcase-grid featured-grid" : "showcase-grid"}>
        {showcaseProducts.map((product) => {
          const copy = product.translations[lang];
          return (
            <article className="showcase-card" key={`${id}-${product.id}`}>
              <button type="button" onClick={() => onOpenProduct(product)}>
                <img src={product.gallery[0]} alt={copy.name} />
              </button>
              <div>
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
