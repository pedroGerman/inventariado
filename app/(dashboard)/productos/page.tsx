"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ChevronRight, Package, Plus, Search } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { TextField } from "@/components/ui/Input";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { getProducts, getCategories } from "@/lib/mock/db";
import { useMockDBRefresh } from "@/lib/hooks/useMockDBRefresh";
import { formatCurrency } from "@/lib/utils/formatCurrency";
import { cn } from "@/lib/utils/cn";

type StockFilter = "all" | "low" | "out";

export default function ProductosPage() {
  useMockDBRefresh();
  const [tab, setTab] = useState<"product" | "supply">("product");
  const [search, setSearch] = useState("");
  const [stockFilter, setStockFilter] = useState<StockFilter>("all");

  const categories = getCategories();
  const products = getProducts().filter((p) => p.type === tab);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
      const matchesStock =
        stockFilter === "all"
          ? true
          : stockFilter === "out"
            ? p.stock === 0
            : p.stock > 0 && p.stock <= 5;
      return matchesSearch && matchesStock;
    });
  }, [products, search, stockFilter]);

  const outOfStock = products.filter((p) => p.stock === 0).length;

  return (
    <>
      <Header
        title="Productos"
        onRefresh={() => window.location.reload()}
        right={
          <Link href="/productos/nuevo">
            <Button
              variant="success"
              size="icon"
              className="rounded-full"
              aria-label="Nuevo producto"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </Link>
        }
      />

      <div className="space-y-3 px-4 py-3 pb-8">
        <SegmentedControl
          aria-label="Tipo de ítem"
          value={tab}
          onChange={setTab}
          options={[
            { value: "product", label: "Productos" },
            { value: "supply", label: "Insumos" },
          ]}
        />

        <TextField
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar producto..."
          leftIcon={<Search className="h-4 w-4" />}
        />

        <div className="flex gap-2">
          {(
            [
              { value: "all", label: "Todos" },
              { value: "low", label: "Stock bajo" },
              { value: "out", label: "Agotados" },
            ] as const
          ).map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setStockFilter(option.value)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                stockFilter === option.value
                  ? "border-primary/50 bg-surface-3 text-card-foreground"
                  : "border-transparent bg-surface-2 text-muted-foreground hover:text-foreground",
              )}
            >
              {option.label}
            </button>
          ))}
        </div>

        {/* {outOfStock > 0 && stockFilter !== "out" && (
          <Card className="gap-0 border-0 bg-orange-50/80 py-0 shadow-none">
            <CardContent className="px-4 py-2.5 text-sm text-warning">
              {outOfStock} producto{outOfStock === 1 ? "" : "s"} agotado
              {outOfStock === 1 ? "" : "s"} en esta lista
            </CardContent>
          </Card>
        )} */}

        {filtered.length === 0 ? (
          <div className="h-[calc(100vh-350px)] gap-2 flex justify-center items-center ">
            <p className="text-sm text-muted-foreground">
              No hay productos que coincidan
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-200 flex flex-col">
            {filtered.map((p) => {
              const category = categories.find((c) => c.id === p.category_id);

              return (
                <div key={p.id} className="gap-0 py-5">
                  <Link
                    href={`/productos/${p.id}`}
                    className="flex w-full items-center gap-3 text-left"
                  >
                    <div className="flex size-16 shrink-0 items-center justify-center rounded-xl bg-surface-2 shadow-segmented-track">
                      <Package className="h-6 w-6 text-muted-foreground" />
                    </div>

                    <div className="min-w-0 flex-1 flex flex-col">
                      {/* <div className="mb-1 flex flex-wrap items-center gap-2">
                        <Badge variant={p.active ? "primary" : "neutral"}>
                          {p.active ? "Activo" : "Inactivo"}
                        </Badge>
                        {p.stock === 0 && (
                          <Badge variant="danger">Agotado</Badge>
                        )}
                      </div> */}
                      <p className="truncate text-sm text-card-foreground">
                        {p.name}
                      </p>
                      <div className="mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs text-muted-foreground">
                        <span className="font-bold text-xs tracking-normal text-neutral-600 tabular-nums">
                          {formatCurrency(p.sale_price)}
                        </span>
                        <span>·</span>
                        <span className="text-xs">{p.stock} en stock</span>
                        {/* {category && (
                          <>
                            <span>·</span>
                            <span>{category.name}</span>
                          </>
                        )} */}
                      </div>
                    </div>

                    <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
