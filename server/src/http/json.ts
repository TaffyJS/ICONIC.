import type { IncomingMessage, ServerResponse } from "node:http";
import type { AppConfig } from "../config/env.js";

export function readBody(req: IncomingMessage) {
  return new Promise<string>((resolveBody, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
    req.on("end", () => resolveBody(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

export function sendJson(res: ServerResponse, config: AppConfig, status: number, body: unknown) {
  res.statusCode = status;
  res.setHeader("Access-Control-Allow-Origin", config.corsOrigin);
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(body));
}

export function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unknown API error";
}
