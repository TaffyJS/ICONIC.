import { useEffect, useState } from "react";
import { detailLabels, products, type Lang, type Product } from "../../data";
import { formatPrice } from "../../utils/format";

export default function ProductPage({
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
  const selectedSizeStock = product.sizeStock[selectedSize] ?? product.stock;
  const lowSizeStock = selectedSizeStock <= 3;

  useEffect(() => {
    setActiveImage(0);
  }, [product.id]);

  function moveImage(direction: -1 | 1) {
    setActiveImage((current) => (current + direction + product.gallery.length) % product.gallery.length);
  }

  return (
    <section className="product-detail" id="product-detail">
      <div className="detail-intro">
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
      </div>
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
      <div className="detail-body">
        <div className="detail-specs">
          <div>
            <span>{t["detail.fit"]}</span>
            <strong>{copy.fit}</strong>
          </div>
          <div>
            <span>{t["detail.material"]}</span>
            <strong>{copy.material}</strong>
          </div>
        </div>
        <div className="size-selector">
          <div className="size-label-row">
            <div className="field-label">{t["detail.size"]}</div>
            <span className={`size-stock-note ${lowSizeStock ? "is-visible" : ""}`}>
              {selectedSizeStock} {selectedSize} sizes left
            </span>
          </div>
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
