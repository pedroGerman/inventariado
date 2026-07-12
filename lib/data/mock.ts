import type {
  AccountProfile,
  Business,
  Category,
  Customer,
  Debt,
  Order,
  Payment,
  Product,
  Purchase,
  Supplier,
} from "@/lib/types/database";
import {
  mockAccountProfile,
  mockBusiness,
  mockCategories,
  mockCustomers,
  mockDebts,
  mockOrders,
  mockPurchases,
  mockProducts,
  mockSuppliers,
} from "@/lib/mock/seed";

const STORAGE_KEY = "pos-mock-db";

export interface DataCache {
  products: Product[];
  categories: Category[];
  customers: Customer[];
  suppliers: Supplier[];
  orders: Order[];
  purchases: Purchase[];
  debts: Debt[];
  payments: Payment[];
  business: Business;
  account: AccountProfile;
}

function emptyCache(): DataCache {
  return {
    products: [],
    categories: [],
    customers: [],
    suppliers: [],
    orders: [],
    purchases: [],
    debts: [],
    payments: [],
    business: {
      id: "",
      name: "",
      owner_id: "",
      logo_url: null,
      plan: "free",
      tax_rate: 0.18,
      currency: "DOP",
      created_at: new Date(0).toISOString(),
    },
    account: {
      user_id: "",
      full_name: "",
      email: "",
      username: "",
      phone: null,
      avatar_url: null,
    },
  };
}

function seedCache(): DataCache {
  return {
    products: [...mockProducts],
    categories: [...mockCategories],
    customers: [...mockCustomers],
    suppliers: [...mockSuppliers],
    orders: [...mockOrders],
    purchases: [...mockPurchases],
    debts: [...mockDebts],
    payments: [],
    business: { ...mockBusiness },
    account: { ...mockAccountProfile },
  };
}

function normalizeSeedCache(raw: Partial<DataCache> | null): DataCache {
  const defaults = seedCache();
  if (!raw) return defaults;
  return {
    ...defaults,
    ...raw,
    products: (raw.products ?? defaults.products).map((product) => ({
      ...product,
      min_stock:
        Number.isFinite(product.min_stock) && product.min_stock >= 0
          ? product.min_stock
          : 5,
    })),
    business: raw.business ?? defaults.business,
    account: raw.account ?? defaults.account,
  };
}

let memoryCache: DataCache | null = null;

export function loadMockCache(): DataCache {
  if (typeof window === "undefined") return seedCache();

  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    const cache = seedCache();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
    return cache;
  }
  return normalizeSeedCache(JSON.parse(raw) as Partial<DataCache>);
}

export function saveMockCache(cache: DataCache): void {
  if (typeof window === "undefined") return;
  memoryCache = cache;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
}

export function getMockMemoryCache(): DataCache {
  if (!memoryCache) memoryCache = loadMockCache();
  return memoryCache;
}

export function setMockMemoryCache(cache: DataCache): void {
  memoryCache = cache;
}

export { emptyCache, seedCache };
