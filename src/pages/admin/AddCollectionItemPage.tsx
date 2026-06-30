import React, { useState } from "react";
import type { Product } from "../../data";
import { createProduct } from "../../services/commerceApi";
import { formatPrice } from "../../utils/format";

export default function AddCollectionItemPage({ t, onSaved }: { t: Record<string, string>; onSaved: () => Promise<void> }) {
  const defaultSizes = ["XS", "S", "M", "L", "XL"];
  const [savedProducts, setSavedProducts] = useState<Product[]>([]);
  const [status, setStatus] = useState("");
  const [autoTranslateBg, setAutoTranslateBg] = useState(true);
  const [form, setForm] = useState({
    name: "",
    category: "",
    price: "69",
    sku: "",
    color: "Natural cream",
    fit: "Relaxed fit",
    material: "Linen blend",
    description: "",
    short: "",
    badge: "New arrival",
    details: "Limited run\nHand-cut preparation\nGift-ready packaging",
    care: "Wash at 30 degrees\nAir dry\nIron on low heat",
  });
  const [bgForm, setBgForm] = useState({
    name: "",
    category: "",
    color: "",
    fit: "",
    material: "",
    description: "",
    short: "",
    badge: "",
    details: "",
    care: "",
  });
  const [sizes, setSizes] = useState<string[]>(["S", "M", "L"]);
  const [sizeStock, setSizeStock] = useState<Record<string, string>>({ S: "3", M: "3", L: "3" });
  const [imageUrls, setImageUrls] = useState("");

  function updateField(field: keyof typeof form, value: string) {
    setStatus("");
    setForm((current) => ({ ...current, [field]: value }));
  }

  function updateBgField(field: keyof typeof bgForm, value: string) {
    setStatus("");
    setBgForm((current) => ({ ...current, [field]: value }));
  }

  function toggleSize(size: string) {
    setStatus("");
    setSizes((current) => {
      if (current.includes(size)) {
        setSizeStock((stock) => {
          const next = { ...stock };
          delete next[size];
          return next;
        });
        return current.filter((entry) => entry !== size);
      }
      setSizeStock((stock) => ({ ...stock, [size]: stock[size] ?? "1" }));
      return [...current, size];
    });
  }

  function updateSizeStock(size: string, value: string) {
    setStatus("");
    setSizeStock((current) => ({ ...current, [size]: value }));
  }

  function resetForm() {
    setForm({
      name: "",
      category: "",
      price: "69",
      sku: "",
      color: "Natural cream",
      fit: "Relaxed fit",
      material: "Linen blend",
      description: "",
      short: "",
      badge: "New arrival",
      details: "Limited run\nHand-cut preparation\nGift-ready packaging",
      care: "Wash at 30 degrees\nAir dry\nIron on low heat",
    });
    setSizes(["S", "M", "L"]);
    setSizeStock({ S: "3", M: "3", L: "3" });
    setImageUrls("");
    setBgForm({
      name: "",
      category: "",
      color: "",
      fit: "",
      material: "",
      description: "",
      short: "",
      badge: "",
      details: "",
      care: "",
    });
  }

  async function saveProduct(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const price = Number.parseFloat(form.price);
    const parsedImageUrls = imageUrls
      .split(/\r?\n/)
      .map((url) => url.trim())
      .filter(Boolean);
    const parsedSizeStock = sizes.reduce<Record<string, number>>((acc, size) => {
      acc[size] = Number.parseInt(sizeStock[size] ?? "", 10);
      return acc;
    }, {});
    const totalStock = Object.values(parsedSizeStock).reduce((sum, value) => sum + value, 0);

    if (!form.name.trim() || !form.category.trim() || !form.description.trim()) {
      setStatus(t["admin.create.validationContent"]);
      return;
    }
    if (!Number.isFinite(price) || price <= 0) {
      setStatus(t["admin.create.validationPrice"]);
      return;
    }
    if (sizes.length === 0) {
      setStatus(t["admin.create.validationSize"]);
      return;
    }
    if (Object.values(parsedSizeStock).some((value) => !Number.isFinite(value) || value < 0)) {
      setStatus(t["admin.create.validationStock"]);
      return;
    }
    if (totalStock <= 0) {
      setStatus(t["admin.create.validationStockTotal"]);
      return;
    }
    if (parsedImageUrls.length === 0) {
      setStatus(t["admin.create.validationImage"]);
      return;
    }
    const bgTranslation = autoTranslateBg ? getBulgarianDraft(form) : bgForm;
    const bgMissing = [bgTranslation.name, bgTranslation.category, bgTranslation.description, bgTranslation.fit, bgTranslation.material, bgTranslation.badge].some(
      (value) => !value.trim(),
    );
    if (bgMissing) {
      setStatus(t["admin.create.validationBg"]);
      return;
    }

    try {
      const { product } = await createProduct({
        name: form.name.trim(),
        category: form.category.trim(),
        price,
        sku: form.sku.trim() || undefined,
        color: form.color.trim(),
        fit: form.fit.trim(),
        material: form.material.trim(),
        description: form.description.trim(),
        short: form.short.trim() || form.description.trim(),
        badge: form.badge.trim() || "New arrival",
        sizes,
        sizeStock: parsedSizeStock,
        details: form.details.split(/\r?\n/).map((line) => line.trim()).filter(Boolean),
        care: form.care.split(/\r?\n/).map((line) => line.trim()).filter(Boolean),
        imageUrls: parsedImageUrls,
        translations: {
          en: {
            name: form.name.trim(),
            category: form.category.trim(),
            short: form.short.trim() || form.description.trim(),
            description: form.description.trim(),
            fit: form.fit.trim(),
            material: form.material.trim(),
            badge: form.badge.trim() || "New arrival",
          },
          bg: {
            name: bgTranslation.name.trim(),
            category: bgTranslation.category.trim(),
            short: bgTranslation.short.trim() || bgTranslation.description.trim(),
            description: bgTranslation.description.trim(),
            fit: bgTranslation.fit.trim(),
            material: bgTranslation.material.trim(),
            badge: bgTranslation.badge.trim(),
          },
        },
      });

      setSavedProducts((current) => [product, ...current]);
      setStatus(t["admin.create.saved"]);
      await onSaved();
      resetForm();
    } catch {
      setStatus(t["admin.create.saveError"]);
    }
  }

  const parsedPreviewImages = imageUrls.split(/\r?\n/).map((url) => url.trim()).filter(Boolean);
  const previewImage = parsedPreviewImages[0] || "/assets/iconic-logo-tile.png";
  const previewTotalStock = sizes.reduce((sum, size) => sum + (Number.parseInt(sizeStock[size] ?? "0", 10) || 0), 0);
  const activeBgForm = autoTranslateBg ? getBulgarianDraft(form) : bgForm;

  return (
    <section className="admin-shell admin-dashboard admin-create-page">
      <div className="admin-topbar admin-create-topbar">
        <div>
          <a className="admin-back-link" href="#/admin">
            {t["admin.create.back"]}
          </a>
          <div className="section-label">{t["admin.addItem"]}</div>
          <h2>{t["admin.create.title"]}</h2>
        </div>
        <div className="admin-create-note">
          <span>{t["admin.create.workflow"]}</span>
          <p>{t["admin.create.workflowText"]}</p>
        </div>
      </div>

      <div className="admin-create-layout">
        <form className="admin-create-form" onSubmit={(event) => void saveProduct(event)}>
          <section className="admin-card admin-form-section">
            <div className="card-head">
              <div>
                <div className="section-label">{t["admin.create.content"]}</div>
                <h3>{t["admin.create.basic"]}</h3>
              </div>
            </div>
            <div className="admin-form-grid">
              <label>
                <span>{t["admin.create.nameEn"]}</span>
                <input value={form.name} onChange={(event) => updateField("name", event.target.value)} placeholder="Linen Camp Shirt" />
              </label>
              <label>
                <span>{t["admin.create.categoryEn"]}</span>
                <input value={form.category} onChange={(event) => updateField("category", event.target.value)} placeholder="Light shirt" />
              </label>
              <label>
                <span>Price EUR</span>
                <input inputMode="decimal" value={form.price} onChange={(event) => updateField("price", event.target.value)} />
              </label>
              <label>
                <span>SKU</span>
                <input value={form.sku} onChange={(event) => updateField("sku", event.target.value)} placeholder="Auto if empty" />
              </label>
              <label>
                <span>{t["admin.create.colorEn"]}</span>
                <input value={form.color} onChange={(event) => updateField("color", event.target.value)} />
              </label>
              <label>
                <span>{t["admin.create.fitEn"]}</span>
                <input value={form.fit} onChange={(event) => updateField("fit", event.target.value)} />
              </label>
              <label>
                <span>{t["admin.create.materialEn"]}</span>
                <input value={form.material} onChange={(event) => updateField("material", event.target.value)} />
              </label>
              <label className="wide-field">
                <span>{t["admin.create.descriptionEn"]}</span>
                <textarea
                  value={form.description}
                  onChange={(event) => updateField("description", event.target.value)}
                  placeholder="Describe the cut, fabric feel, and why it belongs in this drop."
                />
              </label>
              <label className="wide-field">
                <span>{t["admin.create.shortEn"]}</span>
                <textarea
                  value={form.short}
                  onChange={(event) => updateField("short", event.target.value)}
                  placeholder="Short text for homepage product cards."
                />
              </label>
              <label>
                <span>{t["admin.create.badgeEn"]}</span>
                <input value={form.badge} onChange={(event) => updateField("badge", event.target.value)} />
              </label>
            </div>
          </section>

          <section className="admin-card admin-form-section">
            <div className="card-head">
              <div>
                <div className="section-label">{t["admin.create.translation"]}</div>
                <h3>{t["admin.create.bgTitle"]}</h3>
              </div>
              <label className="admin-toggle-row">
                <input
                  checked={autoTranslateBg}
                  type="checkbox"
                  onChange={(event) => {
                    const enabled = event.target.checked;
                    if (!enabled) setBgForm(getBulgarianDraft(form));
                    setAutoTranslateBg(enabled);
                  }}
                />
                <span>{t["admin.create.autoBg"]}</span>
              </label>
            </div>
            <div className="admin-form-grid">
              <label>
                <span>{t["admin.create.nameBg"]}</span>
                <input disabled={autoTranslateBg} value={activeBgForm.name} onChange={(event) => updateBgField("name", event.target.value)} />
              </label>
              <label>
                <span>{t["admin.create.categoryBg"]}</span>
                <input disabled={autoTranslateBg} value={activeBgForm.category} onChange={(event) => updateBgField("category", event.target.value)} />
              </label>
              <label>
                <span>{t["admin.create.colorBg"]}</span>
                <input disabled={autoTranslateBg} value={activeBgForm.color} onChange={(event) => updateBgField("color", event.target.value)} />
              </label>
              <label>
                <span>{t["admin.create.fitBg"]}</span>
                <input disabled={autoTranslateBg} value={activeBgForm.fit} onChange={(event) => updateBgField("fit", event.target.value)} />
              </label>
              <label>
                <span>{t["admin.create.materialBg"]}</span>
                <input disabled={autoTranslateBg} value={activeBgForm.material} onChange={(event) => updateBgField("material", event.target.value)} />
              </label>
              <label>
                <span>{t["admin.create.badgeBg"]}</span>
                <input disabled={autoTranslateBg} value={activeBgForm.badge} onChange={(event) => updateBgField("badge", event.target.value)} />
              </label>
              <label className="wide-field">
                <span>{t["admin.create.descriptionBg"]}</span>
                <textarea disabled={autoTranslateBg} value={activeBgForm.description} onChange={(event) => updateBgField("description", event.target.value)} />
              </label>
              <label className="wide-field">
                <span>{t["admin.create.shortBg"]}</span>
                <textarea disabled={autoTranslateBg} value={activeBgForm.short} onChange={(event) => updateBgField("short", event.target.value)} />
              </label>
            </div>
            <p className="form-note">{t["admin.create.autoBgNote"]}</p>
          </section>

          <section className="admin-card admin-form-section">
            <div className="card-head">
              <div>
                <div className="section-label">{t["admin.create.images"]}</div>
                <h3>{t["admin.create.imagesTitle"]}</h3>
              </div>
            </div>
            <label className="wide-field">
              <span>{t["admin.create.imageUrls"]}</span>
              <textarea
                value={imageUrls}
                onChange={(event) => {
                  setImageUrls(event.target.value);
                  setStatus("");
                }}
                placeholder="https://example.com/product-front.jpg&#10;https://example.com/product-detail.jpg"
              />
            </label>
            <div className="upload-preview-grid">
              {parsedPreviewImages.length === 0 ? (
                <div className="upload-empty">{t["admin.create.noImages"]}</div>
              ) : (
                parsedPreviewImages.map((image, index) => (
                  <div key={`${image}-${index}`}>
                    <img src={image} alt={`Uploaded product ${index + 1}`} />
                  </div>
                ))
              )}
            </div>
            <div className="field-label">{t["admin.create.availableSizes"]}</div>
            <div className="admin-size-grid">
              {defaultSizes.map((size) => (
                <button
                  className={sizes.includes(size) ? "is-selected" : ""}
                  key={size}
                  type="button"
                  onClick={() => toggleSize(size)}
                >
                  {size}
                </button>
              ))}
            </div>
            <div className="field-label">{t["admin.create.stockPerSize"]}</div>
            <div className="size-stock-grid">
              {sizes.length === 0 ? (
                <p>{t["admin.create.selectSize"]}</p>
              ) : (
                sizes.map((size) => (
                  <label key={size}>
                    <span>{size}</span>
                    <input
                      inputMode="numeric"
                      value={sizeStock[size] ?? ""}
                      onChange={(event) => updateSizeStock(size, event.target.value)}
                    />
                  </label>
                ))
              )}
            </div>
          </section>

          <section className="admin-card admin-form-section">
            <div className="admin-form-grid">
              <label>
                <span>{t["detail.details"]}</span>
                <textarea value={form.details} onChange={(event) => updateField("details", event.target.value)} />
              </label>
              <label>
                <span>{t["detail.care"]}</span>
                <textarea value={form.care} onChange={(event) => updateField("care", event.target.value)} />
              </label>
            </div>
            <div className="admin-submit-row">
              <button className="button button-dark" type="submit">
                {t["admin.create.save"]}
              </button>
              <button className="button button-light" type="button" onClick={resetForm}>
                {t["admin.create.clear"]}
              </button>
              <p className="form-note">{status || t["admin.create.savedHint"]}</p>
            </div>
          </section>
        </form>

        <aside className="admin-create-preview">
          <div className="admin-card preview-card">
            <div className="panel-title">{t["admin.create.preview"]}</div>
            <img src={previewImage} alt="Collection item preview" />
            <span>{form.category || t["admin.category"]}</span>
            <h3>{form.name || t["admin.create.newItem"]}</h3>
            <p>{form.description || t["admin.create.previewText"]}</p>
            <div className="preview-meta">
              <strong>{formatPrice(Number.parseFloat(form.price) || 0)}</strong>
              <span>{sizes.length > 0 ? t["admin.create.previewStock"].replace("{count}", String(previewTotalStock)).replace("{sizes}", sizes.join(" / ")) : t["admin.create.noSizes"]}</span>
            </div>
          </div>

          <div className="admin-card draft-list">
            <div className="panel-title">{t["admin.create.savedSession"]}</div>
            {savedProducts.length === 0 ? (
              <p>{t["admin.create.noneSaved"]}</p>
            ) : (
              savedProducts.map((product) => (
                <article key={product.id}>
                  <img src={product.gallery[0]} alt={product.translations.en.name} />
                  <div>
                    <strong>{product.translations.en.name}</strong>
                    <span>
                      {formatPrice(product.price)} ·{" "}
                      {Object.entries(product.sizeStock)
                        .map(([size, count]) => `${count} ${size}`)
                        .join(" / ")}
                    </span>
                  </div>
                </article>
              ))
            )}
          </div>
        </aside>
      </div>
    </section>
  );
}

function getBulgarianDraft(form: {
  name: string;
  category: string;
  color: string;
  fit: string;
  material: string;
  description: string;
  short: string;
  badge: string;
}) {
  return {
    name: translatePhrase(form.name),
    category: translatePhrase(form.category),
    color: translatePhrase(form.color),
    fit: translatePhrase(form.fit),
    material: translatePhrase(form.material),
    description: translatePhrase(form.description),
    short: translatePhrase(form.short || form.description),
    badge: translatePhrase(form.badge || "New arrival"),
    details: "",
    care: "",
  };
}

function translatePhrase(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";

  const dictionary: Record<string, string> = {
    "linen camp shirt": "Ленена camp риза",
    "linen shirt": "Ленена риза",
    "light shirt": "Лека риза",
    shirt: "Риза",
    shirts: "Ризи",
    dress: "Рокля",
    dresses: "Рокли",
    trouser: "Панталон",
    trousers: "Панталони",
    shorts: "Къси панталони",
    top: "Топ",
    tops: "Топове",
    set: "Комплект",
    sets: "Комплекти",
    "natural cream": "Натурален крем",
    cream: "Крем",
    blanc: "Блан",
    coral: "Корал",
    sky: "Небесно синьо",
    sand: "Пясък",
    navy: "Тъмносиньо",
    white: "Бяло",
    black: "Черно",
    moss: "Мъхово зелено",
    terra: "Тера",
    "relaxed fit": "Свободна кройка",
    relaxed: "Свободна",
    slim: "Вталена",
    tailored: "Скроена",
    fluid: "Плавна",
    flowing: "Свободно падаща",
    "linen blend": "Ленена смес",
    linen: "Лен",
    cotton: "Памук",
    "cotton poplin": "Памучен поплин",
    "pima cotton": "Пима памук",
    "new arrival": "Нов модел",
    new: "Ново",
    limited: "Лимитирано",
    essential: "Основен модел",
    sale: "Намаление",
  };

  const direct = dictionary[trimmed.toLowerCase()];
  if (direct) return direct;

  return trimmed
    .replace(/\blinen\b/gi, "лен")
    .replace(/\bcotton\b/gi, "памук")
    .replace(/\bshirt\b/gi, "риза")
    .replace(/\btrouser(s)?\b/gi, "панталон")
    .replace(/\bdress(es)?\b/gi, "рокля")
    .replace(/\bshorts\b/gi, "къси панталони")
    .replace(/\brelaxed\b/gi, "свободна")
    .replace(/\blight\b/gi, "лека")
    .replace(/\bsoft\b/gi, "мека")
    .replace(/\blimited\b/gi, "лимитирана")
    .replace(/\bnew\b/gi, "нов")
    .replace(/\bcollection\b/gi, "колекция");
}
