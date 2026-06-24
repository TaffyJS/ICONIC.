import type { ContentSlug, Route } from "../types/app";

export const contentSlugs: ContentSlug[] = [
  "new-arrivals",
  "gift-cards",
  "shipping",
  "returns-exchanges",
  "size-guide",
  "contact",
  "the-fabric",
  "g-town-studio",
  "journal",
  "sustainability",
];

export function getRoute(): Route {
  const hash = window.location.hash.replace(/^#/, "");
  if (hash.startsWith("/product/")) {
    return { name: "product", productId: decodeURIComponent(hash.replace("/product/", "")) };
  }
  if (hash === "/checkout") {
    return { name: "checkout" };
  }
  if (hash === "/admin") {
    return { name: "admin" };
  }
  if (hash === "/admin/add-item") {
    return { name: "adminAddItem" };
  }
  if (hash.startsWith("/")) {
    const slug = hash.slice(1);
    if (contentSlugs.includes(slug as ContentSlug)) {
      return { name: "content", slug: slug as ContentSlug };
    }
  }
  return { name: "home" };
}
