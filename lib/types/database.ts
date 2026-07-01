export type EmployeeRole = "owner" | "cashier" | "employee";
export type ProductType = "product" | "supply";
export type OrderStatus = "confirmed" | "pending" | "cancelled" | "returned";
export type PurchaseStatus = "confirmed" | "pending" | "cancelled";
export type PaymentMethod = "cash" | "transfer" | "credit_card" | "debit_card" | "other";
export type PaymentType = "pay_all" | "deposit" | "pay_later" | "split";
export type PurchasePaymentType = "pay_all" | "deposit" | "pay_later";
export type DebtStatus = "pending" | "partial" | "paid";
export type RegisterStatus = "open" | "closed";

export interface Business {
  id: string;
  name: string;
  owner_id: string;
  logo_url: string | null;
  plan: string;
  tax_rate?: number;
  currency?: string;
  settings?: Record<string, unknown>;
  created_at: string;
}

export interface AccountProfile {
  user_id: string;
  full_name: string;
  email: string;
  username: string;
  phone: string | null;
  avatar_url: string | null;
}

export interface Employee {
  id: string;
  business_id: string;
  user_id: string;
  name: string;
  role: EmployeeRole;
  active: boolean;
  created_at: string;
}

export interface Category {
  id: string;
  business_id: string;
  name: string;
  image_url: string | null;
  active: boolean;
  show_in: ("ventas" | "compras")[];
  created_at: string;
}

export interface Product {
  id: string;
  business_id: string;
  category_id: string | null;
  name: string;
  type: ProductType;
  sale_price: number;
  cost_price: number;
  stock: number;
  image_url: string | null;
  active: boolean;
  created_at: string;
}

export interface Customer {
  id: string;
  business_id: string;
  name: string;
  phone: string | null;
  extra_info: string | null;
  created_at: string;
}

export interface Supplier {
  id: string;
  business_id: string;
  name: string;
  phone: string | null;
  nit: string | null;
  created_at: string;
}

export interface CashRegister {
  id: string;
  business_id: string;
  employee_id: string;
  opened_at: string;
  closed_at: string | null;
  status: RegisterStatus;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface Order {
  id: string;
  business_id: string;
  employee_id: string;
  customer_id: string | null;
  register_id: string | null;
  order_number: string;
  status: OrderStatus;
  payment_method: PaymentMethod;
  payment_type: PaymentType;
  subtotal: number;
  tax: number;
  service: number;
  discount: number;
  total: number;
  date: string;
  created_at: string;
  items?: OrderItem[];
  cash_received?: number;
  change?: number;
}

export interface PurchaseItem {
  id: string;
  purchase_id: string;
  product_id: string | null;
  name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface Purchase {
  id: string;
  business_id: string;
  employee_id: string;
  supplier_id: string | null;
  register_id: string | null;
  purchase_number: string;
  status: PurchaseStatus;
  payment_method: string;
  payment_type: PurchasePaymentType;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  date: string;
  created_at: string;
  items?: PurchaseItem[];
  cash_paid?: number;
  change?: number;
}

export type DebtKind = "collect" | "pay";

export interface Debt {
  id: string;
  kind: DebtKind;
  order_id: string | null;
  purchase_id: string | null;
  customer_id: string | null;
  supplier_id: string | null;
  business_id: string;
  total: number;
  paid: number;
  remaining: number;
  status: DebtStatus;
  created_at: string;
}

export interface Payment {
  id: string;
  debt_id: string;
  amount: number;
  method: string;
  created_at: string;
}
