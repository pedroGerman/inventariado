import type {
  Category,
  Customer,
  Debt,
  Order,
  OrderItem,
  Payment,
  Product,
  Purchase,
  PurchaseItem,
  Supplier,
} from "@/lib/types/database";

function num(value: unknown): number {
  if (typeof value === "number") return value;
  if (typeof value === "string") return Number(value) || 0;
  return 0;
}

export function mapProduct(row: Record<string, unknown>): Product {
  const stockValue = Number(row.stock);
  const minStock = Number(row.min_stock);
  return {
    id: String(row.id),
    business_id: String(row.business_id),
    category_id: row.category_id ? String(row.category_id) : null,
    name: String(row.name),
    type: row.type as Product["type"],
    sale_price: num(row.sale_price),
    cost_price: num(row.cost_price),
    stock: Number.isFinite(stockValue) ? stockValue : 0,
    min_stock:
      Number.isFinite(minStock) && minStock >= 0 ? minStock : 5,
    image_url: row.image_url ? String(row.image_url) : null,
    active: Boolean(row.active),
    created_at: String(row.created_at),
  };
}

export function mapCategory(row: Record<string, unknown>): Category {
  const showIn = row.show_in;
  return {
    id: String(row.id),
    business_id: String(row.business_id),
    name: String(row.name),
    image_url: row.image_url ? String(row.image_url) : null,
    active: Boolean(row.active),
    show_in: Array.isArray(showIn)
      ? (showIn as Category["show_in"])
      : ["ventas"],
    created_at: String(row.created_at),
  };
}

export function mapCustomer(row: Record<string, unknown>): Customer {
  return {
    id: String(row.id),
    business_id: String(row.business_id),
    name: String(row.name),
    phone: row.phone ? String(row.phone) : null,
    extra_info: row.extra_info ? String(row.extra_info) : null,
    created_at: String(row.created_at),
  };
}

export function mapSupplier(row: Record<string, unknown>): Supplier {
  return {
    id: String(row.id),
    business_id: String(row.business_id),
    name: String(row.name),
    phone: row.phone ? String(row.phone) : null,
    nit: row.nit ? String(row.nit) : null,
    created_at: String(row.created_at),
  };
}

export function mapOrderItem(row: Record<string, unknown>): OrderItem {
  return {
    id: String(row.id),
    order_id: String(row.order_id),
    product_id: row.product_id ? String(row.product_id) : null,
    name: String(row.name),
    quantity: Number(row.quantity) || 0,
    unit_price: num(row.unit_price),
    total_price: num(row.total_price),
  };
}

export function mapOrder(
  row: Record<string, unknown>,
  items: OrderItem[] = [],
): Order {
  return {
    id: String(row.id),
    business_id: String(row.business_id),
    employee_id: String(row.employee_id),
    customer_id: row.customer_id ? String(row.customer_id) : null,
    register_id: row.register_id ? String(row.register_id) : null,
    order_number: String(row.order_number),
    status: row.status as Order["status"],
    payment_method: row.payment_method as Order["payment_method"],
    payment_type: row.payment_type as Order["payment_type"],
    subtotal: num(row.subtotal),
    tax: num(row.tax),
    service: num(row.service),
    discount: num(row.discount),
    total: num(row.total),
    date: String(row.date),
    created_at: String(row.created_at),
    cash_received:
      row.cash_received != null ? num(row.cash_received) : undefined,
    change:
      row.change_amount != null ? num(row.change_amount) : undefined,
    items,
  };
}

export function mapPurchaseItem(row: Record<string, unknown>): PurchaseItem {
  return {
    id: String(row.id),
    purchase_id: String(row.purchase_id),
    product_id: row.product_id ? String(row.product_id) : null,
    name: String(row.name),
    quantity: Number(row.quantity) || 0,
    unit_price: num(row.unit_price),
    total_price: num(row.total_price),
  };
}

export function mapPurchase(
  row: Record<string, unknown>,
  items: PurchaseItem[] = [],
): Purchase {
  return {
    id: String(row.id),
    business_id: String(row.business_id),
    employee_id: String(row.employee_id),
    supplier_id: row.supplier_id ? String(row.supplier_id) : null,
    register_id: row.register_id ? String(row.register_id) : null,
    purchase_number: String(row.purchase_number),
    status: row.status as Purchase["status"],
    payment_method: String(row.payment_method),
    payment_type: row.payment_type as Purchase["payment_type"],
    subtotal: num(row.subtotal),
    tax: num(row.tax),
    discount: num(row.discount),
    total: num(row.total),
    date: String(row.date),
    created_at: String(row.created_at),
    items,
    cash_paid: row.cash_paid != null ? num(row.cash_paid) : undefined,
    change: row.change != null ? num(row.change) : undefined,
  };
}

export function mapDebt(row: Record<string, unknown>): Debt {
  const kind = (row.kind as Debt["kind"]) ?? "collect";
  return {
    id: String(row.id),
    kind,
    order_id: row.order_id ? String(row.order_id) : null,
    purchase_id: row.purchase_id ? String(row.purchase_id) : null,
    customer_id: row.customer_id ? String(row.customer_id) : null,
    supplier_id: row.supplier_id ? String(row.supplier_id) : null,
    business_id: String(row.business_id),
    total: num(row.total),
    paid: num(row.paid),
    remaining: num(row.remaining),
    status: row.status as Debt["status"],
    created_at: String(row.created_at),
  };
}

export function mapPayment(row: Record<string, unknown>): Payment {
  return {
    id: String(row.id),
    debt_id: String(row.debt_id),
    amount: num(row.amount),
    method: String(row.method),
    created_at: String(row.created_at),
  };
}
