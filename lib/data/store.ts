import { isMockMode } from "@/lib/config";
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
import type { DataCache } from "@/lib/data/mock";
import {
  emptyCache,
  getMockMemoryCache,
  loadMockCache,
  saveMockCache,
  setMockMemoryCache,
} from "@/lib/data/mock";
import {
  fetchRemoteCache,
  remoteAdjustStock,
  remoteDeleteCategory,
  remoteDeleteProduct,
  remoteNextOrderNumber,
  remoteNextPurchaseNumber,
  remoteSaveDebt,
  remoteSaveOrder,
  remoteSavePayment,
  remoteSavePurchase,
  remoteUpsertCategory,
  remoteUpsertCustomer,
  remoteUpsertProduct,
  remoteUpsertSupplier,
} from "@/lib/data/remote";

let cache: DataCache = emptyCache();
let hydrated = false;
let hydratePromise: Promise<void> | null = null;

function notifyUpdate(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("pos-db-updated"));
  }
}

function persistMock(): void {
  saveMockCache(cache);
  notifyUpdate();
}

function getCache(): DataCache {
  if (isMockMode()) {
    cache = getMockMemoryCache();
  }
  return cache;
}

export function isDataHydrated(): boolean {
  return isMockMode() ? true : hydrated;
}

export async function hydrateDataStore(): Promise<void> {
  if (isMockMode()) {
    cache = loadMockCache();
    setMockMemoryCache(cache);
    hydrated = true;
    notifyUpdate();
    return;
  }

  if (hydrated) return;
  if (hydratePromise) return hydratePromise;

  hydratePromise = fetchRemoteCache()
    .then((remote) => {
      cache = remote;
      hydrated = true;
      notifyUpdate();
    })
    .catch((err) => {
      console.error("[hydrateDataStore]", err);
      hydratePromise = null;
      throw err;
    });

  return hydratePromise;
}

export async function refreshDataStore(): Promise<void> {
  if (isMockMode()) {
    cache = loadMockCache();
    setMockMemoryCache(cache);
    notifyUpdate();
    return;
  }

  cache = await fetchRemoteCache();
  hydrated = true;
  notifyUpdate();
}

export function loadDB(): DataCache {
  return getCache();
}

export function saveDB(next: DataCache): void {
  if (!isMockMode()) return;
  cache = next;
  persistMock();
}

export function getActiveBusinessId(): string {
  return getCache().business.id;
}

export function uid(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function newEntityId(prefix = "id"): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return uid(prefix);
}

// ── Read ─────────────────────────────────────────────────────────────────────

export function getProducts(): Product[] {
  return getCache().products.filter((p) => p.active);
}

export function getCategories(showIn?: "ventas" | "compras"): Category[] {
  const cats = getCache().categories.filter((c) => c.active);
  if (!showIn) return cats;
  return cats.filter((c) => c.show_in.includes(showIn));
}

export function getCategory(id: string): Category | undefined {
  return getCache().categories.find((c) => c.id === id);
}

export function getCustomers(): Customer[] {
  return getCache().customers;
}

export function getSuppliers(): Supplier[] {
  return getCache().suppliers;
}

export function getOrders(): Order[] {
  return [...getCache().orders].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );
}

export function getOrder(id: string): Order | undefined {
  return getCache().orders.find((o) => o.id === id);
}

export function getPurchases(): Purchase[] {
  return [...getCache().purchases].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );
}

export function getPurchase(id: string): Purchase | undefined {
  return getCache().purchases.find((p) => p.id === id);
}

export function getDebts(): Debt[] {
  return [...getCache().debts].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );
}

export function getDebt(id: string): Debt | undefined {
  return getCache().debts.find((d) => d.id === id);
}

export function getDebtByOrderId(orderId: string): Debt | undefined {
  return getCache().debts.find(
    (d) => d.kind === "collect" && d.order_id === orderId,
  );
}

export function getDebtByPurchaseId(purchaseId: string): Debt | undefined {
  return getCache().debts.find(
    (d) => d.kind === "pay" && d.purchase_id === purchaseId,
  );
}

export function getBusiness(): Business {
  return getCache().business;
}

export function getAccountProfile(): AccountProfile {
  return getCache().account;
}

// ── Write ────────────────────────────────────────────────────────────────────

export async function saveProduct(product: Product): Promise<void> {
  const db = getCache();
  const idx = db.products.findIndex((p) => p.id === product.id);
  if (idx >= 0) db.products[idx] = product;
  else db.products.push(product);

  if (isMockMode()) {
    persistMock();
    return;
  }

  await remoteUpsertProduct(product);
  notifyUpdate();
}

export async function deleteProduct(id: string): Promise<void> {
  const db = getCache();
  db.products = db.products.filter((p) => p.id !== id);

  if (isMockMode()) {
    persistMock();
    return;
  }

  await remoteDeleteProduct(id);
  notifyUpdate();
}

export async function saveCategory(category: Category): Promise<void> {
  const db = getCache();
  const idx = db.categories.findIndex((c) => c.id === category.id);
  if (idx >= 0) db.categories[idx] = category;
  else db.categories.push(category);

  if (isMockMode()) {
    persistMock();
    return;
  }

  await remoteUpsertCategory(category);
  notifyUpdate();
}

export async function deleteCategory(id: string): Promise<void> {
  const db = getCache();
  db.categories = db.categories.filter((c) => c.id !== id);

  if (isMockMode()) {
    persistMock();
    return;
  }

  await remoteDeleteCategory(id);
  notifyUpdate();
}

export async function saveCustomer(customer: Customer): Promise<void> {
  const db = getCache();
  const idx = db.customers.findIndex((c) => c.id === customer.id);
  if (idx >= 0) db.customers[idx] = customer;
  else db.customers.push(customer);

  if (isMockMode()) {
    persistMock();
    return;
  }

  await remoteUpsertCustomer(customer);
  notifyUpdate();
}

export async function saveSupplier(supplier: Supplier): Promise<void> {
  const db = getCache();
  const idx = db.suppliers.findIndex((s) => s.id === supplier.id);
  if (idx >= 0) db.suppliers[idx] = supplier;
  else db.suppliers.push(supplier);

  if (isMockMode()) {
    persistMock();
    return;
  }

  await remoteUpsertSupplier(supplier);
  notifyUpdate();
}

export async function saveOrder(order: Order): Promise<void> {
  const db = getCache();
  db.orders.unshift(order);

  if (isMockMode()) {
    persistMock();
    return;
  }

  await remoteSaveOrder(order);
  notifyUpdate();
}

export async function savePurchase(purchase: Purchase): Promise<void> {
  const db = getCache();
  db.purchases.unshift(purchase);

  if (isMockMode()) {
    persistMock();
    return;
  }

  await remoteSavePurchase(purchase);
  notifyUpdate();
}

export async function saveDebt(debt: Debt): Promise<void> {
  const db = getCache();
  db.debts.unshift(debt);

  if (isMockMode()) {
    persistMock();
    return;
  }

  await remoteSaveDebt(debt);
  notifyUpdate();
}

export async function updateDebt(
  debtId: string,
  updates: Partial<Debt>,
): Promise<void> {
  const db = getCache();
  db.debts = db.debts.map((d) => (d.id === debtId ? { ...d, ...updates } : d));

  if (isMockMode()) {
    persistMock();
    return;
  }

  const { createClient } = await import("@/lib/supabase/client");
  const { error } = await createClient()
    .from("debts")
    .update(updates)
    .eq("id", debtId);

  if (error) throw new Error(error.message);
  notifyUpdate();
}

export async function savePayment(payment: Payment): Promise<void> {
  const db = getCache();
  db.payments.push(payment);
  const debt = db.debts.find((d) => d.id === payment.debt_id);
  if (debt) {
    const paid = debt.paid + payment.amount;
    const remaining = Math.max(debt.total - paid, 0);
    debt.paid = paid;
    debt.remaining = remaining;
    debt.status = remaining <= 0 ? "paid" : paid > 0 ? "partial" : "pending";
  }

  if (isMockMode()) {
    persistMock();
    return;
  }

  await remoteSavePayment(payment);
  notifyUpdate();
}

export async function adjustStock(
  productId: string,
  delta: number,
): Promise<void> {
  const db = getCache();
  const product = db.products.find((p) => p.id === productId);
  if (product) product.stock = Math.max(0, product.stock + delta);

  if (isMockMode()) {
    persistMock();
    return;
  }

  await remoteAdjustStock(productId, delta);
  notifyUpdate();
}

export function saveBusiness(business: Business): void {
  const db = getCache();
  db.business = business;
  if (isMockMode()) persistMock();
  else notifyUpdate();
}

export function saveAccountProfile(account: AccountProfile): void {
  const db = getCache();
  db.account = account;
  if (isMockMode()) persistMock();
}

export async function nextOrderNumber(businessId: string): Promise<string> {
  if (isMockMode()) {
    const { generateOrderNumber } = await import(
      "@/lib/utils/generateOrderNumber"
    );
    return generateOrderNumber("sale");
  }
  return remoteNextOrderNumber(businessId);
}

export async function nextPurchaseNumber(businessId: string): Promise<string> {
  if (isMockMode()) {
    const { generateOrderNumber } = await import(
      "@/lib/utils/generateOrderNumber"
    );
    return generateOrderNumber("purchase");
  }
  return remoteNextPurchaseNumber(businessId);
}
