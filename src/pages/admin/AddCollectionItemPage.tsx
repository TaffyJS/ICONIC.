import React, { useState } from "react";
import type { Product } from "../../data";
import { createProduct } from "../../services/commerceApi";
import { formatPrice } from "../../utils/format";

export default function AddCollectionItemPage({ t, onSaved }: { t: Record<string, string>; onSaved: () => Promise<void> }) {
  const defaultSizes = ["XS", "S", "M", "L", "XL"];
  const [savedProducts, setSavedProducts] = useState<Product[]>([]);
  const [status, setStatus] = useState("");
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
  const [sizes, setSizes] = useState<string[]>(["S", "M", "L"]);
  const [sizeStock, setSizeStock] = useState<Record<string, string>>({ S: "3", M: "3", L: "3" });
  const [imageUrls, setImageUrls] = useState("");

  function updateField(field: keyof typeof form, value: string) {
    setStatus("");
    setForm((current) => ({ ...current, [field]: value }));
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
      setStatus("Add a name, category, and product description before saving.");
      return;
    }
    if (!Number.isFinite(price) || price <= 0) {
      setStatus("Price needs a valid positive number.");
      return;
    }
    if (sizes.length === 0) {
      setStatus("Select at least one available size.");
      return;
    }
    if (Object.values(parsedSizeStock).some((value) => !Number.isFinite(value) || value < 0)) {
      setStatus("Every selected size needs a valid stock amount.");
      return;
    }
    if (totalStock <= 0) {
      setStatus("Add stock to at least one selected size.");
      return;
    }
    if (parsedImageUrls.length === 0) {
      setStatus("Add at least one product image URL.");
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
      });

      setSavedProducts((current) => [product, ...current]);
      setStatus("Collection item saved to the database.");
      await onSaved();
      resetForm();
    } catch {
      setStatus("Could not save this product to the database.");
    }
  }

  const parsedPreviewImages = imageUrls.split(/\r?\n/).map((url) => url.trim()).filter(Boolean);
  const previewImage = parsedPreviewImages[0] || "/assets/iconic-logo-tile.png";
  const previewTotalStock = sizes.reduce((sum, size) => sum + (Number.parseInt(sizeStock[size] ?? "0", 10) || 0), 0);

  return (
    <section className="admin-shell admin-dashboard admin-create-page">
      <div className="admin-topbar admin-create-topbar">
        <div>
          <a className="admin-back-link" href="#/admin">
            Back to admin
          </a>
          <div className="section-label">{t["admin.addItem"]}</div>
          <h2>Create a collection item.</h2>
        </div>
        <div className="admin-create-note">
          <span>Database workflow</span>
          <p>Products are saved to the local database. Images are stored as URL references, not binaries.</p>
        </div>
      </div>

      <div className="admin-create-layout">
        <form className="admin-create-form" onSubmit={(event) => void saveProduct(event)}>
          <section className="admin-card admin-form-section">
            <div className="card-head">
              <div>
                <div className="section-label">Product content</div>
                <h3>Basic information</h3>
              </div>
            </div>
            <div className="admin-form-grid">
              <label>
                <span>Name</span>
                <input value={form.name} onChange={(event) => updateField("name", event.target.value)} placeholder="Linen Camp Shirt" />
              </label>
              <label>
                <span>Category</span>
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
                <span>Color</span>
                <input value={form.color} onChange={(event) => updateField("color", event.target.value)} />
              </label>
              <label>
                <span>Fit</span>
                <input value={form.fit} onChange={(event) => updateField("fit", event.target.value)} />
              </label>
              <label>
                <span>Material</span>
                <input value={form.material} onChange={(event) => updateField("material", event.target.value)} />
              </label>
              <label className="wide-field">
                <span>Description</span>
                <textarea
                  value={form.description}
                  onChange={(event) => updateField("description", event.target.value)}
                  placeholder="Describe the cut, fabric feel, and why it belongs in this drop."
                />
              </label>
              <label className="wide-field">
                <span>Short card text</span>
                <textarea
                  value={form.short}
                  onChange={(event) => updateField("short", event.target.value)}
                  placeholder="Short text for homepage product cards."
                />
              </label>
              <label>
                <span>Badge</span>
                <input value={form.badge} onChange={(event) => updateField("badge", event.target.value)} />
              </label>
            </div>
          </section>

          <section className="admin-card admin-form-section">
            <div className="card-head">
              <div>
                <div className="section-label">Images and variants</div>
                <h3>Image references and stock setup</h3>
              </div>
            </div>
            <label className="wide-field">
              <span>Product image URLs</span>
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
                <div className="upload-empty">No image URLs added yet.</div>
              ) : (
                parsedPreviewImages.map((image, index) => (
                  <div key={`${image}-${index}`}>
                    <img src={image} alt={`Uploaded product ${index + 1}`} />
                  </div>
                ))
              )}
            </div>
            <div className="field-label">Available sizes</div>
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
            <div className="field-label">Stock per selected size</div>
            <div className="size-stock-grid">
              {sizes.length === 0 ? (
                <p>Select a size to enter stock.</p>
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
                <span>Details</span>
                <textarea value={form.details} onChange={(event) => updateField("details", event.target.value)} />
              </label>
              <label>
                <span>Care</span>
                <textarea value={form.care} onChange={(event) => updateField("care", event.target.value)} />
              </label>
            </div>
            <div className="admin-submit-row">
              <button className="button button-dark" type="submit">
                Save product
              </button>
              <button className="button button-light" type="button" onClick={resetForm}>
                Clear form
              </button>
              <p className="form-note">{status || "Saved items appear on the homepage after the database responds."}</p>
            </div>
          </section>
        </form>

        <aside className="admin-create-preview">
          <div className="admin-card preview-card">
            <div className="panel-title">Live product preview</div>
            <img src={previewImage} alt="Collection item preview" />
            <span>{form.category || "Category"}</span>
            <h3>{form.name || "New collection item"}</h3>
            <p>{form.description || "Add a description to preview how the item will read in the collection."}</p>
            <div className="preview-meta">
              <strong>{formatPrice(Number.parseFloat(form.price) || 0)}</strong>
              <span>{sizes.length > 0 ? `${previewTotalStock} pieces across ${sizes.join(" / ")}` : "No sizes"}</span>
            </div>
          </div>

          <div className="admin-card draft-list">
            <div className="panel-title">Saved this session</div>
            {savedProducts.length === 0 ? (
              <p>No saved items in this session yet.</p>
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
