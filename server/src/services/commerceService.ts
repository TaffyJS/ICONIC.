import type { CommerceRepository, CreateCartItemInput, CreateOrderInput } from "../repositories/commerceRepository.js";
import type { CreateProductInput } from "../types/commerce.js";

export type CommerceService = {
  getCatalog(): ReturnType<CommerceRepository["listProducts"]>;
  getProduct(productId: string): ReturnType<CommerceRepository["getProduct"]>;
  getReviews(): ReturnType<CommerceRepository["listReviews"]>;
  getOrders(): ReturnType<CommerceRepository["listOrders"]>;
  createProduct(input: CreateProductInput): ReturnType<CommerceRepository["createProduct"]>;
  getOrCreateCart(cartId?: string): ReturnType<CommerceRepository["getOrCreateCart"]>;
  addCartItem(cartId: string | undefined, input: CreateCartItemInput): ReturnType<CommerceRepository["upsertCartItem"]>;
  removeCartItem(cartId: string, productId: string, size: string): ReturnType<CommerceRepository["removeCartItem"]>;
  createOrder(input: CreateOrderInput): ReturnType<CommerceRepository["createOrder"]>;
  getAdminDashboard(): {
    stock: ReturnType<CommerceRepository["getAdminStock"]>;
    orders: ReturnType<CommerceRepository["getAdminOrders"]>;
    reviews: ReturnType<CommerceRepository["getAdminReviews"]>;
    products: ReturnType<CommerceRepository["listProducts"]>;
    bestSellers: ReturnType<CommerceRepository["getBestSellerSection"]>;
  };
  updateBestSellers(input: { title: string; productIds: string[] }): ReturnType<CommerceRepository["updateBestSellerSection"]>;
};

export function createCommerceService(repository: CommerceRepository): CommerceService {
  return {
    getCatalog() {
      return repository.listProducts();
    },
    getProduct(productId) {
      return repository.getProduct(productId);
    },
    getReviews() {
      return repository.listReviews();
    },
    getOrders() {
      return repository.listOrders();
    },
    createProduct(input) {
      return repository.createProduct(input);
    },
    getOrCreateCart(cartId) {
      return repository.getOrCreateCart(cartId);
    },
    addCartItem(cartId, input) {
      const cart = repository.getOrCreateCart(cartId);
      return repository.upsertCartItem(cart.id, input);
    },
    removeCartItem(cartId, productId, size) {
      return repository.removeCartItem(cartId, productId, size);
    },
    createOrder(input) {
      return repository.createOrder(input);
    },
    getAdminDashboard() {
      return {
        stock: repository.getAdminStock(),
        orders: repository.getAdminOrders(),
        reviews: repository.getAdminReviews(),
        products: repository.listProducts(),
        bestSellers: repository.getBestSellerSection(),
      };
    },
    updateBestSellers(input) {
      return repository.updateBestSellerSection(input);
    },
  };
}
