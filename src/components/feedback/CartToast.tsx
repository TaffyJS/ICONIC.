export function CartToast({ productName, t }: { productName: string; t: Record<string, string> }) {
  return (
    <div className={`cart-toast ${productName ? "is-visible" : ""}`} aria-live="polite">
      <span>{t["product.add"]}</span>
      <strong>{productName}</strong>
    </div>
  );
}
