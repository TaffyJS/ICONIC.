import type { CourierCredentials, CourierOffice } from "../types/courier.js";
import { normalizeText, uniqueSorted } from "../utils/text.js";
import { fetchJson } from "./httpClient.js";

type SpeedySite = {
  id: number;
  name?: string;
};

type SpeedyOffice = {
  id: number;
  name?: string;
  latitude?: number;
  longitude?: number;
  x?: number;
  y?: number;
  address?: {
    fullAddressString?: string;
    siteName?: string;
    postCode?: string;
  };
};

export async function getSpeedyCities({ apiUrl, userName, password }: CourierCredentials) {
  const officeResponse = await fetchJson<{ offices?: SpeedyOffice[] }>(`${apiUrl}/location/office`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userName,
      password,
      language: "EN",
      countryId: 100,
      limit: 5000,
    }),
  });

  const officeCities = uniqueSorted((officeResponse.offices ?? []).map((office) => office.address?.siteName ?? ""));
  if (officeCities.length > 0) return officeCities;

  const siteResponse = await fetchJson<{ sites?: SpeedySite[] }>(`${apiUrl}/location/site`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userName,
      password,
      language: "EN",
      countryId: 100,
      limit: 5000,
    }),
  });

  return uniqueSorted((siteResponse.sites ?? []).map((site) => site.name ?? ""));
}

export async function getSpeedyOffices(credentials: CourierCredentials, city: string): Promise<CourierOffice[]> {
  const siteResponse = await fetchJson<{ sites?: SpeedySite[] }>(`${credentials.apiUrl}/location/site`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userName: credentials.userName,
      password: credentials.password,
      language: "EN",
      name: city,
      countryId: 100,
      limit: 20,
    }),
  });

  const sites = siteResponse.sites ?? [];
  const siteId = (sites.find((site) => normalizeText(site.name ?? "") === normalizeText(city)) ?? sites[0])?.id;
  if (!siteId) return [];

  const officeResponse = await fetchJson<{ offices?: SpeedyOffice[] }>(`${credentials.apiUrl}/location/office`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userName: credentials.userName,
      password: credentials.password,
      language: "EN",
      siteId,
      limit: 500,
    }),
  });

  return (officeResponse.offices ?? []).map((office) => ({
    id: String(office.id),
    provider: "speedy",
    label: office.name || `Speedy ${office.id}`,
    city: office.address?.siteName || city,
    address: office.address?.fullAddressString || office.name || city,
    postcode: office.address?.postCode,
    latitude: Number(office.latitude ?? office.y) || undefined,
    longitude: Number(office.longitude ?? office.x) || undefined,
  }));
}
