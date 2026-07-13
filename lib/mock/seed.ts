import type {
  AccountProfile,
  Business,
  CashRegister,
  Category,
  Customer,
  Debt,
  Employee,
  Order,
  Product,
  Purchase,
  Supplier,
} from "@/lib/types/database";

export const MOCK_BUSINESS_ID = "biz-001";
export const MOCK_USER_ID = "user-001";
export const MOCK_EMPLOYEE_ID = "emp-001";
export const MOCK_EMPLOYEE_CASHIER_ID = "emp-002";

/** Timestamps fijos para evitar errores de hidratación SSR/cliente */
const MOCK_NOW = "2026-06-17T18:00:00.000Z";
const MOCK_DATE = "2026-06-17";
const MOCK_1H_AGO = "2026-06-17T17:00:00.000Z";
const MOCK_1_5H_AGO = "2026-06-17T16:30:00.000Z";
const MOCK_2H_AGO = "2026-06-17T16:00:00.000Z";

export const mockBusiness: Business = {
  id: MOCK_BUSINESS_ID,
  name: "Tienda El Progreso",
  owner_id: MOCK_USER_ID,
  logo_url: null,
  plan: "free",
  tax_rate: 0.18,
  currency: "DOP",
  created_at: MOCK_NOW,
};

export const mockAccountProfile: AccountProfile = {
  user_id: MOCK_USER_ID,
  full_name: "Carlos Rodríguez",
  email: "demo@pos.app",
  username: "carlosrod",
  phone: null,
  avatar_url: null,
};

export const mockEmployees: Employee[] = [
  {
    id: MOCK_EMPLOYEE_ID,
    business_id: MOCK_BUSINESS_ID,
    user_id: MOCK_USER_ID,
    name: "Carlos Rodríguez",
    role: "owner",
    active: true,
    created_at: MOCK_NOW,
  },
  {
    id: MOCK_EMPLOYEE_CASHIER_ID,
    business_id: MOCK_BUSINESS_ID,
    user_id: "user-002",
    name: "María López",
    role: "cashier",
    active: true,
    created_at: MOCK_NOW,
  },
];

export const mockCategories: Category[] = [
  {
    id: "cat-001",
    business_id: MOCK_BUSINESS_ID,
    name: "Bebidas",
    image_url: null,
    active: true,
    show_in: ["ventas"],
    created_at: MOCK_NOW,
  },
  {
    id: "cat-002",
    business_id: MOCK_BUSINESS_ID,
    name: "Snacks",
    image_url: null,
    active: true,
    show_in: ["ventas"],
    created_at: MOCK_NOW,
  },
  {
    id: "cat-003",
    business_id: MOCK_BUSINESS_ID,
    name: "Insumos",
    image_url: null,
    active: true,
    show_in: ["compras"],
    created_at: MOCK_NOW,
  },
  {
    id: "cat-004",
    business_id: MOCK_BUSINESS_ID,
    name: "General",
    image_url: null,
    active: true,
    show_in: ["ventas", "compras"],
    created_at: MOCK_NOW,
  },
];

export const mockProducts: Product[] = [
  {
    id: "prod-001",
    business_id: MOCK_BUSINESS_ID,
    category_id: "cat-001",
    name: "Coca-Cola 600ml",
    type: "product",
    sale_price: 75,
    cost_price: 45,
    stock: 24,
    min_stock: 5,
    image_url: null,
    active: true,
    created_at: MOCK_NOW,
  },
  {
    id: "prod-002",
    business_id: MOCK_BUSINESS_ID,
    category_id: "cat-001",
    name: "Agua Crystal 500ml",
    type: "product",
    sale_price: 35,
    cost_price: 18,
    stock: 0,
    min_stock: 5,
    image_url: null,
    active: true,
    created_at: MOCK_NOW,
  },
  {
    id: "prod-003",
    business_id: MOCK_BUSINESS_ID,
    category_id: "cat-002",
    name: "Doritos Nacho",
    type: "product",
    sale_price: 95,
    cost_price: 62,
    stock: 12,
    min_stock: 5,
    image_url: null,
    active: true,
    created_at: MOCK_NOW,
  },
  {
    id: "prod-004",
    business_id: MOCK_BUSINESS_ID,
    category_id: "cat-002",
    name: "Plátano",
    type: "product",
    sale_price: 25,
    cost_price: 12,
    stock: 50,
    min_stock: 10,
    image_url: null,
    active: true,
    created_at: MOCK_NOW,
  },
  {
    id: "prod-005",
    business_id: MOCK_BUSINESS_ID,
    category_id: "cat-003",
    name: "Bolsas plásticas",
    type: "supply",
    sale_price: 0,
    cost_price: 150,
    stock: 100,
    min_stock: 20,
    image_url: null,
    active: true,
    created_at: MOCK_NOW,
  },
];

export const mockCustomers: Customer[] = [
  {
    id: "cust-001",
    business_id: MOCK_BUSINESS_ID,
    name: "Juan Pérez",
    phone: "8095551234",
    extra_info: null,
    created_at: MOCK_NOW,
  },
  {
    id: "cust-002",
    business_id: MOCK_BUSINESS_ID,
    name: "Ana Martínez",
    phone: "8095559876",
    extra_info: "Cliente frecuente",
    created_at: MOCK_NOW,
  },
];

export const mockSuppliers: Supplier[] = [
  {
    id: "sup-001",
    business_id: MOCK_BUSINESS_ID,
    name: "Distribuidora Nacional",
    phone: "8095550000",
    nit: "123456789",
    created_at: MOCK_NOW,
  },
];

export const mockCashRegister: CashRegister = {
  id: "reg-001",
  business_id: MOCK_BUSINESS_ID,
  employee_id: MOCK_EMPLOYEE_ID,
  opened_at: MOCK_NOW,
  closed_at: null,
  status: "open",
};

export const mockOrders: Order[] = [
  {
    id: "ord-001",
    business_id: MOCK_BUSINESS_ID,
    employee_id: MOCK_EMPLOYEE_ID,
    customer_id: "cust-001",
    register_id: "reg-001",
    order_number: "AIQ-167",
    status: "confirmed",
    payment_method: "cash",
    payment_type: "pay_all",
    subtotal: 170,
    tax: 0,
    service: 0,
    discount: 0,
    total: 170,
    date: MOCK_DATE,
    created_at: MOCK_1H_AGO,
    cash_received: 200,
    change: 30,
    items: [
      {
        id: "oi-001",
        order_id: "ord-001",
        product_id: "prod-001",
        name: "Coca-Cola 600ml",
        quantity: 2,
        unit_price: 75,
        total_price: 150,
      },
      {
        id: "oi-002",
        order_id: "ord-001",
        product_id: "prod-004",
        name: "Plátano",
        quantity: 1,
        unit_price: 25,
        total_price: 25,
      },
    ],
  },
  {
    id: "ord-002",
    business_id: MOCK_BUSINESS_ID,
    employee_id: MOCK_EMPLOYEE_CASHIER_ID,
    customer_id: "cust-002",
    register_id: "reg-001",
    order_number: "WOT-265",
    status: "confirmed",
    payment_method: "cash",
    payment_type: "pay_later",
    subtotal: 95,
    tax: 0,
    service: 0,
    discount: 0,
    total: 95,
    date: MOCK_DATE,
    created_at: MOCK_2H_AGO,
    items: [
      {
        id: "oi-003",
        order_id: "ord-002",
        product_id: "prod-003",
        name: "Doritos Nacho",
        quantity: 1,
        unit_price: 95,
        total_price: 95,
      },
    ],
  },
];

export const mockPurchases: Purchase[] = [
  {
    id: "pur-001",
    business_id: MOCK_BUSINESS_ID,
    employee_id: MOCK_EMPLOYEE_ID,
    supplier_id: "sup-001",
    register_id: "reg-001",
    purchase_number: "CMP-42",
    status: "confirmed",
    payment_method: "cash",
    payment_type: "pay_all",
    subtotal: 450,
    tax: 0,
    discount: 0,
    total: 450,
    date: MOCK_DATE,
    created_at: MOCK_1_5H_AGO,
    items: [
      {
        id: "pi-001",
        purchase_id: "pur-001",
        product_id: "prod-005",
        name: "Bolsas plásticas",
        quantity: 3,
        unit_price: 150,
        total_price: 450,
      },
    ],
  },
];

export const mockDebts: Debt[] = [
  {
    id: "debt-001",
    kind: "collect",
    order_id: "ord-002",
    purchase_id: null,
    customer_id: "cust-002",
    supplier_id: null,
    business_id: MOCK_BUSINESS_ID,
    total: 95,
    paid: 0,
    remaining: 95,
    status: "pending",
    created_at: MOCK_2H_AGO,
  },
];
