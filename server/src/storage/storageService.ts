import type { AppConfig } from "../config/env.js";

export type ImageReferenceInput = {
  productId: string;
  url: string;
  alt?: string;
  sortOrder: number;
  metadata?: Record<string, unknown>;
};

export type ImageReference = {
  storageProvider: "remote" | "local" | "azure-blob";
  storageKey: string;
  url: string;
  alt: string;
  sortOrder: number;
  metadata: Record<string, unknown>;
};

export type StorageService = {
  createImageReference(input: ImageReferenceInput): ImageReference;
};

export function createStorageService(config: AppConfig): StorageService {
  return {
    createImageReference(input) {
      if (/^https?:\/\//.test(input.url)) {
        return {
          storageProvider: "remote",
          storageKey: input.url,
          url: input.url,
          alt: input.alt || "",
          sortOrder: input.sortOrder,
          metadata: input.metadata ?? {},
        };
      }

      const normalizedKey = input.url.replace(/^\/+/, "");
      return {
        storageProvider: config.storage.provider,
        storageKey: normalizedKey,
        url: `${config.storage.publicBaseUrl}/${normalizedKey}`.replace(/([^:]\/)\/+/g, "$1"),
        alt: input.alt || "",
        sortOrder: input.sortOrder,
        metadata: input.metadata ?? {},
      };
    },
  };
}
