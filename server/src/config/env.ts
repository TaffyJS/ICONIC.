import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import type { CourierConfig } from "../types/courier.js";

export type AppConfig = {
  host: string;
  port: number;
  corsOrigin: string;
  projectRoot: string;
  database: {
    provider: "sqlite" | "postgres";
    url: string;
  };
  storage: {
    provider: "local" | "azure-blob";
    publicBaseUrl: string;
    localRoot: string;
    azureConnectionString?: string;
    azureContainer?: string;
  };
  couriers: CourierConfig;
  econtQuoteLiveReady: boolean;
};

export function loadLocalEnv(projectRoot: string) {
  for (const fileName of [".env", ".env.local"]) {
    try {
      const file = readFileSync(resolve(projectRoot, fileName), "utf8");

      for (const line of file.split(/\r?\n/)) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;

        const separatorIndex = trimmed.indexOf("=");
        if (separatorIndex === -1) continue;

        const key = trimmed.slice(0, separatorIndex).trim();
        const value = trimmed.slice(separatorIndex + 1).trim().replace(/^["']|["']$/g, "");
        if (key && process.env[key] === undefined) {
          process.env[key] = value;
        }
      }
    } catch {
      // Optional local env files are allowed to be absent.
    }
  }
}

export function getConfig(projectRoot = process.cwd()): AppConfig {
  loadLocalEnv(projectRoot);

  const econtDemoEnabled = process.env.ECONT_USE_DEMO !== "false";
  const econtUser = econtDemoEnabled ? "iasp-dev" : process.env.ECONT_USERNAME;
  const econtPass = econtDemoEnabled ? "1Asp-dev" : process.env.ECONT_PASSWORD;
  const econtApiUrl = econtDemoEnabled
    ? "https://demo.econt.com/ee/services"
    : process.env.ECONT_API_URL || "https://ee.econt.com/services";

  return {
    host: process.env.API_HOST || "127.0.0.1",
    port: Number(process.env.API_PORT || 8787),
    corsOrigin: process.env.CORS_ORIGIN || "http://127.0.0.1:5173",
    projectRoot,
    database: {
      provider: process.env.DB_PROVIDER === "postgres" ? "postgres" : "sqlite",
      url: process.env.DATABASE_URL || "sqlite:server/db/iconic.sqlite",
    },
    storage: {
      provider: process.env.STORAGE_PROVIDER === "azure-blob" ? "azure-blob" : "local",
      publicBaseUrl: process.env.STORAGE_PUBLIC_BASE_URL || "/assets",
      localRoot: process.env.LOCAL_STORAGE_ROOT || "assets",
      azureConnectionString: process.env.AZURE_STORAGE_CONNECTION_STRING,
      azureContainer: process.env.AZURE_STORAGE_CONTAINER,
    },
    econtQuoteLiveReady: process.env.ECONT_USE_DEMO === "true" || Boolean(process.env.ECONT_USERNAME && process.env.ECONT_PASSWORD),
    couriers: {
      econtDemoEnabled,
      speedy:
        process.env.SPEEDY_USERNAME && process.env.SPEEDY_PASSWORD
          ? {
              apiUrl: process.env.SPEEDY_API_URL || "https://api.speedy.bg/v1",
              userName: process.env.SPEEDY_USERNAME,
              password: process.env.SPEEDY_PASSWORD,
            }
          : undefined,
      econt:
        econtUser && econtPass
          ? {
              apiUrl: econtApiUrl,
              userName: econtUser,
              password: econtPass,
            }
          : undefined,
    },
  };
}
