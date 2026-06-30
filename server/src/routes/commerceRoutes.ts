import type { IncomingMessage, ServerResponse } from "node:http";
import type { AppConfig } from "../config/env.js";
import type { CommerceController } from "../controllers/commerceController.js";
import { getErrorMessage, readBody, sendJson } from "../http/json.js";

const commercePrefixes = ["/api/catalog", "/api/products", "/api/carts", "/api/orders", "/api/admin/dashboard", "/api/admin/best-sellers"];

export async function handleCommerceRoutes(
  req: IncomingMessage,
  res: ServerResponse,
  config: AppConfig,
  pathname: string,
  commerceController: CommerceController,
) {
  if (!commercePrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))) {
    return false;
  }

  try {
    const body = req.method === "POST" ? (JSON.parse((await readBody(req)) || "{}") as Record<string, unknown>) : {};
    await commerceController.handle(req.method || "GET", pathname, body, res);
  } catch (error) {
    sendJson(res, config, 500, { error: getErrorMessage(error) });
  }

  return true;
}
