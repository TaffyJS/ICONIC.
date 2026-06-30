import type { CourierCredentials, CourierOffice } from "../types/courier.js";
import { normalizeText, uniqueSorted } from "../utils/text.js";
import { fetchJson } from "./httpClient.js";

type EcontCity = {
  id: number;
  name: string;
};

type EcontOffice = {
  id: number;
  name: string;
  latitude?: number;
  longitude?: number;
  gps?: {
    latitude?: number;
    longitude?: number;
  };
  address?: {
    fullAddress?: string;
    postCode?: string;
    city?: {
      name?: string;
    };
  };
};

function getAuth({ userName, password }: CourierCredentials) {
  return `Basic ${Buffer.from(`${userName}:${password}`).toString("base64")}`;
}

export async function getEcontCities(credentials: CourierCredentials) {
  const officesResponse = await fetchJson<{ offices?: EcontOffice[] }>(
    `${credentials.apiUrl}/Nomenclatures/NomenclaturesService.getOffices.json`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: getAuth(credentials),
      },
      body: JSON.stringify({ countryCode: "BGR" }),
    },
  );

  return uniqueSorted((officesResponse.offices ?? []).map((office) => office.address?.city?.name ?? ""));
}

export async function getEcontOffices(credentials: CourierCredentials, city: string): Promise<CourierOffice[]> {
  const citiesResponse = await fetchJson<{ cities?: EcontCity[] }>(
    `${credentials.apiUrl}/Nomenclatures/NomenclaturesService.getCities.json`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: getAuth(credentials),
      },
      body: JSON.stringify({ countryCode: "BGR" }),
    },
  );

  const cityMatch = (citiesResponse.cities ?? []).find((entry) => normalizeText(entry.name) === normalizeText(city));
  if (!cityMatch) return [];

  const officesResponse = await fetchJson<{ offices?: EcontOffice[] }>(
    `${credentials.apiUrl}/Nomenclatures/NomenclaturesService.getOffices.json`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: getAuth(credentials),
      },
      body: JSON.stringify({ countryCode: "BGR", cityID: cityMatch.id }),
    },
  );

  return (officesResponse.offices ?? []).map((office) => ({
    id: String(office.id),
    provider: "econt",
    label: office.name,
    city: office.address?.city?.name || cityMatch.name,
    address: office.address?.fullAddress || office.name,
    postcode: office.address?.postCode,
    latitude: Number(office.latitude ?? office.gps?.latitude) || undefined,
    longitude: Number(office.longitude ?? office.gps?.longitude) || undefined,
  }));
}
