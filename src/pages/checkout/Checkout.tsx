import React, { useEffect, useMemo, useState } from "react";
import type { Lang, Product } from "../../data";
import { fetchCourierCities, fetchCourierOffices, fetchCourierQuote } from "../../services/courierApi";
import type { CourierOffice, CourierProvider } from "../../types/courier";
import type { CartItem } from "../../types/app";
import { formatPrice } from "../../utils/format";

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
  const [provider, setProvider] = useState<CourierProvider>("speedy");
  const [officeCity, setOfficeCity] = useState("");
  const [officeCities, setOfficeCities] = useState<string[]>([]);
  const [courierDataSource, setCourierDataSource] = useState<"live" | "fallback">("fallback");
  const [loadingCities, setLoadingCities] = useState(false);
  const [offices, setOffices] = useState<CourierOffice[]>([]);
  const [selectedOfficeId, setSelectedOfficeId] = useState("");
  const [loadingOffices, setLoadingOffices] = useState(false);
  const [deliveryError, setDeliveryError] = useState("");
  const [quoteAmount, setQuoteAmount] = useState<number | null>(null);
  const [quoteEstimate, setQuoteEstimate] = useState(true);
  const [discountInput, setDiscountInput] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState("");
  const [discountError, setDiscountError] = useState("");
  const discountRate = appliedDiscount === "ICONIC10" ? 0.1 : 0;
  const discount = subtotal * discountRate;
  const afterDiscount = subtotal - discount;
  const cardSaving = payment === "card" ? afterDiscount * 0.03 : 0;
  const checkoutDelivery = subtotal > 0 ? quoteAmount ?? (delivery === "address" ? 4.2 : 3.1) : 0;
  const checkoutTotal = Math.max(0, afterDiscount - cardSaving + checkoutDelivery);
  const selectedOffice = useMemo(
    () => offices.find((office) => office.id === selectedOfficeId) ?? null,
    [offices, selectedOfficeId],
  );

  useEffect(() => {
    if (delivery !== "office") return;

    let ignore = false;

    async function loadCities() {
      setLoadingCities(true);
      setDeliveryError("");
      setOfficeCities([]);
      setOffices([]);
      setSelectedOfficeId("");

      try {
        const response = await fetchCourierCities(provider);
        if (ignore) return;

        setOfficeCities(response.cities);
        setCourierDataSource(response.source);
        setOfficeCity((currentCity) => {
          if (response.cities.includes(currentCity)) return currentCity;
          return response.cities[0] ?? "";
        });
      } catch {
        if (ignore) return;
        setOfficeCities([]);
        setOfficeCity("");
        setDeliveryError(t["checkout.deliveryError"]);
      } finally {
        if (!ignore) setLoadingCities(false);
      }
    }

    void loadCities();

    return () => {
      ignore = true;
    };
  }, [delivery, provider, t]);

  useEffect(() => {
    if (delivery !== "office" || !officeCity) return;

    let ignore = false;

    async function loadOffices() {
      setLoadingOffices(true);
      setDeliveryError("");

      try {
        const response = await fetchCourierOffices(provider, officeCity);
        if (ignore) return;

        setOffices(response.offices);
        setCourierDataSource(response.source);
        setSelectedOfficeId(response.offices[0]?.id ?? "");
      } catch {
        if (ignore) return;

        setOffices([]);
        setSelectedOfficeId("");
        setDeliveryError(t["checkout.deliveryError"]);
      } finally {
        if (!ignore) setLoadingOffices(false);
      }
    }

    void loadOffices();

    return () => {
      ignore = true;
    };
  }, [delivery, provider, officeCity, t]);

  useEffect(() => {
    async function loadQuote() {
      if (subtotal <= 0) {
        setQuoteAmount(0);
        return;
      }

      try {
        const { quote } = await fetchCourierQuote({
          provider,
          deliveryMethod: delivery,
          city: delivery === "office" ? officeCity : "Sofia",
          postalCode: selectedOffice?.postcode,
          officeId: selectedOfficeId || undefined,
          subtotal,
          itemCount: cartLines.reduce((sum, line) => sum + line.quantity, 0),
        });
        setQuoteAmount(quote.amount);
        setQuoteEstimate(quote.estimate);
        setDeliveryError("");
      } catch {
        setQuoteAmount(delivery === "address" ? 4.2 : 3.1);
        setQuoteEstimate(true);
        setDeliveryError(t["checkout.deliveryError"]);
      }
    }

    void loadQuote();
  }, [provider, delivery, officeCity, selectedOfficeId, selectedOffice?.postcode, subtotal, cartLines, t]);

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
          <small>{t["checkout.deliveryEstimateNote"]}</small>
        </div>
      </div>
      <div className="checkout-panel">
        <CartSummary
          lang={lang}
          cartLines={cartLines}
          subtotal={subtotal}
          deliveryTotal={checkoutDelivery}
          total={checkoutTotal}
          provider={provider}
          onRemove={onRemove}
          t={t}
        />
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
            <div className="choice-grid courier-provider-grid">
              <ChoiceCard
                checked={provider === "speedy"}
                title={t["checkout.speedy"]}
                text={t["checkout.deliveryQuote"]}
                onSelect={() => setProvider("speedy")}
              />
              <ChoiceCard
                checked={provider === "econt"}
                title={t["checkout.econt"]}
                text={t["checkout.deliveryQuote"]}
                onSelect={() => setProvider("econt")}
              />
            </div>
            {delivery === "address" ? (
              <div className="payment-grid">
                <label className="wide-field">
                  <span>{t["checkout.fullName"]}</span>
                  <input name="fullName" placeholder="ICONIC CUSTOMER" required />
                </label>
                <label className="wide-field">
                  <span>{t["checkout.street"]}</span>
                  <input name="street" placeholder="ul. Shipka 12" required />
                </label>
                <label>
                  <span>{t["checkout.city"]}</span>
                  <input name="city" placeholder="Sofia" required />
                </label>
                <label>
                  <span>{t["checkout.postalCode"]}</span>
                  <input name="postalCode" placeholder="1000" required />
                </label>
              </div>
            ) : (
              <div className="payment-grid">
                <label>
                  <span>{t["checkout.officeCity"]}</span>
                  <select
                    value={officeCity}
                    onChange={(event) => setOfficeCity(event.target.value)}
                    disabled={loadingCities || officeCities.length === 0}
                    required
                  >
                    <option value="">
                      {loadingCities ? t["checkout.loadingCities"] : t["checkout.noCities"]}
                    </option>
                    {officeCities.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="wide-field">
                  <span>{t["checkout.fullName"]}</span>
                  <input name="fullName" placeholder="ICONIC CUSTOMER" required />
                </label>
                <label className="wide-field">
                  <span>{t["checkout.courierOffice"]}</span>
                  <select
                    required
                    value={selectedOfficeId}
                    onChange={(event) => setSelectedOfficeId(event.target.value)}
                  >
                    <option value="">{loadingOffices ? t["checkout.loadingOffices"] : t["checkout.noOffices"]}</option>
                    {offices.map((office) => (
                      <option key={office.id} value={office.id}>
                        {office.provider === "speedy" ? t["checkout.speedy"] : t["checkout.econt"]} - {office.label}, {office.address}
                      </option>
                    ))}
                  </select>
                </label>
                <OfficeMap city={officeCity} provider={provider} selectedOffice={selectedOffice} t={t} />
              </div>
            )}
            <div className="delivery-quote-card">
              <span>{quoteEstimate ? t["checkout.deliveryEstimate"] : t["checkout.deliveryLive"]}</span>
              <strong>
                {t["checkout.deliveryQuote"]}: {formatPrice(checkoutDelivery)}
              </strong>
              {deliveryError ? <small className="is-error">{deliveryError}</small> : null}
              {delivery === "office" && courierDataSource === "fallback" && !deliveryError ? <small>{t["checkout.demoCourierData"]}</small> : null}
            </div>
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
                  <input name="cardholder" placeholder="ICONIC CUSTOMER" required />
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

function OfficeMap({
  city,
  provider,
  selectedOffice,
  t,
}: {
  city: string;
  provider: CourierProvider;
  selectedOffice: CourierOffice | null;
  t: Record<string, string>;
}) {
  const providerLabel = t[provider === "speedy" ? "checkout.speedy" : "checkout.econt"];
  const mapQuery = selectedOffice
    ? `${providerLabel} ${selectedOffice.label} ${selectedOffice.address} ${selectedOffice.city} Bulgaria`
    : `${providerLabel} offices ${city || "Bulgaria"}`;
  const encodedMapQuery = encodeURIComponent(mapQuery);
  const googleMapUrl = `https://maps.google.com/maps?q=${encodedMapQuery}&output=embed`;
  const googleMapLink = `https://www.google.com/maps/search/?api=1&query=${encodedMapQuery}`;

  return (
    <div className="office-map-card wide-field">
      <div className="office-map-head">
        <span>{t["checkout.officeMap"]}</span>
        <strong>{selectedOffice ? selectedOffice.label : `${providerLabel} · ${city || t["checkout.noCities"]}`}</strong>
      </div>
      <iframe
        className="office-map"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        src={googleMapUrl}
        title={t["checkout.officeMap"]}
      />
      <div className="office-map-details">
        {selectedOffice ? (
          <>
            <strong>{selectedOffice.address}</strong>
            <span>
              {selectedOffice.city}
              {selectedOffice.postcode ? ` · ${selectedOffice.postcode}` : ""}
            </span>
          </>
        ) : (
          <span>{t["checkout.noOffices"]}</span>
        )}
        <a href={googleMapLink} rel="noreferrer" target="_blank">
          {t["checkout.openGoogleMap"]}
        </a>
      </div>
    </div>
  );
}

function CartSummary({
  lang,
  cartLines,
  subtotal,
  deliveryTotal,
  total,
  provider,
  onRemove,
  t,
}: {
  lang: Lang;
  cartLines: Array<CartItem & { product: Product }>;
  subtotal: number;
  deliveryTotal: number;
  total: number;
  provider: CourierProvider;
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
          <strong>{subtotal > 0 ? formatPrice(deliveryTotal) : formatPrice(0)}</strong>
        </div>
        <div>
          <span>{t["checkout.courierProvider"]}</span>
          <strong>{t[provider === "speedy" ? "checkout.speedy" : "checkout.econt"]}</strong>
        </div>
        <div className="grand-total">
          <span>{t["cart.total"]}</span>
          <strong>{formatPrice(total)}</strong>
        </div>
      </div>
    </aside>
  );
}
