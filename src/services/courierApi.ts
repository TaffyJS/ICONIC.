import type { CourierOffice, CourierProvider, CourierQuote, DeliveryMethod } from "../types/courier";

type OfficesResponse = {
  offices: CourierOffice[];
  source: "live" | "fallback";
};

type CitiesResponse = {
  cities: string[];
  source: "live" | "fallback";
};

type QuoteResponse = {
  quote: CourierQuote;
};

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Request failed with status ${response.status}`);
  }

  return (await response.json()) as T;
}

export async function fetchCourierCities(provider: CourierProvider) {
  return postJson<CitiesResponse>("/api/couriers/cities", { provider });
}

export async function fetchCourierOffices(provider: CourierProvider, city: string) {
  return postJson<OfficesResponse>("/api/couriers/offices", { provider, city });
}

export async function fetchCourierQuote(input: {
  provider: CourierProvider;
  deliveryMethod: DeliveryMethod;
  city: string;
  postalCode?: string;
  officeId?: string;
  subtotal: number;
  itemCount: number;
}) {
  return postJson<QuoteResponse>("/api/couriers/quote", input);
}
