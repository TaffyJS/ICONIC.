import type { OrderRecord, ProductRecord, ReviewRecord } from "../types/commerce.js";

const sizes = ["XS", "S", "M", "L", "XL"];
const care = ["wash-cold", "line-dry", "iron-low"];

export const seedProducts: ProductRecord[] = [
  {
    id: "riviera-linen-shirt",
    sortOrder: 1,
    colorClass: "tone-cream",
    garmentClass: "garment-shirt",
    price: 185,
    colors: [
      { name: "Blanc", hex: "#f5f0e8" },
      { name: "Coral", hex: "#c94e2a" },
      { name: "Sky", hex: "#a8d4d2" },
    ],
    gallery: [
      "https://images.unsplash.com/photo-1713881842156-3d9ef36418cc?w=900&h=1125&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1578747522731-9e5a179b02f7?w=900&h=1125&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1776633734216-26b0dbcf61d1?w=900&h=1125&fit=crop&auto=format",
    ],
    images: [],
    sizes,
    sizeStock: { XS: 5, S: 8, M: 7, L: 4, XL: 2 },
    stock: 26,
    details: ["limited-run", "hand-finished", "breathable"],
    care,
    translations: {
      bg: {
        name: "Riviera ленена риза",
        category: "Ризи",
        short: "Свободна ленена риза за топли дни.",
        description:
          "Изработена от фин лен с чист силует и лека структура. Материята диша свободно, омеква с носене и носи естествената неравномерност на премиум лена.",
        fit: "Свободна",
        material: "100% белгийски лен",
        badge: "Ново",
      },
      en: {
        name: "Riviera Linen Shirt",
        category: "Shirts",
        short: "A relaxed linen shirt for warm days.",
        description:
          "Woven from fine linen with a clean silhouette and light structure. The fabric breathes freely, softens with wear, and keeps the natural irregularity of premium linen.",
        fit: "Relaxed",
        material: "100% Belgian linen",
        badge: "New",
      },
    },
  },
  {
    id: "cote-dazur-set",
    sortOrder: 2,
    colorClass: "tone-green",
    garmentClass: "garment-trouser",
    price: 340,
    colors: [
      { name: "Cream", hex: "#f2ede4" },
      { name: "Turquoise", hex: "#2ba4a0" },
    ],
    gallery: [
      "https://images.unsplash.com/photo-1578747522731-9e5a179b02f7?w=900&h=1125&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1776633734216-26b0dbcf61d1?w=900&h=1125&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1776633734208-3cdf89a7fbf0?w=900&h=1125&fit=crop&auto=format",
    ],
    images: [],
    sizes: ["XS", "S", "M", "L"],
    sizeStock: { XS: 3, S: 5, M: 5, L: 2 },
    stock: 15,
    details: ["limited-run", "hand-finished", "premium-packaging"],
    care,
    translations: {
      bg: {
        name: "Cote d'Azur комплект",
        category: "Комплекти",
        short: "Лек комплект от две части с летен ритъм.",
        description:
          "Координиран топ и широк панталон от ефирна органична материя. Силуетът се движи леко и работи от дневна разходка до вечерна тераса.",
        fit: "Плавна",
        material: "Органичен памучен воал",
        badge: "Sale",
      },
      en: {
        name: "Cote d'Azur Set",
        category: "Sets",
        short: "A light two-piece set with a summer rhythm.",
        description:
          "A coordinated top and wide trouser in airy organic voile. The silhouette moves lightly and works from daytime walks to evening terraces.",
        fit: "Fluid",
        material: "Organic cotton voile",
        badge: "Sale",
      },
    },
  },
  {
    id: "marina-shorts",
    sortOrder: 3,
    colorClass: "tone-cream",
    garmentClass: "garment-trouser",
    price: 145,
    colors: [
      { name: "Sand", hex: "#d4b896" },
      { name: "Navy", hex: "#1a2b5f" },
      { name: "White", hex: "#fafafa" },
    ],
    gallery: [
      "https://images.unsplash.com/photo-1630540665897-4d2bde82b0a6?w=900&h=1125&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=900&h=1125&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1713881842156-3d9ef36418cc?w=900&h=1125&fit=crop&auto=format",
    ],
    images: [],
    sizes,
    sizeStock: { XS: 4, S: 8, M: 9, L: 6, XL: 2 },
    stock: 29,
    details: ["limited-run", "breathable", "daily-uniform"],
    care,
    translations: {
      bg: {
        name: "Marina къси панталони",
        category: "Панталони",
        short: "Изчистени поплин шорти с премерен силует.",
        description:
          "Къси панталони от памучен поплин със средна талия и фин страничен детайл. Лесни за комбиниране от плаж до градска вечер.",
        fit: "Скроена",
        material: "Памучен поплин",
        badge: "Essential",
      },
      en: {
        name: "Marina Shorts",
        category: "Shorts",
        short: "Clean poplin shorts with a measured silhouette.",
        description:
          "Cotton poplin shorts with a mid-rise fit and subtle side detail. Easy to style from the beach to a city evening.",
        fit: "Tailored",
        material: "Cotton poplin",
        badge: "Essential",
      },
    },
  },
  {
    id: "soleil-dress",
    sortOrder: 4,
    colorClass: "tone-clay",
    garmentClass: "garment-shirt",
    price: 265,
    colors: [
      { name: "Ivory", hex: "#f7f3ec" },
      { name: "Coral", hex: "#c94e2a" },
    ],
    gallery: [
      "https://images.unsplash.com/photo-1776633734216-26b0dbcf61d1?w=900&h=1125&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1776633734208-3cdf89a7fbf0?w=900&h=1125&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1578747522731-9e5a179b02f7?w=900&h=1125&fit=crop&auto=format",
    ],
    images: [],
    sizes: ["XS", "S", "M", "L"],
    sizeStock: { XS: 2, S: 4, M: 3, L: 2 },
    stock: 11,
    details: ["limited-run", "hand-finished", "premium-packaging"],
    care: ["dry-clean", "iron-low"],
    translations: {
      bg: {
        name: "Soleil рокля",
        category: "Рокли",
        short: "Лека рокля, която улавя светлината.",
        description:
          "Плавен силует от вискозна креп материя, който се движи с тялото и изглежда завършен без усилие.",
        fit: "Свободно падаща",
        material: "Вискозен креп",
        badge: "Ново",
      },
      en: {
        name: "Soleil Dress",
        category: "Dresses",
        short: "A light dress that catches the sun.",
        description:
          "A flowing silhouette in viscose crepe that moves with the body and looks considered without effort.",
        fit: "Flowing",
        material: "Viscose crepe",
        badge: "New",
      },
    },
  },
  {
    id: "archipelago-tank",
    sortOrder: 5,
    colorClass: "tone-green",
    garmentClass: "garment-tee",
    price: 95,
    colors: [
      { name: "Blanc", hex: "#f5f0e8" },
      { name: "Terra", hex: "#b05c3a" },
      { name: "Sage", hex: "#8ba888" },
    ],
    gallery: [
      "https://images.unsplash.com/photo-1578747522731-9e5a179b02f7?w=900&h=1125&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1713881842156-3d9ef36418cc?w=900&h=1125&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1630540665897-4d2bde82b0a6?w=900&h=1125&fit=crop&auto=format",
    ],
    images: [],
    sizes,
    sizeStock: { XS: 6, S: 9, M: 7, L: 5, XL: 3 },
    stock: 30,
    details: ["daily-uniform", "breathable", "limited-run"],
    care,
    translations: {
      bg: {
        name: "Archipelago топ",
        category: "Топове",
        short: "Памучен базов топ за самостоятелно носене или слой.",
        description:
          "Изчистен топ от мек пима памук. Работи самостоятелно в горещ ден или като слой под ленена риза.",
        fit: "Прибрана",
        material: "Пима памук",
        badge: "Limited",
      },
      en: {
        name: "Archipelago Tank",
        category: "Tops",
        short: "A cotton base layer for wearing alone or under shirts.",
        description:
          "A clean tank in soft Pima cotton. It works alone on warm days or layered under a linen shirt.",
        fit: "Slim",
        material: "Pima cotton",
        badge: "Limited",
      },
    },
  },
  {
    id: "palma-wide-trousers",
    sortOrder: 6,
    colorClass: "tone-cream",
    garmentClass: "garment-trouser",
    price: 220,
    colors: [
      { name: "Flax", hex: "#d4c4a4" },
      { name: "Blanc", hex: "#f5f0e8" },
    ],
    gallery: [
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=900&h=1125&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1630540665897-4d2bde82b0a6?w=900&h=1125&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1776633734208-3cdf89a7fbf0?w=900&h=1125&fit=crop&auto=format",
    ],
    images: [],
    sizes: ["XS", "S", "M", "L"],
    sizeStock: { XS: 3, S: 6, M: 5, L: 3 },
    stock: 17,
    details: ["limited-run", "daily-uniform", "breathable"],
    care,
    translations: {
      bg: {
        name: "Palma широк панталон",
        category: "Панталони",
        short: "Широк ленен панталон с висока талия.",
        description:
          "Щедро скроен панталон с висока талия и широк крачол. Рафиниран летен базов модел от ленена смес.",
        fit: "Широк крачол",
        material: "Ленена смес",
        badge: "Essential",
      },
      en: {
        name: "Palma Wide Trousers",
        category: "Trousers",
        short: "High-rise wide trousers in a linen blend.",
        description:
          "Generously cut with a high rise and wide leg. A refined summer essential in a breathable linen blend.",
        fit: "Wide leg",
        material: "Linen blend",
        badge: "Essential",
      },
    },
  },
];

export const seedReviews: ReviewRecord[] = [
  {
    id: "review-riviera-1",
    productId: "riviera-linen-shirt",
    customer: "Mira K.",
    rating: 5,
    comment: "Beautiful linen weight and the color selection feels premium.",
    createdAt: "2026-06-18",
  },
  {
    id: "review-palma-1",
    productId: "palma-wide-trousers",
    customer: "Elena S.",
    rating: 5,
    comment: "The trousers drape well and pair with almost everything.",
    createdAt: "2026-06-22",
  },
  {
    id: "review-cote-1",
    productId: "cote-dazur-set",
    customer: "Nikol D.",
    rating: 4,
    comment: "Light, elegant, and very comfortable for summer travel.",
    createdAt: "2026-06-25",
  },
];

export const seedOrders: OrderRecord[] = [
  {
    id: "ORD-SEED-1001",
    customer: "Mira K.",
    city: "Sofia",
    createdAt: "2026-06-24",
    channel: "address",
    payment: "card",
    status: "completed",
    total: 405,
    items: [
      { productId: "riviera-linen-shirt", quantity: 1 },
      { productId: "palma-wide-trousers", quantity: 1 },
    ],
  },
  {
    id: "ORD-SEED-1002",
    customer: "Nikol D.",
    city: "Plovdiv",
    createdAt: "2026-06-27",
    channel: "office",
    payment: "cash",
    status: "traveling",
    total: 340,
    items: [{ productId: "cote-dazur-set", quantity: 1 }],
  },
];
