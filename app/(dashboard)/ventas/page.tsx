"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Settings, QrCode, ClipboardList } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { CategoryTabs } from "@/components/ventas/CategoryTabs";
import { ProductCard } from "@/components/ventas/ProductCard";
import { QuickSaleModal } from "@/components/ventas/QuickSaleModal";
import { getCategories, getProducts } from "@/lib/mock/db";
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
    if (product.stock <= 0) return;
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
          <div className="flex gap-1">
            <button className="rounded-full p-2 text-slate-500"><Settings className="h-4 w-4" /></button>
            <button className="rounded-full p-2 text-slate-500"><QrCode className="h-4 w-4" /></button>
          </div>
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
          <Badge variant="primary">Caja abierta</Badge>
          <Badge variant="neutral">Cliente</Badge>
          <Badge variant="warning">Pendientes</Badge>
          <Link
            href="/ordenes"
            className="ml-auto flex items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-600 shadow-sm"
          >
            <ClipboardList className="h-3 w-3" />
            Órdenes
          </Link>
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
