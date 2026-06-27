"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Trash2 } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/Input";
import { Toggle } from "@/components/ui/Toggle";
import { SelectField, SelectItem } from "@/components/ui/Select";
import { ImagePickerSection } from "@/components/ui/ImagePickerSection";
import { getProducts, getCategories, getCategory, saveProduct, deleteProduct, uid, loadDB } from "@/lib/mock/db";
import { MOCK_BUSINESS_ID } from "@/lib/mock/seed";
import { formatCurrency } from "@/lib/utils/formatCurrency";
import type { Product, ProductType } from "@/lib/types/database";

export default function ProductoFormPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const isNew = id === "nuevo";

  const existing = useMemo(
    () => (isNew ? null : getProducts().find((p) => p.id === id) ?? null),
    [id, isNew],
  );

  const [name, setName] = useState(() => existing?.name ?? "");
  const [type, setType] = useState<ProductType>(() => existing?.type ?? "product");
  const [active, setActive] = useState(() => existing?.active ?? true);
  const [salePrice, setSalePrice] = useState(() =>
    existing ? String(existing.sale_price) : "",
  );
  const [costPrice, setCostPrice] = useState(() =>
    existing ? String(existing.cost_price) : "",
  );
  const [categoryId, setCategoryId] = useState(() => existing?.category_id ?? "");
  const [stock, setStock] = useState(() =>
    existing ? String(existing.stock) : "0",
  );
  const [imageUrl, setImageUrl] = useState<string | null>(
    () => existing?.image_url ?? null,
  );

  const categories = useMemo(() => {
    const active = getCategories();
    const currentId = categoryId || existing?.category_id;
    if (!currentId || active.some((c) => c.id === currentId)) return active;
    const current = getCategory(currentId);
    return current ? [...active, current] : active;
  }, [categoryId, existing?.category_id]);

  const categorySelectValue =
    !categoryId || categories.some((c) => c.id === categoryId)
      ? categoryId || "none"
      : "none";

  useEffect(() => {
    if (!id || isNew) return;
    const product = loadDB().products.find((p) => p.id === id);
    if (!product) return;

    const active = getCategories();
    const cid = product.category_id ?? "";
    const categoryExists =
      !cid || active.some((c) => c.id === cid) || Boolean(getCategory(cid));

    setName(product.name);
    setType(product.type);
    setActive(product.active);
    setSalePrice(String(product.sale_price));
    setCostPrice(String(product.cost_price));
    setCategoryId(categoryExists ? cid : "");
    setStock(String(product.stock));
    setImageUrl(product.image_url);
  }, [id, isNew]);

  const sale = parseFloat(salePrice) || 0;
  const cost = parseFloat(costPrice) || 0;
  const utility = sale - cost;
  const margin = cost > 0 ? ((utility / cost) * 100).toFixed(1) : "0";

  function handleSave() {
    if (!name.trim()) return;
    const product: Product = {
      id: existing?.id ?? uid("prod"),
      business_id: MOCK_BUSINESS_ID,
      category_id: categoryId || null,
      name: name.trim(),
      type,
      sale_price: sale,
      cost_price: cost,
      stock: parseInt(stock) || 0,
      image_url: imageUrl,
      active,
      created_at: existing?.created_at ?? new Date().toISOString(),
    };
    saveProduct(product);
    router.push("/productos");
  }

  function handleDelete() {
    if (existing) {
      deleteProduct(existing.id);
      router.push("/productos");
    }
  }

  return (
    <>
      <Header
        title={isNew ? "Nuevo producto" : "Editar producto"}
        showBack
        backHref="/productos"
      />

      <div className="flex flex-col gap-7 px-4 py-4 pb-10">
        <ImagePickerSection
          imageUrl={imageUrl}
          onChange={setImageUrl}
          emptyDescription="Foto o ícono para este producto"
          filledDescription="Toca para reemplazar la imagen del producto"
          ariaLabel="Imagen del producto"
        />

        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-card-foreground">
            Nombre del producto
          </h2>
          <TextField
            value={name}
            className="placeholder:text-sm text-sm"
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej. Coca-Cola 600ml"
          />
        </section>

        <section className="">
          <h2 className="text-sm font-semibold text-card-foreground">Estado</h2>
          <Toggle label="Activo" checked={active} onChange={setActive} />
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-card-foreground">Tipo</h2>
          <SelectField
            triggerClassName="text-sm"
            value={type}
            onValueChange={(value) => setType(value as ProductType)}
          >
            <SelectItem value="product">Producto</SelectItem>
            <SelectItem value="supply">Insumo</SelectItem>
          </SelectField>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-card-foreground">Precios</h2>
          <div className="grid grid-cols-2 gap-3">
            <TextField
              className="text-sm"
              label="Precio venta"
              type="number"
              value={salePrice}
              onChange={(e) => setSalePrice(e.target.value)}
              placeholder="0"
            />
            <TextField
              className="text-sm"
              label="Precio costo"
              type="number"
              value={costPrice}
              onChange={(e) => setCostPrice(e.target.value)}
              placeholder="0"
            />
          </div>
          
        </section>

        <div className="flex flex-col gap-2">
          <h2 className="text-sm font-semibold text-card-foreground">Utilidad estimada</h2>
        <div className="gap-0 py-4 border border-neutral-200 rounded-lg shadow-sm shadow-neutral-100">
            <div className="!px-4 !py-0">
                <p className="text-sm font-semibold text-neutral-600  tabular-nums">
                  {formatCurrency(utility)}
                </p>
                <p className="text-sm text-primary">Margen: {margin}%</p>
              </div>
            </div>
          </div>

        <section className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-card-foreground">Categoría</h2>
            <Link
              href="/opciones/categorias"
              className="flex items-center gap-1 text-xs font-medium text-primary"
            >
              <Plus className="h-3.5 w-3.5" />
              Agregar
            </Link>
          </div>
          <SelectField
            value={categorySelectValue}
            onValueChange={(value) => setCategoryId(value === "none" ? "" : value)}
          >
            <SelectItem value="none">Sin categoría</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectField>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-card-foreground">Inventario</h2>
          <TextField
            type="number"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            placeholder="0"
          />
        </section>

        {!isNew && (
          <Button
            type="button"
            variant="destructive"
            fullWidth
            onClick={handleDelete}
            iconLeft={<Trash2 className="h-4 w-4" />}
          >
            Eliminar producto
          </Button>
        )}
      </div>

      <div className="mx-auto max-w-mobile px-4">
        <div className="flex gap-3">
          <Button
            type="button"
            variant="secondary"
            fullWidth
            onClick={() => router.push("/productos")}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="success"
            fullWidth
            disabled={!name.trim()}
            onClick={handleSave}
          >
            {isNew ? "Crear producto" : "Guardar"}
          </Button>
        </div>
      </div>
    </>
  );
}
