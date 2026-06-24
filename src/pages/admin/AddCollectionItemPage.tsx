import React, { useState } from "react";
import type { DraftCollectionItem } from "../../types/app";
import { formatPrice } from "../../utils/format";

export default function AddCollectionItemPage({ t }: { t: Record<string, string> }) {
  const defaultSizes = ["XS", "S", "M", "L", "XL"];
  const [drafts, setDrafts] = useState<DraftCollectionItem[]>([]);
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
    details: "Limited run\nHand-cut preparation\nGift-ready packaging",
    care: "Wash at 30 degrees\nAir dry\nIron on low heat",
  });
  const [sizes, setSizes] = useState<string[]>(["S", "M", "L"]);
  const [sizeStock, setSizeStock] = useState<Record<string, string>>({ S: "3", M: "3", L: "3" });
  const [images, setImages] = useState<string[]>([]);

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

  function readFiles(files: FileList | null) {
    if (!files?.length) return;
    const selectedFiles = Array.from(files).filter((file) => file.type.startsWith("image/"));
    Promise.all(
      selectedFiles.map(
        (file) =>
          new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(String(reader.result));
            reader.onerror = () => reject(reader.error);
            reader.readAsDataURL(file);
          }),
      ),
    )
      .then((previews) => {
        setImages((current) => [...current, ...previews].slice(0, 6));
        setStatus("");
      })
      .catch(() => setStatus("Could not read one of the selected images."));
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
      details: "Limited run\nHand-cut preparation\nGift-ready packaging",
      care: "Wash at 30 degrees\nAir dry\nIron on low heat",
    });
    setSizes(["S", "M", "L"]);
    setSizeStock({ S: "3", M: "3", L: "3" });
    setImages([]);
  }

  function createDraft(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const price = Number.parseFloat(form.price);
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
    if (images.length === 0) {
      setStatus("Upload at least one product image for the collection item.");
      return;
    }

    const draft: DraftCollectionItem = {
      id: `draft-${Date.now()}`,
      name: form.name.trim(),
      category: form.category.trim(),
      price,
      sizeStock: parsedSizeStock,
      sku: form.sku.trim() || `ICONIC-${Date.now().toString().slice(-5)}`,
      color: form.color.trim(),
      fit: form.fit.trim(),
      material: form.material.trim(),
      description: form.description.trim(),
      sizes,
      details: form.details.trim(),
      care: form.care.trim(),
      images,
    };

    setDrafts((current) => [draft, ...current]);
    setStatus("Draft collection item created. It is stored in this admin session only.");
    resetForm();
  }

  const previewImage = images[0] || "/assets/iconic-logo-tile.png";
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
          <span>Demo workflow</span>
          <p>Uploads are previewed in-browser. A real save would need backend storage and a product API.</p>
        </div>
      </div>

      <div className="admin-create-layout">
        <form className="admin-create-form" onSubmit={createDraft}>
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
            </div>
          </section>

          <section className="admin-card admin-form-section">
            <div className="card-head">
              <div>
                <div className="section-label">Images and variants</div>
                <h3>Upload and stock setup</h3>
              </div>
            </div>
            <div className="upload-drop">
              <input id="collection-images" type="file" accept="image/*" multiple onChange={(event) => readFiles(event.target.files)} />
              <label htmlFor="collection-images">
                <strong>Upload product images</strong>
                <span>PNG, JPG, WebP. Up to 6 preview images in this demo.</span>
              </label>
            </div>
            <div className="upload-preview-grid">
              {images.length === 0 ? (
                <div className="upload-empty">No images uploaded yet.</div>
              ) : (
                images.map((image, index) => (
                  <div key={`${image.slice(0, 28)}-${index}`}>
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
                Save draft item
              </button>
              <button className="button button-light" type="button" onClick={resetForm}>
                Clear form
              </button>
              <p className="form-note">{status || "Drafts stay available until the page reloads."}</p>
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
            <div className="panel-title">Created drafts</div>
            {drafts.length === 0 ? (
              <p>No draft items yet.</p>
            ) : (
              drafts.map((draft) => (
                <article key={draft.id}>
                  <img src={draft.images[0]} alt={draft.name} />
                  <div>
                    <strong>{draft.name}</strong>
                    <span>
                      {draft.sku} · {formatPrice(draft.price)} ·{" "}
                      {Object.entries(draft.sizeStock)
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
