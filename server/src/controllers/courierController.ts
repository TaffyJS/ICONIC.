import type { ServerResponse } from "node:http";
import type { AppConfig } from "../config/env.js";
import { sendJson } from "../http/json.js";
import type { CourierService } from "../services/courierService.js";
import { parseCitiesRequest, parseOfficesRequest, parseQuoteRequest } from "../validation/courierValidation.js";

export type CourierController = {
  handle(pathname: string, body: Record<string, unknown>, res: ServerResponse): Promise<void>;
};

export function createCourierController(config: AppConfig, courierService: CourierService): CourierController {
  return {
    async handle(pathname, body, res) {
      if (pathname === "/api/couriers/cities") {
        const request = parseCitiesRequest(body);
        if (!request.ok) {
          sendJson(res, config, 400, { error: request.error });
          return;
        }

        sendJson(res, config, 200, await courierService.getCities(request.value.provider));
        return;
      }

      if (pathname === "/api/couriers/offices") {
        const request = parseOfficesRequest(body);
        if (!request.ok) {
          sendJson(res, config, 400, { error: request.error });
          return;
        }

        sendJson(res, config, 200, await courierService.getOffices(request.value.provider, request.value.city));
        return;
      }

      if (pathname === "/api/couriers/quote") {
        const request = parseQuoteRequest(body);
        if (!request.ok) {
          sendJson(res, config, 400, { error: request.error });
          return;
        }

        sendJson(res, config, 200, courierService.getQuote(request.value));
        return;
      }

      sendJson(res, config, 404, { error: "Not found" });
    },
  };
}
