import assert from "node:assert/strict";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { createCommerceRepository } from "../../server-dist/repositories/commerceRepository.js";
import { bootstrapDatabase } from "../../server-dist/db/bootstrap.js";
import { createSqliteClient } from "../../server-dist/db/sqliteClient.js";

function createTestRepository() {
  const dir = mkdtempSync(join(tmpdir(), "iconic-db-test-"));
  const db = createSqliteClient(`sqlite:${join(dir, "test.sqlite")}`);
  bootstrapDatabase(db);
  return createCommerceRepository(db);
}

function createTestProduct(repository) {
  return repository.createProduct({
    name: "Linen Camp Shirt",
    category: "Light shirt",
    price: 72,
    color: "Natural cream",
    fit: "Relaxed fit",
    material: "Linen blend",
    description: "A saved product from the admin workflow.",
    short: "A saved product from the admin workflow.",
    badge: "New arrival",
    sizes: ["S", "M"],
    sizeStock: { S: 2, M: 4 },
    details: ["Limited run"],
    care: ["Wash at 30 degrees"],
    imageUrls: ["https://example.com/linen-camp-shirt.jpg"],
  });
}

test("database bootstrap seeds the premium summer catalog", () => {
  const repository = createTestRepository();
  const products = repository.listProducts();

  assert.equal(products.length, 6);
  assert.ok(products.some((product) => product.id === "riviera-linen-shirt"));
  assert.ok(products.every((product) => product.colors.length > 0));
});

test("created products include variants, inventory, and image references", () => {
  const repository = createTestRepository();
  const initialCount = repository.listProducts().length;
  createTestProduct(repository);
  const products = repository.listProducts();
  const product = products.find((entry) => entry.id === "linen-camp-shirt");

  assert.equal(products.length, initialCount + 1);
  assert.equal(product?.images.length, 1);
  assert.ok(product && product.sizes.length > 0);
  assert.ok(product && product.stock > 0);
  assert.deepEqual(product?.colors, [{ name: "Natural cream", hex: "#f2ede4" }]);
});

test("cart items are stored transactionally against product variants", () => {
  const repository = createTestRepository();
  const product = createTestProduct(repository);
  const cart = repository.upsertCartItem("cart-test", {
    productId: product.id,
    size: "M",
    quantity: 2,
  });

  assert.equal(cart.id, "cart-test");
  assert.equal(cart.items.length, 1);
  assert.equal(cart.items[0].quantity, 2);
  assert.equal(cart.items[0].size, "M");
});

test("orders persist related order items", () => {
  const repository = createTestRepository();
  const product = createTestProduct(repository);
  const order = repository.createOrder({
    customer: "Test Customer",
    city: "Sofia",
    channel: "address",
    payment: "card",
    total: 69,
    items: [{ productId: product.id, size: "M", quantity: 1 }],
  });

  const stored = repository.listOrders().find((entry) => entry.id === order.id);

  assert.ok(stored);
  assert.equal(stored?.items.length, 1);
  assert.equal(stored?.items[0].productId, product.id);
});

test("best sellers require at least two selected products", () => {
  const repository = createTestRepository();
  const first = createTestProduct(repository);
  const second = repository.createProduct({
    name: "Wide Linen Trouser",
    category: "Trouser",
    price: 88,
    color: "Moss green",
    fit: "Straight fit",
    material: "Linen blend",
    description: "A second saved product.",
    short: "A second saved product.",
    badge: "New arrival",
    sizes: ["S", "M"],
    sizeStock: { S: 2, M: 2 },
    details: ["Limited run"],
    care: ["Wash at 30 degrees"],
    imageUrls: ["https://example.com/wide-linen-trouser.jpg"],
  });

  repository.updateBestSellerSection({ title: "Weekend picks", productIds: [first.id] });
  assert.equal(repository.getBestSellerSection().products.length, 0);

  repository.updateBestSellerSection({ title: "Weekend picks", productIds: [first.id, second.id] });
  const section = repository.getBestSellerSection();
  assert.equal(section.title, "Weekend picks");
  assert.deepEqual(section.productIds, [first.id, second.id]);
  assert.equal(section.products.length, 2);
});
