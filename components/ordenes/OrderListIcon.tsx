import {
  Banknote,
  CircleX,
  CreditCard,
  DollarSign,
  FileText,
  Landmark,
  Plus,
  ShoppingBag,
} from "lucide-react";
import type {
  OrderStatus,
  PaymentMethod,
  PurchaseStatus,
} from "@/lib/types/database";
import { getPaymentMethodCategory } from "@/lib/utils/paymentMethod";
import {
  getOrderStatusIconClassName,
  getOrderStatusIconContainerClassName,
} from "@/lib/utils/orderStatusIcon";

interface OrderListIconProps {
  status: OrderStatus | PurchaseStatus;
  paymentMethod?: PaymentMethod | string | null;
  kind: "sale" | "purchase";
}

function getPaymentMethodIcon(method: PaymentMethod | string) {
  switch (getPaymentMethodCategory(method as PaymentMethod)) {
    case "cash":
      return Banknote;
    case "transfer":
      return Landmark;
    case "card":
      return CreditCard;
    case "other":
      return Plus;
  }
}

export function OrderListIcon({
  status,
  paymentMethod,
  kind,
}: OrderListIconProps) {
  const iconClassName = getOrderStatusIconClassName(status);
  const containerClassName = getOrderStatusIconContainerClassName(status);

  let Icon = kind === "sale" ? DollarSign : ShoppingBag;

  if (status === "cancelled") {
    Icon = CircleX;
  } else if (status === "pending") {
    Icon = FileText;
  } else if (
    (status === "confirmed" || status === "returned") &&
    paymentMethod
  ) {
    Icon = getPaymentMethodIcon(paymentMethod);
  }

  return (
    <div className={containerClassName}>
      <Icon className={iconClassName} />
    </div>
  );
}
