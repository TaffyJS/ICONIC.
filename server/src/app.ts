import { createServer } from "node:http";
import type { AppConfig } from "./config/env.js";
import type { DbClient } from "./db/types.js";
import { createCommerceController } from "./controllers/commerceController.js";
import { createCourierController } from "./controllers/courierController.js";
import { sendJson } from "./http/json.js";
import { createCommerceRepository } from "./repositories/commerceRepository.js";
import { createCourierRepository } from "./repositories/courierRepository.js";
import { handleCommerceRoutes } from "./routes/commerceRoutes.js";
import { handleCourierRoutes } from "./routes/courierRoutes.js";
import { createCommerceService } from "./services/commerceService.js";
import { createCourierService } from "./services/courierService.js";

export function createApp(config: AppConfig, db: DbClient) {
  const commerceRepository = createCommerceRepository(db);
  const commerceService = createCommerceService(commerceRepository);
  const commerceController = createCommerceController(config, commerceService);
  const courierRepository = createCourierRepository(config);
  const courierService = createCourierService(config, courierRepository);
  const courierController = createCourierController(config, courierService);

  return createServer(async (req, res) => {
    const url = new URL(req.url || "/", `http://${req.headers.host || `${config.host}:${config.port}`}`);

    if (req.method === "OPTIONS") {
      sendJson(res, config, 204, {});
      return;
    }

    if (req.method === "GET" && url.pathname === "/health") {
      sendJson(res, config, 200, { ok: true });
      return;
    }

    const handled = await handleCourierRoutes(req, res, config, url.pathname, courierController);
    if (handled) return;

    const commerceHandled = await handleCommerceRoutes(req, res, config, url.pathname, commerceController);
    if (!commerceHandled) {
      sendJson(res, config, 404, { error: "Not found" });
    }
  });
}
