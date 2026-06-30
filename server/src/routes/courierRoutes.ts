import type { IncomingMessage, ServerResponse } from "node:http";
import type { AppConfig } from "../config/env.js";
import type { CourierController } from "../controllers/courierController.js";
import { getErrorMessage, readBody, sendJson } from "../http/json.js";

export async function handleCourierRoutes(
  req: IncomingMessage,
  res: ServerResponse,
  config: AppConfig,
  pathname: string,
  courierController: CourierController,
) {
  if (!pathname.startsWith("/api/couriers/")) {
    return false;
  }

  if (req.method !== "POST") {
    sendJson(res, config, 405, { error: "Method not allowed" });
    return true;
  }

  try {
    const body = JSON.parse((await readBody(req)) || "{}") as Record<string, unknown>;
    await courierController.handle(pathname, body, res);
  } catch (error) {
    sendJson(res, config, 500, { error: getErrorMessage(error) });
  }

  return true;
}
