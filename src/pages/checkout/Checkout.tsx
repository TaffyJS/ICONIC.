import React, { useState } from "react";
import type { Lang, Product } from "../../data";
import type { CartItem } from "../../types/app";
import { deliveryPrice, formatPrice } from "../../utils/format";

export default function Checkout({
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
