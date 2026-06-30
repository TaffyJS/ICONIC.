import type { CourierOffice, CourierProvider, CourierQuote, DeliveryMethod } from "../types/courier";
import { postJson } from "./http";

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
