import { useEffect, useState } from "react";
import type { Lang, Product, ProductColor } from "../../data";
import type { BestSellerSection } from "../../services/commerceApi";
import { formatPrice } from "../../utils/format";

const heroSlides = [
  {
    image: "https://images.unsplash.com/photo-1776633734216-26b0dbcf61d1?w=1600&h=960&fit=crop&auto=format",
    align: "center",
    headlineKey: "premium.hero1.title",
    subKey: "premium.hero1.sub",
  },
  {
    image: "https://images.unsplash.com/photo-1578747522731-9e5a179b02f7?w=1600&h=960&fit=crop&auto=format",
    align: "center",
    headlineKey: "premium.hero2.title",
    subKey: "premium.hero2.sub",
  },
  {
    image: "https://images.unsplash.com/photo-1776633734208-3cdf89a7fbf0?w=1600&h=960&fit=crop&auto=format",
    align: "center",
    headlineKey: "premium.hero3.title",
    subKey: "premium.hero3.sub",
  },
];

const categories = [
  { nameKey: "premium.category.shirts", image: "https://images.unsplash.com/photo-1713881842156-3d9ef36418cc?w=560&h=720&fit=crop&auto=format" },
  { nameKey: "premium.category.sets", image: "https://images.unsplash.com/photo-1578747522731-9e5a179b02f7?w=560&h=720&fit=crop&auto=format" },
  { nameKey: "premium.category.shorts", image: "https://images.unsplash.com/photo-1630540665897-4d2bde82b0a6?w=560&h=720&fit=crop&auto=format" },
  { nameKey: "premium.category.dresses", image: "https://images.unsplash.com/photo-1776633734208-3cdf89a7fbf0?w=560&h=720&fit=crop&auto=format" },
];

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
  onAddToCart: (product: Product, size?: string, color?: ProductColor) => void;
}) {
  return (
    <>
      <Hero t={t} />
      <SeasonBanner t={t} />
      <CategoryGrid t={t} />
      <FeaturedCarousel lang={lang} t={t} products={products} onOpenProduct={onOpenProduct} onAddToCart={onAddToCart} />
      <EditorialStory t={t} />
      <BestSellerGrid lang={lang} t={t} products={bestSellers.products.length >= 2 ? bestSellers.products : products.slice(0, 3)} title={bestSellers.products.length >= 2 ? bestSellers.title : t["premium.best.title"]} onOpenProduct={onOpenProduct} onAddToCart={onAddToCart} />
      <Commitments t={t} />
      <Collection lang={lang} t={t} products={products} onOpenProduct={onOpenProduct} onAddToCart={onAddToCart} />
      <Standard t={t} />
    </>
  );
}

function Hero({ t }: { t: Record<string, string> }) {
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % heroSlides.length);
    }, 5200);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <section className="hero" id="top">
      <div className="hero-slides" aria-hidden="true">
        {heroSlides.map((slide, index) => (
          <img
            className={index === activeSlide ? "is-active" : ""}
            key={slide.image}
            src={slide.image}
            alt=""
            style={{ objectPosition: slide.align }}
          />
        ))}
      </div>
      <div className="hero-copy">
        <p className="eyebrow">{t["premium.season.full"]}</p>
        <h1>{t[heroSlides[activeSlide].headlineKey]}</h1>
        <p className="lead">{t[heroSlides[activeSlide].subKey]}</p>
        <div className="hero-actions">
          <a className="button button-dark" href="#collection">
            {t["premium.hero.shop"]}
          </a>
          <a className="button button-light" href="#standard">
            {t["premium.hero.story"]}
          </a>
        </div>
        <div className="hero-dots" aria-label="Hero slideshow">
          {heroSlides.map((slide, index) => (
            <button
              className={index === activeSlide ? "is-active" : ""}
              key={slide.image}
              type="button"
              onClick={() => setActiveSlide(index)}
              aria-label={`${t["product.image"]} ${index + 1}`}
            />
          ))}
        </div>
      </div>
      <div className="hero-card">
        <span>{t["hero.cardLabel"]}</span>
        <strong>{t["hero.cardTitle"]}</strong>
      </div>
    </section>
  );
}

function SeasonBanner({ t }: { t: Record<string, string> }) {
  return (
    <div className="season-banner">
      <p>{t["premium.season.banner"]}</p>
    </div>
  );
}

function CategoryGrid({ t }: { t: Record<string, string> }) {
  return (
    <section className="premium-section category-section">
      <div className="premium-heading">
        <div>
          <p>{t["premium.category.label"]}</p>
          <h2>{t["premium.category.title"]}</h2>
        </div>
        <a href="#collection">{t["premium.viewAll"]} <span>→</span></a>
      </div>
      <div className="category-grid">
        {categories.map((category) => (
          <a className="category-card" href="#collection" key={category.nameKey}>
            <img src={category.image} alt={t[category.nameKey]} />
            <span>{t[category.nameKey]}</span>
            <small>{t["premium.shop"]} →</small>
          </a>
        ))}
      </div>
    </section>
  );
}

function FeaturedCarousel({
  lang,
  t,
  products,
  onOpenProduct,
  onAddToCart,
}: {
  lang: Lang;
  t: Record<string, string>;
  products: Product[];
  onOpenProduct: (product: Product) => void;
  onAddToCart: (product: Product, size?: string, color?: ProductColor) => void;
}) {
  const [startIndex, setStartIndex] = useState(0);
  const visibleCount = 4;
  const visibleProducts = products.slice(startIndex, startIndex + visibleCount);
  const canGoBack = startIndex > 0;
  const canGoForward = startIndex + visibleCount < products.length;

  if (products.length === 0) return null;

  return (
    <section className="premium-section featured-carousel" id="summer-collection">
      <div className="premium-heading">
        <div>
          <p>{t["premium.featured.label"]}</p>
          <h2>{t["premium.featured.title"]}</h2>
        </div>
        <div className="carousel-controls">
          <button type="button" disabled={!canGoBack} onClick={() => setStartIndex((index) => Math.max(0, index - 1))}>
            ‹
          </button>
          <button type="button" disabled={!canGoForward} onClick={() => setStartIndex((index) => index + 1)}>
            ›
          </button>
        </div>
      </div>
      <div className="premium-product-grid">
        {visibleProducts.map((product, index) => (
          <PremiumProductCard
            delay={index * 70}
            key={product.id}
            product={product}
            lang={lang}
            t={t}
            onOpenProduct={onOpenProduct}
            onAddToCart={onAddToCart}
          />
        ))}
      </div>
    </section>
  );
}

function EditorialStory({ t }: { t: Record<string, string> }) {
  return (
    <>
      <section className="editorial-band">
        <img src="https://images.unsplash.com/photo-1776633734208-3cdf89a7fbf0?w=1600&h=960&fit=crop&auto=format" alt="" />
        <div>
          <p>{t["premium.story.label"]}</p>
          <h2>{t["premium.story.title"]}</h2>
          <a href="#collection">{t["premium.story.cta"]}</a>
        </div>
        <figure>
          <img src={categories[0].image} alt="Linen shirt campaign" />
        </figure>
      </section>
      <section className="craft-section">
        <div className="craft-image-stack">
          <img src={heroSlides[0].image} alt="Craft story" />
          <img src={categories[1].image} alt="Fabric detail" />
        </div>
        <div>
          <p>{t["premium.craft.label"]}</p>
          <h2>{t["premium.craft.title"]}</h2>
          <p>
            {t["premium.craft.text1"]}
          </p>
          <p>
            {t["premium.craft.text2"]}
          </p>
          <a href="#standard">{t["premium.craft.cta"]} →</a>
        </div>
      </section>
    </>
  );
}

function BestSellerGrid({
  lang,
  t,
  products,
  title,
  onOpenProduct,
  onAddToCart,
}: {
  lang: Lang;
  t: Record<string, string>;
  products: Product[];
  title: string;
  onOpenProduct: (product: Product) => void;
  onAddToCart: (product: Product, size?: string, color?: ProductColor) => void;
}) {
  if (products.length === 0) return null;

  return (
    <section className="premium-section best-seller-section" id="best-sellers">
      <div className="premium-heading centered">
        <p>{t["premium.best.label"]}</p>
        <h2>{title}</h2>
      </div>
      <div className="premium-product-grid best-seller-grid">
        {products.slice(0, 3).map((product, index) => (
          <PremiumProductCard
            delay={index * 80}
            key={product.id}
            product={product}
            lang={lang}
            t={t}
            onOpenProduct={onOpenProduct}
            onAddToCart={onAddToCart}
          />
        ))}
      </div>
    </section>
  );
}

function Commitments({ t }: { t: Record<string, string> }) {
  const commitments = [
    [t["premium.commit.delivery"], t["premium.commit.deliveryText"]],
    [t["premium.commit.returns"], t["premium.commit.returnsText"]],
    [t["premium.commit.sustainable"], t["premium.commit.sustainableText"]],
    [t["premium.commit.quality"], t["premium.commit.qualityText"]],
  ];

  return (
    <section className="commitment-section">
      <h2>{t["premium.commit.title"]}</h2>
      <div>
        {commitments.map(([title, text]) => (
          <article key={title}>
            <span>{title.slice(0, 1)}</span>
            <h3>{title}</h3>
            <p>{text}</p>
          </article>
        ))}
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
  onAddToCart: (product: Product, size?: string, color?: ProductColor) => void;
}) {
  return (
    <section className="premium-section all-products-section" id="collection">
      <div className="premium-heading">
        <div>
          <p>{t["collection.label"]}</p>
          <h2>{t["collection.title"]}</h2>
        </div>
        <span>{t["collection.text"]}</span>
      </div>
      {products.length === 0 ? (
        <div className="empty-product-band">{t["collection.empty"]}</div>
      ) : (
        <div className="premium-product-grid all-products-grid">
          {products.map((product, index) => (
            <PremiumProductCard
              delay={index * 45}
              key={product.id}
              product={product}
              lang={lang}
              t={t}
              onOpenProduct={onOpenProduct}
              onAddToCart={onAddToCart}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function PremiumProductCard({
  product,
  lang,
  t,
  onOpenProduct,
  onAddToCart,
  delay = 0,
}: {
  product: Product;
  lang: Lang;
  t: Record<string, string>;
  onOpenProduct: (product: Product) => void;
  onAddToCart: (product: Product, size?: string, color?: ProductColor) => void;
  delay?: number;
}) {
  const copy = product.translations[lang];
  const [selectedColor, setSelectedColor] = useState(product.colors[0]);
  const [hovered, setHovered] = useState(false);
  const hoverImage = product.gallery[1] ?? product.gallery[0];

  return (
    <article className="premium-product-card" style={{ animationDelay: `${delay}ms` }} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <div className="premium-product-image">
        <button type="button" onClick={() => onOpenProduct(product)}>
          <img src={hovered ? hoverImage : product.gallery[0]} alt={copy.name} />
        </button>
        <span>{copy.badge}</span>
        <button type="button" onClick={() => onAddToCart(product, product.sizes[0], selectedColor)}>
          Quick Add
        </button>
      </div>
      <div className="premium-product-info">
        <ProductSwatches product={product} selectedColor={selectedColor} onSelect={setSelectedColor} t={t} />
        <span>{copy.category}</span>
        <h3>{copy.name}</h3>
        <strong>{formatPrice(product.price)}</strong>
      </div>
    </article>
  );
}

function ProductSwatches({
  product,
  selectedColor,
  onSelect,
  t,
}: {
  product: Product;
  selectedColor?: ProductColor;
  onSelect: (color: ProductColor) => void;
  t: Record<string, string>;
}) {
  return (
    <div className="product-swatches" role="radiogroup" aria-label={t["detail.color"]}>
      {product.colors.slice(0, 4).map((color) => (
        <button
          className={selectedColor?.name === color.name ? "is-selected" : ""}
          key={color.name}
          type="button"
          title={color.name}
          role="radio"
          aria-checked={selectedColor?.name === color.name}
          onClick={() => onSelect(color)}
        >
          <span style={{ backgroundColor: color.hex }} />
        </button>
      ))}
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
