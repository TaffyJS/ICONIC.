import type { CourierProvider, DeliveryMethod } from "../types/courier.js";

type ValidationResult<T> = { ok: true; value: T } | { ok: false; error: string };

function isProvider(value: string): value is CourierProvider {
  return value === "speedy" || value === "econt";
}

function isDeliveryMethod(value: string): value is DeliveryMethod {
  return value === "address" || value === "office";
}

export function parseCitiesRequest(body: Record<string, unknown>): ValidationResult<{ provider: CourierProvider }> {
  const provider = String(body.provider || "");
  if (!isProvider(provider)) {
    return { ok: false, error: "provider is required" };
  }
  return { ok: true, value: { provider } };
}

export function parseOfficesRequest(body: Record<string, unknown>): ValidationResult<{ provider: CourierProvider; city: string }> {
  const provider = String(body.provider || "");
  const city = String(body.city || "").trim();

  if (!isProvider(provider) || !city) {
    return { ok: false, error: "provider and city are required" };
  }

  return { ok: true, value: { provider, city } };
}

export function parseQuoteRequest(body: Record<string, unknown>): ValidationResult<{
  provider: CourierProvider;
  deliveryMethod: DeliveryMethod;
  itemCount: number;
  subtotal: number;
}> {
  const provider = String(body.provider || "speedy");
  const deliveryMethod = String(body.deliveryMethod || "address");

  if (!isProvider(provider)) {
    return { ok: false, error: "valid provider is required" };
  }

  if (!isDeliveryMethod(deliveryMethod)) {
    return { ok: false, error: "valid deliveryMethod is required" };
  }

  return {
    ok: true,
    value: {
      provider,
      deliveryMethod,
      itemCount: Number(body.itemCount || 1),
      subtotal: Number(body.subtotal || 0),
    },
  };
}
