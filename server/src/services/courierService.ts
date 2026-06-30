import type { AppConfig } from "../config/env.js";
import { getEcontCities, getEcontOffices } from "../api/econtClient.js";
import { getSpeedyCities, getSpeedyOffices } from "../api/speedyClient.js";
import type { CourierRepository } from "../repositories/courierRepository.js";
import type { CourierCitiesResult, CourierOffice, CourierOfficesResult, CourierProvider, CourierQuote, CourierQuoteInput } from "../types/courier.js";
import { uniqueSorted } from "../utils/text.js";

export type CourierService = {
  getCities(provider: CourierProvider): Promise<CourierCitiesResult>;
  getOffices(provider: CourierProvider, city: string): Promise<CourierOfficesResult>;
  getQuote(input: CourierQuoteInput): { quote: CourierQuote };
};

export function createCourierService(config: AppConfig, repository: CourierRepository): CourierService {
  return {
    async getCities(provider) {
      let cities: string[] = [];

      try {
        if (provider === "speedy" && config.couriers.speedy) {
          cities = await getSpeedyCities(config.couriers.speedy);
        } else if (provider === "econt" && config.couriers.econt) {
          cities = await getEcontCities(config.couriers.econt);
        }
      } catch {
        cities = [];
      }

      const usesFallbackCities = cities.length === 0;
      return {
        cities: uniqueSorted(usesFallbackCities ? repository.getFallbackCities(provider) : cities),
        source: usesFallbackCities ? "fallback" : "live",
      };
    },

    async getOffices(provider, city) {
      let offices: CourierOffice[] = [];

      try {
        if (provider === "speedy" && config.couriers.speedy) {
          offices = await getSpeedyOffices(config.couriers.speedy, city);
        } else if (provider === "econt" && config.couriers.econt) {
          offices = await getEcontOffices(config.couriers.econt, city);
        }
      } catch {
        offices = [];
      }

      const usesFallbackOffices = offices.length === 0;
      return {
        offices: usesFallbackOffices ? repository.buildFallbackOffices(provider, city) : offices,
        source: usesFallbackOffices ? "fallback" : "live",
      };
    },

    getQuote(input) {
      const liveReady =
        (input.provider === "speedy" && Boolean(config.couriers.speedy)) ||
        (input.provider === "econt" && config.econtQuoteLiveReady);

      return {
        quote: {
          provider: input.provider,
          deliveryMethod: input.deliveryMethod,
          amount: estimateAmount(input.provider, input.deliveryMethod, input.itemCount, input.subtotal),
          currency: "EUR",
          estimate: !liveReady,
          sourceLabel: !liveReady ? "Estimated profile" : "Courier API profile",
        },
      };
    },
  };
}

function estimateAmount(provider: CourierProvider, deliveryMethod: CourierQuoteInput["deliveryMethod"], itemCount: number, subtotal: number) {
  const base = provider === "speedy" ? (deliveryMethod === "office" ? 3.4 : 4.6) : deliveryMethod === "office" ? 3.1 : 4.2;
  const parcelWeightFactor = Math.min(itemCount, 4) * 0.35;
  const orderValueFactor = subtotal >= 180 ? 0.5 : 0;
  return Number((base + parcelWeightFactor + orderValueFactor).toFixed(2));
}
