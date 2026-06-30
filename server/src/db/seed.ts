import type { DbClient } from "./types.js";
import { seedOrders, seedProducts, seedReviews } from "./seedData.js";
import { createCommerceRepository } from "../repositories/commerceRepository.js";

export function seedDatabase(db: DbClient) {
  const commerceRepository = createCommerceRepository(db);
  if (commerceRepository.hasProducts()) return;

  db.transaction(() => {
    for (const product of seedProducts) {
      commerceRepository.upsertProduct(product);
    }
    for (const review of seedReviews) {
      commerceRepository.upsertReview(review);
    }
    for (const order of seedOrders) {
      commerceRepository.upsertOrder(order);
    }
  });
}
