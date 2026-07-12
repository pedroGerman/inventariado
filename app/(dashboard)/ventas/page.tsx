"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, ClipboardList, Settings } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Header } from "@/components/layout/Header";
import { CategoryTabs } from "@/components/ventas/CategoryTabs";
import { ProductCard } from "@/components/ventas/ProductCard";
import { QuickSaleModal } from "@/components/ventas/QuickSaleModal";
import { getCategories, getProducts, getPendingOrders } from "@/lib/mock/db";
import { useMockDBRefresh } from "@/lib/hooks/useMockDBRefresh";
import { useCartStore } from "@/lib/store/cart";
import { uid } from "@/lib/mock/db";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { TextField } from "@/components/ui/Input";
import { FloatingCartButton } from "@/components/ventas/FloatingCartButton";

export default function VentasPage() {
  useMockDBRefresh();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [quickOpen, setQuickOpen] = useState(false);
  const [search, setSearch] = useState("");
  const addItem = useCartStore((s) => s.addItem);

  const categories = getCategories("ventas");
  const pendingCount = getPendingOrders().length;
  let products = getProducts().filter((p) => p.type === "product");

  if (selectedCategory) {
    products = products.filter((p) => p.category_id === selectedCategory);
  }
  if (search) {
    products = products.filter((p) =>
      p.name.toLowerCase().includes(search.toLowerCase()),
    );
  }

  function handleAddProduct(product: (typeof products)[0]) {
    addItem(
      {
        id: uid("ci"),
        product_id: product.id,
        name: product.name,
        quantity: 1,
        unit_price: product.sale_price,
        total_price: product.sale_price,
        type: "product",
        image_url: product.image_url,
      },
      "sale",
    );
  }

  return (
    <>
      <Header
        title="Ventas"
        onRefresh={() => window.location.reload()}
        right={
          <Button
            asChild
            type="button"
            variant="outline"
            size="icon"
            className="rounded-full"
            aria-label="Opciones"
          >
            <Link href="/opciones">
              <Settings className="h-4 w-4" />
            </Link>
          </Button>
        }
      />

      <div className="px-3 py-3 flex flex-col gap-3">
        <TextField
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar producto..."
          leftIcon={<Search className="h-4 w-4" />}
        />

        <div className="mb-3 flex flex-wrap items-center gap-2">
          <Link href="/ordenes?pending=1">
            <Badge variant="warning" size="xs">
              Pendientes{pendingCount > 0 ? ` (${pendingCount})` : ""}
            </Badge>
          </Link>
          <Button
            asChild
            variant="secondary"
            size="xs"
            className="ml-auto rounded-full"
            iconLeft={<ClipboardList className="h-3.5 w-3.5" />}
          >
            <Link href="/ordenes">Órdenes</Link>
          </Button>
        </div>
      </div>

      <CategoryTabs
        categories={categories}
        selected={selectedCategory}
        onSelect={setSelectedCategory}
      />

      <div className="grid grid-cols-3 gap-2 px-3 py-3">
        <ProductCard quickSale onClick={() => setQuickOpen(true)} />
        {products.map((p) => (
          <ProductCard key={p.id} product={p} onClick={() => handleAddProduct(p)} />
        ))}
      </div>

      {products.length === 0 && (
        <EmptyState
          title="No hay productos"
          description="Agrega productos en Opciones para vender desde aquí."
          className="min-h-[160px] py-8"
        />
      )}

      <QuickSaleModal open={quickOpen} onClose={() => setQuickOpen(false)} mode="sale" />
      <FloatingCartButton mode="sale" />
    </>
  );
}
