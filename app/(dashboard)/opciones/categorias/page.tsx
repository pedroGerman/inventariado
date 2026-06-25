"use client";

import Link from "next/link";
import { Plus, Tags } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { getCategories } from "@/lib/mock/db";
import { useMockDBRefresh } from "@/lib/hooks/useMockDBRefresh";

export default function CategoriasPage() {
  useMockDBRefresh();
  const categories = getCategories();

  return (
    <>
      <Header title="Categorías" onRefresh={() => window.location.reload()} />

      <div className="grid grid-cols-2 gap-4 px-4 py-4 pb-24">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/opciones/categorias/${cat.id}`}
            className="rounded-xl bg-white shadow-card flex flex-col gap-2"
          >
            <div className="flex h-20 items-center justify-center overflow-hidden rounded-lg bg-slate-100">
              {cat.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={cat.image_url}
                  alt=""
                  className="size-full object-cover"
                />
              ) : (
                <Tags className="h-8 w-8 text-slate-400" />
              )}
            </div>
            {/* <Badge variant={cat.active ? "primary" : "neutral"} className="mb-1">
              {cat.active ? "Activo" : "Inactivo"}
            </Badge> */}
            <p className="text-sm font-medium">{cat.name}</p>
          </Link>
        ))}
      </div>

      <Button
        asChild
        variant="success"
        size="icon"
        className="fixed bottom-24 right-4 z-10 size-10 rounded-full shadow-button-tone-green-rest"
        aria-label="Nueva categoría"
      >
        <Link href="/opciones/categorias/nuevo">
          <Plus className="h-6 w-6" />
        </Link>
      </Button>
    </>
  );
}
