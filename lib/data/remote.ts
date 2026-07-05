import { createClient } from "@/lib/supabase/client";
import { fetchMyBusiness } from "@/lib/business/resolve";
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
import type { DataCache } from "@/lib/data/mock";
import { emptyCache } from "@/lib/data/mock";
import {
  mapCategory,
  mapCustomer,
  mapDebt,
  mapOrder,
  mapOrderItem,
  mapPayment,
  mapProduct,
  mapPurchase,
  mapPurchaseItem,
  mapSupplier,
} from "@/lib/data/mappers";

function supabase() {
  return createClient();
}

export async function fetchRemoteCache(): Promise<DataCache> {
  const client = supabase();
  const business = await fetchMyBusiness(client);
  if (!business?.id) return emptyCache();

  const businessId = business.id;

  const [
    productsRes,
    categoriesRes,
    customersRes,
    suppliersRes,
    ordersRes,
    purchasesRes,
    debtsRes,
    paymentsRes,
  ] = await Promise.all([
    client.from("products").select("*").eq("business_id", businessId),
    client.from("categories").select("*").eq("business_id", businessId),
    client.from("customers").select("*").eq("business_id", businessId),
    client.from("suppliers").select("*").eq("business_id", businessId),
    client
      .from("orders")
      .select("*, order_items(*)")
      .eq("business_id", businessId)
      .order("created_at", { ascending: false }),
    client
      .from("purchases")
      .select("*, purchase_items(*)")
      .eq("business_id", businessId)
      .order("created_at", { ascending: false }),
    client
      .from("debts")
      .select("*")
      .eq("business_id", businessId)
      .order("created_at", { ascending: false }),
    client.from("payments").select("*"),
  ]);

  const errors = [
    productsRes.error,
    categoriesRes.error,
    customersRes.error,
    suppliersRes.error,
    ordersRes.error,
    purchasesRes.error,
    debtsRes.error,
    paymentsRes.error,
  ].filter(Boolean);

  if (errors.length > 0) {
    console.error("[fetchRemoteCache]", errors);
    throw new Error(errors[0]?.message ?? "No se pudieron cargar los datos.");
  }

  const debtIds = new Set((debtsRes.data ?? []).map((d) => String(d.id)));
  const payments = (paymentsRes.data ?? [])
    .filter((p) => debtIds.has(String(p.debt_id)))
    .map((p) => mapPayment(p as Record<string, unknown>));

  return {
    business,
    account: emptyCache().account,
    products: (productsRes.data ?? []).map((r) =>
      mapProduct(r as Record<string, unknown>),
    ),
    categories: (categoriesRes.data ?? []).map((r) =>
      mapCategory(r as Record<string, unknown>),
    ),
    customers: (customersRes.data ?? []).map((r) =>
      mapCustomer(r as Record<string, unknown>),
    ),
    suppliers: (suppliersRes.data ?? []).map((r) =>
      mapSupplier(r as Record<string, unknown>),
    ),
    orders: (ordersRes.data ?? []).map((row) => {
      const record = row as Record<string, unknown> & {
        order_items?: Record<string, unknown>[];
      };
      const items = (record.order_items ?? []).map((item) =>
        mapOrderItem(item),
      );
      return mapOrder(record, items);
    }),
    purchases: (purchasesRes.data ?? []).map((row) => {
      const record = row as Record<string, unknown> & {
        purchase_items?: Record<string, unknown>[];
      };
      const items = (record.purchase_items ?? []).map((item) =>
        mapPurchaseItem(item),
      );
      return mapPurchase(record, items);
    }),
    debts: (debtsRes.data ?? []).map((r) =>
      mapDebt(r as Record<string, unknown>),
    ),
    payments,
  };
}

export async function remoteUpsertProduct(product: Product): Promise<void> {
  const { error } = await supabase()
    .from("products")
    .upsert({
      id: product.id,
      business_id: product.business_id,
      category_id: product.category_id,
      name: product.name,
      type: product.type,
      sale_price: product.sale_price,
      cost_price: product.cost_price,
      stock: product.stock,
      image_url: product.image_url,
      active: product.active,
      created_at: product.created_at,
    });
  if (error) throw new Error(error.message);
}

export async function remoteDeleteProduct(id: string): Promise<void> {
  const { error } = await supabase().from("products").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function remoteUpsertCategory(category: Category): Promise<void> {
  const { error } = await supabase()
    .from("categories")
    .upsert({
      id: category.id,
      business_id: category.business_id,
      name: category.name,
      image_url: category.image_url,
      active: category.active,
      show_in: category.show_in,
      created_at: category.created_at,
    });
  if (error) throw new Error(error.message);
}

export async function remoteDeleteCategory(id: string): Promise<void> {
  const { error } = await supabase().from("categories").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function remoteUpsertCustomer(customer: Customer): Promise<void> {
  const { error } = await supabase()
    .from("customers")
    .upsert({
      id: customer.id,
      business_id: customer.business_id,
      name: customer.name,
      phone: customer.phone,
      extra_info: customer.extra_info,
      created_at: customer.created_at,
    });
  if (error) throw new Error(error.message);
}

export async function remoteUpsertSupplier(supplier: Supplier): Promise<void> {
  const { error } = await supabase()
    .from("suppliers")
    .upsert({
      id: supplier.id,
      business_id: supplier.business_id,
      name: supplier.name,
      phone: supplier.phone,
      nit: supplier.nit,
      created_at: supplier.created_at,
    });
  if (error) throw new Error(error.message);
}

export async function remoteAdjustStock(
  productId: string,
  delta: number,
): Promise<void> {
  const client = supabase();
  const { data, error: fetchError } = await client
    .from("products")
    .select("stock")
    .eq("id", productId)
    .single();

  if (fetchError) throw new Error(fetchError.message);

  const nextStock = Math.max(0, Number(data.stock) + delta);
  const { error } = await client
    .from("products")
    .update({ stock: nextStock })
    .eq("id", productId);

  if (error) throw new Error(error.message);
}

export async function remoteSaveOrder(order: Order): Promise<void> {
  const client = supabase();

  const { error: orderError } = await client.from("orders").insert({
    id: order.id,
    business_id: order.business_id,
    employee_id: order.employee_id,
    customer_id: order.customer_id,
    register_id: order.register_id,
    order_number: order.order_number,
    status: order.status,
    payment_method: order.payment_method,
    payment_type: order.payment_type,
    subtotal: order.subtotal,
    tax: order.tax,
    service: order.service,
    discount: order.discount,
    total: order.total,
    cash_received: order.cash_received ?? null,
    change_amount: order.change ?? null,
    date: order.date,
    created_at: order.created_at,
  });

  if (orderError) throw new Error(orderError.message);

  if (order.items?.length) {
    const { error: itemsError } = await client.from("order_items").insert(
      order.items.map((item) => ({
        id: item.id,
        order_id: order.id,
        product_id: item.product_id,
        name: item.name,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price,
      })),
    );
    if (itemsError) throw new Error(itemsError.message);
  }
}

export async function remoteUpdateOrder(order: Order): Promise<void> {
  const client = supabase();

  const { error: deleteError } = await client
    .from("order_items")
    .delete()
    .eq("order_id", order.id);

  if (deleteError) throw new Error(deleteError.message);

  if (order.items?.length) {
    const { error: itemsError } = await client.from("order_items").insert(
      order.items.map((item) => ({
        id: item.id,
        order_id: order.id,
        product_id: item.product_id,
        name: item.name,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price,
      })),
    );
    if (itemsError) throw new Error(itemsError.message);
  }

  const { error: orderError } = await client
    .from("orders")
    .update({
      customer_id: order.customer_id,
      order_number: order.order_number,
      status: order.status,
      payment_method: order.payment_method,
      payment_type: order.payment_type,
      subtotal: order.subtotal,
      tax: order.tax,
      service: order.service,
      discount: order.discount,
      total: order.total,
      cash_received: order.cash_received ?? null,
      change_amount: order.change ?? null,
      date: order.date,
    })
    .eq("id", order.id);

  if (orderError) throw new Error(orderError.message);
}

export async function remoteDeleteOrder(orderId: string): Promise<void> {
  const client = supabase();

  const { error: itemsError } = await client
    .from("order_items")
    .delete()
    .eq("order_id", orderId);

  if (itemsError) throw new Error(itemsError.message);

  const { error: orderError } = await client
    .from("orders")
    .delete()
    .eq("id", orderId);

  if (orderError) throw new Error(orderError.message);
}

export async function remoteSavePurchase(purchase: Purchase): Promise<void> {
  const client = supabase();

  const { error: purchaseError } = await client.from("purchases").insert({
    id: purchase.id,
    business_id: purchase.business_id,
    employee_id: purchase.employee_id,
    supplier_id: purchase.supplier_id,
    register_id: purchase.register_id,
    purchase_number: purchase.purchase_number,
    status: purchase.status,
    payment_method: purchase.payment_method,
    payment_type: purchase.payment_type,
    subtotal: purchase.subtotal,
    tax: purchase.tax,
    discount: purchase.discount,
    total: purchase.total,
    date: purchase.date,
    created_at: purchase.created_at,
    cash_paid: purchase.cash_paid ?? null,
    change: purchase.change ?? null,
  });

  if (purchaseError) throw new Error(purchaseError.message);

  if (purchase.items?.length) {
    const { error: itemsError } = await client.from("purchase_items").insert(
      purchase.items.map((item) => ({
        id: item.id,
        purchase_id: purchase.id,
        product_id: item.product_id,
        name: item.name,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price,
      })),
    );
    if (itemsError) throw new Error(itemsError.message);
  }
}

export async function remoteUpdatePurchase(purchase: Purchase): Promise<void> {
  const client = supabase();

  const { error: deleteError } = await client
    .from("purchase_items")
    .delete()
    .eq("purchase_id", purchase.id);

  if (deleteError) throw new Error(deleteError.message);

  if (purchase.items?.length) {
    const { error: itemsError } = await client.from("purchase_items").insert(
      purchase.items.map((item) => ({
        id: item.id,
        purchase_id: purchase.id,
        product_id: item.product_id,
        name: item.name,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price,
      })),
    );
    if (itemsError) throw new Error(itemsError.message);
  }

  const { error: purchaseError } = await client
    .from("purchases")
    .update({
      supplier_id: purchase.supplier_id,
      purchase_number: purchase.purchase_number,
      status: purchase.status,
      payment_method: purchase.payment_method,
      payment_type: purchase.payment_type,
      subtotal: purchase.subtotal,
      tax: purchase.tax,
      discount: purchase.discount,
      total: purchase.total,
      cash_paid: purchase.cash_paid ?? null,
      change: purchase.change ?? null,
      date: purchase.date,
    })
    .eq("id", purchase.id);

  if (purchaseError) throw new Error(purchaseError.message);
}

export async function remoteDeletePurchase(purchaseId: string): Promise<void> {
  const client = supabase();

  const { error: itemsError } = await client
    .from("purchase_items")
    .delete()
    .eq("purchase_id", purchaseId);

  if (itemsError) throw new Error(itemsError.message);

  const { error: purchaseError } = await client
    .from("purchases")
    .delete()
    .eq("id", purchaseId);

  if (purchaseError) throw new Error(purchaseError.message);
}

export async function remoteSaveDebt(debt: Debt): Promise<void> {
  const { error } = await supabase().from("debts").insert({
    id: debt.id,
    kind: debt.kind,
    order_id: debt.order_id,
    purchase_id: debt.purchase_id,
    customer_id: debt.customer_id,
    supplier_id: debt.supplier_id,
    business_id: debt.business_id,
    total: debt.total,
    paid: debt.paid,
    remaining: debt.remaining,
    status: debt.status,
    created_at: debt.created_at,
  });
  if (error) throw new Error(error.message);
}

export async function remoteSavePayment(payment: Payment): Promise<void> {
  const { error } = await supabase().from("payments").insert({
    id: payment.id,
    debt_id: payment.debt_id,
    amount: payment.amount,
    method: payment.method,
    created_at: payment.created_at,
  });
  if (error) throw new Error(error.message);
}

export async function remoteNextOrderNumber(businessId: string): Promise<string> {
  const { data, error } = await supabase().rpc("next_order_number", {
    p_business_id: businessId,
  });
  if (error) throw new Error(error.message);
  return String(data);
}

export async function remoteNextPurchaseNumber(
  businessId: string,
): Promise<string> {
  const { data, error } = await supabase().rpc("next_purchase_number", {
    p_business_id: businessId,
  });
  if (error) throw new Error(error.message);
  return String(data);
}
