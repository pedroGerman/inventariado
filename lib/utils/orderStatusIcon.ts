import type { OrderStatus, PurchaseStatus } from "@/lib/types/database";
import { cn } from "@/lib/utils/cn";

export function getOrderStatusIconClassName(
  status: OrderStatus | PurchaseStatus,
): string {
  const color = (() => {
    switch (status) {
      case "confirmed":
        return "text-primary";
      case "pending":
        return "text-warning";
      case "cancelled":
        return "text-danger";
      case "returned":
        return "text-slate-500";
      default:
        return "text-muted-foreground";
    }
  })();

  return cn("h-5 w-5", color);
}

export function getOrderStatusIconContainerClassName(
  status: OrderStatus | PurchaseStatus,
  className?: string,
): string {
  return cn(
    "flex size-12 shrink-0 items-center justify-center rounded-full shadow-segmented-track",
    status === "confirmed" && "bg-green-100",
    status === "pending" && "bg-orange-100",
    status === "cancelled" && "bg-red-100",
    status === "returned" && "bg-slate-100",
    className,
  );
}
