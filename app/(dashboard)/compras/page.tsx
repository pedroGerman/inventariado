"use client";

import { useState } from "react";
import Link from "next/link";
import { ClipboardList, Settings } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { CategoryTabs } from "@/components/ventas/CategoryTabs";
import { ProductCard } from "@/components/ventas/ProductCard";
import { QuickSaleModal } from "@/components/ventas/QuickSaleModal";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { getCategories, getProducts, uid } from "@/lib/mock/db";
import { useMockDBRefresh } from "@/lib/hooks/useMockDBRefresh";
import { useCartStore } from "@/lib/store/cart";

export default function ComprasPage() {
  useMockDBRefresh();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [quickOpen, setQuickOpen] = useState(false);
  const addItem = useCartStore((s) => s.addItem);
  const setMode = useCartStore((s) => s.setMode);

  const categories = getCategories("compras");
  let products = getProducts();

  if (selectedCategory) {
    products = products.filter((p) => p.category_id === selectedCategory);
  }

  function handleAddProduct(product: (typeof products)[0]) {
    setMode("purchase");
    addItem({
      id: uid("ci"),
      product_id: product.id,
      name: product.name,
      quantity: 1,
      unit_price: product.cost_price,
      total_price: product.cost_price,
      type: "product",
    });
  }

  return (
    <>
      <Header
        title="Compras"
        right={
          <div className="flex gap-1">
            <Button
              asChild
              type="button"
              variant="outline"
              size="icon"
              className="rounded-full"
              aria-label="Ajustes"
            >
              <Link href="/opciones">
                <Settings className="h-4 w-4" />
              </Link>
            </Button>
       
          </div>
        }
      />

      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <Badge variant="danger">Modo compra</Badge>
        <Button
          asChild
          variant="secondary"
          size="xs"
          className="rounded-full"
          iconLeft={<ClipboardList className="h-3.5 w-3.5" />}
        >
          <Link href="/compras/ordenes">Órdenes</Link>
        </Button>
      </div>

      <CategoryTabs
        categories={categories}
        selected={selectedCategory}
        onSelect={setSelectedCategory}
      />

      <div className="grid grid-cols-3 gap-2.5 px-4 py-3 pb-8">
        <ProductCard
          quickSale
          quickLabel="Compra Rápida"
          onClick={() => setQuickOpen(true)}
        />
        {products.map((p) => (
          <ProductCard
            key={p.id}
            product={{ ...p, sale_price: p.cost_price }}
            onClick={() => handleAddProduct(p)}
          />
        ))}
      </div>

      <QuickSaleModal
        open={quickOpen}
        onClose={() => setQuickOpen(false)}
        mode="purchase"
      />
    </>
  );
}
