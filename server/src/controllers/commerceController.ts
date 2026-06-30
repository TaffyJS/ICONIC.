import type { ServerResponse } from "node:http";
import type { AppConfig } from "../config/env.js";
import { sendJson } from "../http/json.js";
import type { CommerceService } from "../services/commerceService.js";
import { parseBestSellerRequest, parseCartItemRequest, parseOrderRequest, parseProductRequest } from "../validation/commerceValidation.js";

export type CommerceController = {
  handle(method: string, pathname: string, body: Record<string, unknown>, res: ServerResponse): Promise<void>;
};

export function createCommerceController(config: AppConfig, commerceService: CommerceService): CommerceController {
  return {
    async handle(method, pathname, body, res) {
      if (method === "GET" && pathname === "/api/catalog") {
        sendJson(res, config, 200, {
          products: commerceService.getCatalog(),
          bestSellers: commerceService.getAdminDashboard().bestSellers,
          reviews: commerceService.getReviews(),
          orders: commerceService.getOrders(),
        });
        return;
      }

      if (method === "GET" && pathname === "/api/products") {
        sendJson(res, config, 200, { products: commerceService.getCatalog() });
        return;
      }

      if (method === "GET" && pathname.startsWith("/api/products/")) {
        const productId = decodeURIComponent(pathname.replace("/api/products/", ""));
        const product = commerceService.getProduct(productId);
        if (!product) {
          sendJson(res, config, 404, { error: "Product not found" });
          return;
        }
        sendJson(res, config, 200, { product });
        return;
      }

      if (method === "GET" && pathname === "/api/admin/dashboard") {
        sendJson(res, config, 200, commerceService.getAdminDashboard());
        return;
      }

      if (method === "POST" && pathname === "/api/products") {
        const request = parseProductRequest(body);
        if (!request.ok) {
          sendJson(res, config, 400, { error: request.error });
          return;
        }
        sendJson(res, config, 201, { product: commerceService.createProduct(request.value) });
        return;
      }

      if (method === "POST" && pathname === "/api/admin/best-sellers") {
        const request = parseBestSellerRequest(body);
        if (!request.ok) {
          sendJson(res, config, 400, { error: request.error });
          return;
        }
        sendJson(res, config, 200, { bestSellers: commerceService.updateBestSellers(request.value) });
        return;
      }

      if (method === "POST" && pathname === "/api/carts") {
        sendJson(res, config, 200, { cart: commerceService.getOrCreateCart(typeof body.cartId === "string" ? body.cartId : undefined) });
        return;
      }

      if (method === "POST" && pathname === "/api/carts/items") {
        const request = parseCartItemRequest(body);
        if (!request.ok) {
          sendJson(res, config, 400, { error: request.error });
          return;
        }
        sendJson(res, config, 200, { cart: commerceService.addCartItem(typeof body.cartId === "string" ? body.cartId : undefined, request.value) });
        return;
      }

      if (method === "POST" && pathname === "/api/carts/items/remove") {
        const request = parseCartItemRequest(body);
        const cartId = String(body.cartId || "").trim();
        if (!cartId) {
          sendJson(res, config, 400, { error: "cartId is required" });
          return;
        }
        if (!request.ok) {
          sendJson(res, config, 400, { error: request.error });
          return;
        }
        sendJson(res, config, 200, { cart: commerceService.removeCartItem(cartId, request.value.productId, request.value.size) });
        return;
      }

      if (method === "POST" && pathname === "/api/orders") {
        const request = parseOrderRequest(body);
        if (!request.ok) {
          sendJson(res, config, 400, { error: request.error });
          return;
        }
        sendJson(res, config, 201, { order: commerceService.createOrder(request.value) });
        return;
      }

      sendJson(res, config, 404, { error: "Not found" });
    },
  };
}
