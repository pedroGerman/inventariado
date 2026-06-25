"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Check, Trash2 } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/Input";
import { ImagePickerSection } from "@/components/ui/ImagePickerSection";
import { Toggle } from "@/components/ui/Toggle";
import {
  getCategories,
  saveCategory,
  deleteCategory,
  uid,
} from "@/lib/mock/db";
import { MOCK_BUSINESS_ID } from "@/lib/mock/seed";
import type { Category } from "@/lib/types/database";
import { cn } from "@/lib/utils/cn";

const SHOW_IN_OPTIONS = [
  { value: "ventas" as const, label: "Ventas" },
  { value: "compras" as const, label: "Gastos/Compras" },
];

export default function CategoriaFormPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const isNew = id === "nuevo";
  const existing = isNew ? null : getCategories().find((c) => c.id === id);

  const [name, setName] = useState(existing?.name ?? "");
  const [imageUrl, setImageUrl] = useState<string | null>(existing?.image_url ?? null);
  const [active, setActive] = useState(existing?.active ?? true);
  const [showIn, setShowIn] = useState<Category["show_in"]>(
    existing?.show_in ?? ["ventas"],
  );

  useEffect(() => {
    if (existing) {
      setName(existing.name);
      setImageUrl(existing.image_url);
      setActive(existing.active);
      setShowIn(existing.show_in);
    }
  }, [existing]);

  function toggleShowIn(value: "ventas" | "compras") {
    setShowIn((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value],
    );
  }

  function handleSave() {
    if (!name.trim() || showIn.length === 0) return;
    saveCategory({
      id: existing?.id ?? uid("cat"),
      business_id: MOCK_BUSINESS_ID,
      name: name.trim(),
      image_url: imageUrl,
      active,
      show_in: showIn,
      created_at: existing?.created_at ?? new Date().toISOString(),
    });
    router.push("/opciones/categorias");
  }

  return (
    <>
      <Header
        title={isNew ? "Nueva Categoría" : "Editar Categoría"}
        showBack
        backHref="/opciones/categorias"
      />

      <div className="flex flex-col gap-7 px-4 py-4 pb-28">
        <ImagePickerSection
          imageUrl={imageUrl}
          onChange={setImageUrl}
          emptyDescription="Foto o ícono para esta categoría"
          filledDescription="Toca para reemplazar la imagen de la categoría"
          ariaLabel="Imagen de la categoría"
        />

        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-card-foreground">Nombre</h2>
          <TextField
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej. Bebidas"
            className="text-sm"
          />
        </section>

        <section className="space-y-1">
          <h2 className="text-sm font-semibold text-card-foreground">Estado</h2>
          <Toggle label="Activo" checked={active} onChange={setActive} />
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-card-foreground">Mostrar en</h2>
          <div
            className="grid grid-cols-2 gap-2"
            role="group"
            aria-label="Mostrar categoría en"
          >
            {SHOW_IN_OPTIONS.map((option) => {
              const isSelected = showIn.includes(option.value);

              return (
                <button
                  key={option.value}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => toggleShowIn(option.value)}
                  className={cn(
                    "relative flex min-h-[52px] items-center justify-center rounded-xl border-0 px-3 py-3 text-sm transition-[color,background-color,box-shadow,transform]",
                    isSelected
                      ? "bg-green-50 font-semibold text-[var(--button-success)] shadow-button-tone-green-rest dark:bg-green-950/35"
                      : "bg-surface-2 font-medium text-muted-foreground shadow-card-edge hover:bg-surface-3 hover:text-secondary-foreground hover:shadow-overview-metric active:scale-[0.99]",
                  )}
                >
                  {option.label}
                  {isSelected ? (
                    <Check
                      className="absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--button-success)]"
                      aria-hidden
                    />
                  ) : null}
                </button>
              );
            })}
          </div>
        </section>

        {!isNew && existing && (
          <Button
            type="button"
            variant="destructive"
            fullWidth
            onClick={() => {
              deleteCategory(existing.id);
              router.push("/opciones/categorias");
            }}
            iconLeft={<Trash2 className="h-4 w-4" />}
          >
            Eliminar categoría
          </Button>
        )}
      </div>

      <div className="fixed bottom-20 left-0 right-0 z-10 mx-auto max-w-mobile border-t border-border/50 bg-surface-0 px-4 py-4 safe-bottom">
        <div className="flex gap-3">
          <Button
            type="button"
            variant="secondary"
            fullWidth
            onClick={() => router.push("/opciones/categorias")}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="success"
            fullWidth
            disabled={!name.trim() || showIn.length === 0}
            onClick={handleSave}
          >
            {isNew ? "Crear categoría" : "Guardar"}
          </Button>
        </div>
      </div>
    </>
  );
}
