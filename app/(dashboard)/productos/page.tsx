"use client";

import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ChevronRight, Package, Plus, Search, Wallet } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/Input";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { DashboardMetricCard } from "@/components/dashboard/DashboardMetricCard";
import { getProducts } from "@/lib/mock/db";
import { useMockDBRefresh } from "@/lib/hooks/useMockDBRefresh";
import { formatCurrency } from "@/lib/utils/formatCurrency";
import { isLowStock, isOutOfStock } from "@/lib/utils/stock";
import { cn } from "@/lib/utils/cn";

type StockFilter = "all" | "low" | "out";
type ProductTab = "product" | "supply";

function parseTab(value: string | null): ProductTab {
  return value === "supply" ? "supply" : "product";
}

function parseStockFilter(value: string | null): StockFilter {
  if (value === "low" || value === "out") return value;
  return "all";
}

export default function ProductosPage() {
  return (
    <Suspense fallback={null}>
      <ProductosPageContent />
    </Suspense>
  );
}

function ProductosPageContent() {
  useMockDBRefresh();
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<ProductTab>(() =>
    parseTab(searchParams.get("tab")),
  );
  const [search, setSearch] = useState("");
  const [stockFilter, setStockFilter] = useState<StockFilter>(() =>
    parseStockFilter(searchParams.get("stock")),
  );

  useEffect(() => {
    setTab(parseTab(searchParams.get("tab")));
    setStockFilter(parseStockFilter(searchParams.get("stock")));
  }, [searchParams]);

  const products = getProducts().filter((p) => p.type === tab);

  const inventorySummary = useMemo(() => {
    const uniqueProducts = products.length;
    const patrimonio = products.reduce((total, product) => {
      const units = Math.max(0, product.stock);
      return total + units * product.cost_price;
    }, 0);

    return { uniqueProducts, patrimonio };
  }, [products]);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
      const matchesStock =
        stockFilter === "all"
          ? true
          : stockFilter === "out"
            ? isOutOfStock(p)
            : isLowStock(p);
      return matchesSearch && matchesStock;
    });
  }, [products, search, stockFilter]);

  const summaryLabel = tab === "product" ? "Productos" : "Insumos";

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

      <div className="space-y-3 px-3 py-3 pb-8">
        <SegmentedControl
          aria-label="Tipo de ítem"
          value={tab}
          onChange={setTab}
          options={[
            { value: "product", label: "Productos" },
            { value: "supply", label: "Insumos" },
          ]}
        />

        <div className="grid grid-cols-2 gap-3">
          <DashboardMetricCard
            icon={Wallet}
            label="Patrimonio"
            value={formatCurrency(inventorySummary.patrimonio)}
            sublabel="A costo de compra"
            valueClassName="text-[15px]"
          />
          <DashboardMetricCard
            icon={Package}
            label={summaryLabel}
            value={String(inventorySummary.uniqueProducts)}
            sublabel="Únicos en inventario"
            valueClassName="text-[15px]"
          />
        </div>

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

        {filtered.length === 0 ? (
          <div className="flex h-[calc(100vh-350px)] items-center justify-center gap-2">
            <p className="text-sm text-muted-foreground">
              No hay productos que coincidan
            </p>
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-slate-200">
            {filtered.map((p) => {
              return (
                <div key={p.id} className="gap-0 py-5">
                  <Link
                    href={`/productos/${p.id}`}
                    className="flex w-full items-center gap-3 text-left"
                  >
                    <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-surface-2 shadow-segmented-track">
                      {p.image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={p.image_url}
                          alt={p.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Package className="h-6 w-6 text-muted-foreground" />
                      )}
                    </div>

                    <div className="flex min-w-0 flex-1 flex-col">
                      <p className="truncate text-sm text-card-foreground">
                        {p.name}
                      </p>
                      <div className="mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs text-muted-foreground">
                        <span className="text-xs font-bold tracking-normal text-neutral-600 tabular-nums">
                          {formatCurrency(p.sale_price)}
                        </span>
                        <span>·</span>
                        <span className="text-xs">{p.stock} en stock</span>
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
