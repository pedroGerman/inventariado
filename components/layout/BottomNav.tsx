"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  ClipboardList,
  ShoppingCart,
  Wallet,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useCartStore } from "@/lib/store/cart";

const tabs = [
  { href: "/", label: "Inicio", icon: Home, match: (p: string) => p === "/" },
  {
    href: "/ordenes",
    label: "Órdenes",
    icon: ClipboardList,
    match: (p: string) => p.startsWith("/ordenes"),
  },
  {
    href: "/ventas/carrito",
    label: "Carrito",
    icon: ShoppingCart,
    match: (p: string) => p.includes("/carrito"),
    badge: true,
  },
  {
    href: "/ventas/caja",
    label: "Caja",
    icon: Wallet,
    match: (p: string) => p.includes("/caja"),
  },
  {
    href: "/opciones",
    label: "Opciones",
    icon: Settings,
    match: (p: string) => p.startsWith("/opciones"),
  },
];

export function BottomNav() {
  const pathname = usePathname();
  const isPurchaseFlow = pathname.startsWith("/compras");
  const saleCount = useCartStore((s) => s.getItemCount("sale"));
  const purchaseCount = useCartStore((s) => s.getItemCount("purchase"));
  const itemCount = isPurchaseFlow ? purchaseCount : saleCount;
  const carritoHref = isPurchaseFlow ? "/compras/carrito" : "/ventas/carrito";

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 bg-white safe-bottom">
      <div className="mx-auto flex max-w-mobile items-center justify-around px-2 pb-2 pt-1">
        {tabs.map((tab) => {
          const isActive = tab.match(pathname);
          const Icon = tab.icon;
          const href = tab.badge ? carritoHref : tab.href;

          return (
            <Link
              key={tab.href}
              href={href}
              className={cn(
                "relative flex flex-col items-center gap-0.5 px-2 py-1",
                isActive ? "text-primary" : "text-slate-400",
              )}
            >
              <div className="relative">
                <Icon className="h-5 w-5" />
                {tab.badge && itemCount > 0 && (
                  <span className="absolute -right-2 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-0.5 text-[10px] font-bold text-white">
                    {itemCount > 99 ? "99+" : itemCount}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-medium">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
