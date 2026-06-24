import react from "@vitejs/plugin-react";
import type { IncomingMessage, ServerResponse } from "node:http";
import { defineConfig, loadEnv, type Plugin } from "vite";

type CourierProvider = "speedy" | "econt";

type CourierOffice = {
  id: string;
  provider: CourierProvider;
  label: string;
  city: string;
  address: string;
  postcode?: string;
  latitude?: number;
  longitude?: number;
};

const fallbackCitiesByProvider: Record<CourierProvider, string[]> = {
  speedy: [
    "Sofia",
    "Plovdiv",
    "Varna",
    "Burgas",
    "Ruse",
    "Stara Zagora",
    "Pleven",
    "Blagoevgrad",
    "Veliko Tarnovo",
    "Dobrich",
    "Haskovo",
    "Shumen",
    "Sliven",
    "Pazardzhik",
    "Yambol",
    "Pernik",
    "Gabrovo",
    "Vratsa",
    "Kazanlak",
    "Asenovgrad",
  ],
  econt: ["Sofia", "Plovdiv", "Varna", "Burgas", "Ruse", "Veliko Tarnovo", "Dobrich", "Haskovo"],
};

const cityCoordinates: Record<string, { latitude: number; longitude: number }> = {
  "Blagoevgrad": { latitude: 42.0209, longitude: 23.0943 },
  "Burgas": { latitude: 42.5048, longitude: 27.4626 },
  "Dobrich": { latitude: 43.5726, longitude: 27.8273 },
  "Haskovo": { latitude: 41.9344, longitude: 25.5556 },
  "Pleven": { latitude: 43.417, longitude: 24.6067 },
  "Plovdiv": { latitude: 42.1354, longitude: 24.7453 },
  "Ruse": { latitude: 43.8356, longitude: 25.9657 },
  "Sofia": { latitude: 42.6977, longitude: 23.3219 },
  "Stara Zagora": { latitude: 42.4258, longitude: 25.6345 },
  "Varna": { latitude: 43.2141, longitude: 27.9147 },
  "Veliko Tarnovo": { latitude: 43.0757, longitude: 25.6172 },
};

function readBody(req: IncomingMessage) {
  return new Promise<string>((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

function sendJson(res: ServerResponse, status: number, body: unknown) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(body));
}

function normalizeText(value: string) {
  return value.trim().toLowerCase();
}

function titleCase(value: string) {
  return value
    .trim()
    .split(/\s+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

function uniqueSorted(values: string[]) {
  return Array.from(new Set(values.map((value) => titleCase(value)).filter(Boolean))).sort((a, b) => a.localeCompare(b));
}

function buildFallbackOffices(provider: CourierProvider, city: string): CourierOffice[] {
  const normalizedCity = titleCase(city || "Sofia");
  const providerLabel = provider === "speedy" ? "Speedy" : "Econt";
  const center = cityCoordinates[normalizedCity] ?? cityCoordinates.Sofia;

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
}

function estimateAmount(provider: CourierProvider, deliveryMethod: "address" | "office", itemCount: number, subtotal: number) {
  const base = provider === "speedy" ? (deliveryMethod === "office" ? 3.4 : 4.6) : deliveryMethod === "office" ? 3.1 : 4.2;
  const parcelWeightFactor = Math.min(itemCount, 4) * 0.35;
  const orderValueFactor = subtotal >= 180 ? 0.5 : 0;
  return Number((base + parcelWeightFactor + orderValueFactor).toFixed(2));
}

async function fetchJson(url: string, init: RequestInit) {
  const response = await fetch(url, init);
  if (!response.ok) {
    throw new Error(`Upstream request failed: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

async function getSpeedyCities({
  apiUrl,
  userName,
  password,
}: {
  apiUrl: string;
  userName: string;
  password: string;
}) {
  const officeResponse = (await fetchJson(`${apiUrl}/location/office`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userName,
      password,
      language: "EN",
      countryId: 100,
      limit: 5000,
    }),
  })) as { offices?: Array<{ address?: { siteName?: string } }> };

  const officeCities = uniqueSorted((officeResponse.offices ?? []).map((office) => office.address?.siteName ?? ""));
  if (officeCities.length > 0) return officeCities;

  const siteResponse = (await fetchJson(`${apiUrl}/location/site`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userName,
      password,
      language: "EN",
      countryId: 100,
      limit: 5000,
    }),
  })) as { sites?: Array<{ name?: string }> };

  return uniqueSorted((siteResponse.sites ?? []).map((site) => site.name ?? ""));
}

async function getSpeedyOffices({
  apiUrl,
  userName,
  password,
  city,
}: {
  apiUrl: string;
  userName: string;
  password: string;
  city: string;
}) {
  const siteResponse = (await fetchJson(`${apiUrl}/location/site`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userName,
      password,
      language: "EN",
      name: city,
      countryId: 100,
      limit: 20,
    }),
  })) as { sites?: Array<{ id: number; name?: string }> };

  const sites = siteResponse.sites ?? [];
  const siteId = (sites.find((site) => normalizeText(site.name ?? "") === normalizeText(city)) ?? sites[0])?.id;
  if (!siteId) return [];

  const officeResponse = (await fetchJson(`${apiUrl}/location/office`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userName,
      password,
      language: "EN",
      siteId,
      limit: 500,
    }),
  })) as {
    offices?: Array<{
      id: number;
      name?: string;
      address?: { fullAddressString?: string; siteName?: string; postCode?: string };
    }>;
  };

  return (officeResponse.offices ?? []).map((office) => ({
    id: String(office.id),
    provider: "speedy" as const,
    label: office.name || `Speedy ${office.id}`,
    city: office.address?.siteName || city,
    address: office.address?.fullAddressString || office.name || city,
    postcode: office.address?.postCode,
    latitude: Number((office as { latitude?: number; y?: number }).latitude ?? (office as { y?: number }).y) || undefined,
    longitude: Number((office as { longitude?: number; x?: number }).longitude ?? (office as { x?: number }).x) || undefined,
  }));
}

async function getEcontCities({
  apiUrl,
  userName,
  password,
}: {
  apiUrl: string;
  userName: string;
  password: string;
}) {
  const auth = `Basic ${Buffer.from(`${userName}:${password}`).toString("base64")}`;
  const officesResponse = (await fetchJson(`${apiUrl}/Nomenclatures/NomenclaturesService.getOffices.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: auth,
    },
    body: JSON.stringify({ countryCode: "BGR" }),
  })) as { offices?: Array<{ address?: { city?: { name?: string } } }> };

  return uniqueSorted((officesResponse.offices ?? []).map((office) => office.address?.city?.name ?? ""));
}

async function getEcontOffices({
  apiUrl,
  userName,
  password,
  city,
}: {
  apiUrl: string;
  userName: string;
  password: string;
  city: string;
}) {
  const auth = `Basic ${Buffer.from(`${userName}:${password}`).toString("base64")}`;
  const citiesResponse = (await fetchJson(`${apiUrl}/Nomenclatures/NomenclaturesService.getCities.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: auth,
    },
    body: JSON.stringify({ countryCode: "BGR" }),
  })) as { cities?: Array<{ id: number; name: string }> };

  const cityMatch = (citiesResponse.cities ?? []).find((entry) => normalizeText(entry.name) === normalizeText(city));
  if (!cityMatch) return [];

  const officesResponse = (await fetchJson(`${apiUrl}/Nomenclatures/NomenclaturesService.getOffices.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: auth,
    },
    body: JSON.stringify({ countryCode: "BGR", cityID: cityMatch.id }),
  })) as {
    offices?: Array<{
      id: number;
      name: string;
      address?: { fullAddress?: string; city?: { name?: string }; postCode?: string };
    }>;
  };

  return (officesResponse.offices ?? []).map((office) => ({
    id: String(office.id),
    provider: "econt" as const,
    label: office.name,
    city: office.address?.city?.name || cityMatch.name,
    address: office.address?.fullAddress || office.name,
    postcode: office.address?.postCode,
    latitude:
      Number((office as { latitude?: number; gps?: { latitude?: number } }).latitude ?? (office as { gps?: { latitude?: number } }).gps?.latitude) ||
      undefined,
    longitude:
      Number((office as { longitude?: number; gps?: { longitude?: number } }).longitude ?? (office as { gps?: { longitude?: number } }).gps?.longitude) ||
      undefined,
  }));
}

function courierApiPlugin(env: Record<string, string>): Plugin {
  return {
    name: "iconic-courier-api",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith("/api/couriers/")) {
          next();
          return;
        }

        if (req.method !== "POST") {
          sendJson(res, 405, { error: "Method not allowed" });
          return;
        }

        try {
          const body = JSON.parse((await readBody(req)) || "{}") as Record<string, unknown>;

          if (req.url === "/api/couriers/cities") {
            const provider = String(body.provider || "") as CourierProvider;

            if (provider !== "speedy" && provider !== "econt") {
              sendJson(res, 400, { error: "provider is required" });
              return;
            }

            let cities: string[] = [];

            try {
              if (provider === "speedy" && env.SPEEDY_USERNAME && env.SPEEDY_PASSWORD) {
                cities = await getSpeedyCities({
                  apiUrl: env.SPEEDY_API_URL || "https://api.speedy.bg/v1",
                  userName: env.SPEEDY_USERNAME,
                  password: env.SPEEDY_PASSWORD,
                });
              } else if (provider === "econt") {
                const econtDemoEnabled = env.ECONT_USE_DEMO !== "false";
                const econtApiUrl = econtDemoEnabled
                  ? "https://demo.econt.com/ee/services"
                  : env.ECONT_API_URL || "https://ee.econt.com/services";
                const econtUser = econtDemoEnabled ? "iasp-dev" : env.ECONT_USERNAME;
                const econtPass = econtDemoEnabled ? "1Asp-dev" : env.ECONT_PASSWORD;

                if (econtUser && econtPass) {
                  cities = await getEcontCities({
                    apiUrl: econtApiUrl,
                    userName: econtUser,
                    password: econtPass,
                  });
                }
              }
            } catch {
              cities = [];
            }

            const usesFallbackCities = cities.length === 0;
            if (cities.length === 0) {
              cities = fallbackCitiesByProvider[provider];
            }

            sendJson(res, 200, { cities: uniqueSorted(cities), source: usesFallbackCities ? "fallback" : "live" });
            return;
          }

          if (req.url === "/api/couriers/offices") {
            const provider = String(body.provider || "") as CourierProvider;
            const city = String(body.city || "").trim();

            if ((provider !== "speedy" && provider !== "econt") || !city) {
              sendJson(res, 400, { error: "provider and city are required" });
              return;
            }

            let offices: CourierOffice[] = [];

            try {
              if (provider === "speedy" && env.SPEEDY_USERNAME && env.SPEEDY_PASSWORD) {
                offices = await getSpeedyOffices({
                  apiUrl: env.SPEEDY_API_URL || "https://api.speedy.bg/v1",
                  userName: env.SPEEDY_USERNAME,
                  password: env.SPEEDY_PASSWORD,
                  city,
                });
              } else if (provider === "econt") {
                const econtDemoEnabled = env.ECONT_USE_DEMO !== "false";
                const econtApiUrl = econtDemoEnabled
                  ? "https://demo.econt.com/ee/services"
                  : env.ECONT_API_URL || "https://ee.econt.com/services";
                const econtUser = econtDemoEnabled ? "iasp-dev" : env.ECONT_USERNAME;
                const econtPass = econtDemoEnabled ? "1Asp-dev" : env.ECONT_PASSWORD;

                if (econtUser && econtPass) {
                  offices = await getEcontOffices({
                    apiUrl: econtApiUrl,
                    userName: econtUser,
                    password: econtPass,
                    city,
                  });
                }
              }
            } catch {
              offices = [];
            }

            const usesFallbackOffices = offices.length === 0;
            if (offices.length === 0) {
              offices = buildFallbackOffices(provider, city);
            }

            sendJson(res, 200, { offices, source: usesFallbackOffices ? "fallback" : "live" });
            return;
          }

          if (req.url === "/api/couriers/quote") {
            const provider = String(body.provider || "speedy") as CourierProvider;
            const deliveryMethod = String(body.deliveryMethod || "address") as "address" | "office";
            const itemCount = Number(body.itemCount || 1);
            const subtotal = Number(body.subtotal || 0);

            const amount = estimateAmount(provider, deliveryMethod, itemCount, subtotal);
            const liveReady =
              (provider === "speedy" && Boolean(env.SPEEDY_USERNAME && env.SPEEDY_PASSWORD)) ||
              (provider === "econt" && Boolean((env.ECONT_USE_DEMO === "true") || (env.ECONT_USERNAME && env.ECONT_PASSWORD)));

            sendJson(res, 200, {
              quote: {
                provider,
                deliveryMethod,
                amount,
                currency: "EUR",
                estimate: !liveReady,
                sourceLabel: !liveReady ? "Estimated profile" : "Courier API profile",
              },
            });
            return;
          }

          sendJson(res, 404, { error: "Not found" });
        } catch (error) {
          const message = error instanceof Error ? error.message : "Unknown courier error";
          sendJson(res, 500, { error: message });
        }
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react(), courierApiPlugin(env)],
  };
});
