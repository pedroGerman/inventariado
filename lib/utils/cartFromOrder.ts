import type { CartItem } from "@/lib/store/cart";
import type { Order, OrderItem, Product, Purchase, PurchaseItem } from "@/lib/types/database";
import { uid } from "@/lib/data/store";

function cartItemFromLine(
  line: OrderItem | PurchaseItem,
  products: Product[],
  quickType: "quick_sale" | "quick_purchase",
): CartItem {
  const product = line.product_id
    ? products.find((p) => p.id === line.product_id)
    : undefined;

  return {
    id: uid("ci"),
    product_id: line.product_id,
    name: line.name,
    quantity: line.quantity,
    unit_price: line.unit_price,
    total_price: line.total_price,
    type: line.product_id ? "product" : quickType,
    image_url: product?.image_url,
  };
}

export function cartItemsFromOrder(order: Order, products: Product[]): CartItem[] {
  return (order.items ?? []).map((item) =>
    cartItemFromLine(item, products, "quick_sale"),
  );
}

export function cartItemsFromPurchase(
  purchase: Purchase,
  products: Product[],
): CartItem[] {
  return (purchase.items ?? []).map((item) =>
    cartItemFromLine(item, products, "quick_purchase"),
  );
}
