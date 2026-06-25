"use client";

import type {
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
  mockCategories,
  mockCustomers,
  mockDebts,
  mockOrders,
  mockPurchases,
  mockProducts,
  mockSuppliers,
} from "@/lib/mock/seed";

const STORAGE_KEY = "pos-mock-db";

interface MockDB {
  products: Product[];
  categories: Category[];
  customers: Customer[];
  suppliers: Supplier[];
  orders: Order[];
  purchases: Purchase[];
  debts: Debt[];
  payments: Payment[];
}

function defaultDB(): MockDB {
  return {
    products: [...mockProducts],
    categories: [...mockCategories],
    customers: [...mockCustomers],
    suppliers: [...mockSuppliers],
    orders: [...mockOrders],
    purchases: [...mockPurchases],
    debts: [...mockDebts],
    payments: [],
  };
}

export function loadDB(): MockDB {
  if (typeof window === "undefined") return defaultDB();
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    const db = defaultDB();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
    return db;
  }
  return JSON.parse(raw) as MockDB;
}

export function saveDB(db: MockDB): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  window.dispatchEvent(new Event("pos-db-updated"));
}

export function uid(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function getProducts(): Product[] {
  return loadDB().products.filter((p) => p.active);
}

export function getCategories(showIn?: "ventas" | "compras"): Category[] {
  const cats = loadDB().categories.filter((c) => c.active);
  if (!showIn) return cats;
  return cats.filter((c) => c.show_in.includes(showIn));
}

export function getCustomers(): Customer[] {
  return loadDB().customers;
}

export function getSuppliers(): Supplier[] {
  return loadDB().suppliers;
}

export function getOrders(): Order[] {
  return loadDB().orders.sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );
}

export function getOrder(id: string): Order | undefined {
  return loadDB().orders.find((o) => o.id === id);
}

export function getPurchases(): Purchase[] {
  return loadDB().purchases.sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );
}

export function getPurchase(id: string): Purchase | undefined {
  return loadDB().purchases.find((p) => p.id === id);
}

export function getDebts(): Debt[] {
  return loadDB().debts.sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );
}

export function getDebt(id: string): Debt | undefined {
  return loadDB().debts.find((d) => d.id === id);
}

export function saveOrder(order: Order): void {
  const db = loadDB();
  db.orders.unshift(order);
  saveDB(db);
}

export function savePurchase(purchase: Purchase): void {
  const db = loadDB();
  db.purchases.unshift(purchase);
  saveDB(db);
}

export function saveDebt(debt: Debt): void {
  const db = loadDB();
  db.debts.unshift(debt);
  saveDB(db);
}

export function updateDebt(debtId: string, updates: Partial<Debt>): void {
  const db = loadDB();
  db.debts = db.debts.map((d) => (d.id === debtId ? { ...d, ...updates } : d));
  saveDB(db);
}

export function savePayment(payment: Payment): void {
  const db = loadDB();
  db.payments.push(payment);
  const debt = db.debts.find((d) => d.id === payment.debt_id);
  if (debt) {
    const paid = debt.paid + payment.amount;
    const remaining = Math.max(debt.total - paid, 0);
    debt.paid = paid;
    debt.remaining = remaining;
    debt.status = remaining <= 0 ? "paid" : paid > 0 ? "partial" : "pending";
  }
  saveDB(db);
}

export function saveProduct(product: Product): void {
  const db = loadDB();
  const idx = db.products.findIndex((p) => p.id === product.id);
  if (idx >= 0) db.products[idx] = product;
  else db.products.push(product);
  saveDB(db);
}

export function deleteProduct(id: string): void {
  const db = loadDB();
  db.products = db.products.filter((p) => p.id !== id);
  saveDB(db);
}

export function saveCategory(category: Category): void {
  const db = loadDB();
  const idx = db.categories.findIndex((c) => c.id === category.id);
  if (idx >= 0) db.categories[idx] = category;
  else db.categories.push(category);
  saveDB(db);
}

export function deleteCategory(id: string): void {
  const db = loadDB();
  db.categories = db.categories.filter((c) => c.id !== id);
  saveDB(db);
}

export function saveCustomer(customer: Customer): void {
  const db = loadDB();
  const idx = db.customers.findIndex((c) => c.id === customer.id);
  if (idx >= 0) db.customers[idx] = customer;
  else db.customers.push(customer);
  saveDB(db);
}

export function saveSupplier(supplier: Supplier): void {
  const db = loadDB();
  const idx = db.suppliers.findIndex((s) => s.id === supplier.id);
  if (idx >= 0) db.suppliers[idx] = supplier;
  else db.suppliers.push(supplier);
  saveDB(db);
}

export function adjustStock(productId: string, delta: number): void {
  const db = loadDB();
  const product = db.products.find((p) => p.id === productId);
  if (product) product.stock = Math.max(0, product.stock + delta);
  saveDB(db);
}
