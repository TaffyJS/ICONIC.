import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import type { AppConfig } from "../config/env.js";
import type { CourierDataStore, CourierOffice, CourierProvider } from "../types/courier.js";
import { titleCase } from "../utils/text.js";

export type CourierRepository = {
  getFallbackCities(provider: CourierProvider): string[];
  buildFallbackOffices(provider: CourierProvider, city: string): CourierOffice[];
};

export function createCourierRepository(config: AppConfig): CourierRepository {
  const data = JSON.parse(readFileSync(resolve(config.projectRoot, "server/db/couriers.json"), "utf8")) as CourierDataStore;

  return {
    getFallbackCities(provider) {
      return data.fallbackCitiesByProvider[provider];
    },
    buildFallbackOffices(provider, city) {
      const normalizedCity = titleCase(city || "Sofia");
      const providerLabel = provider === "speedy" ? "Speedy" : "Econt";
      const center = data.cityCoordinates[normalizedCity] ?? data.cityCoordinates.Sofia;

      return [
        {
          id: `${provider}-${normalizedCity}-center`,
          provider,
          label: `${providerLabel} ${normalizedCity} Center`,
          city: normalizedCity,
          address: `${normalizedCity}, Central Boulevard 12`,
          postcode: "1000",
          latitude: Number((center.latitude + 0.006).toFixed(5)),
          longitude: Number((center.longitude - 0.008).toFixed(5)),
        },
        {
          id: `${provider}-${normalizedCity}-mall`,
          provider,
          label: `${providerLabel} ${normalizedCity} Mall`,
          city: normalizedCity,
          address: `${normalizedCity}, Retail Park 5`,
          postcode: "1000",
          latitude: Number((center.latitude - 0.009).toFixed(5)),
          longitude: Number((center.longitude + 0.011).toFixed(5)),
        },
        {
          id: `${provider}-${normalizedCity}-station`,
          provider,
          label: `${providerLabel} ${normalizedCity} Station`,
          city: normalizedCity,
          address: `${normalizedCity}, Transit Square 1`,
          postcode: "1000",
          latitude: Number((center.latitude + 0.012).toFixed(5)),
          longitude: Number((center.longitude + 0.004).toFixed(5)),
        },
      ];
    },
  };
}
