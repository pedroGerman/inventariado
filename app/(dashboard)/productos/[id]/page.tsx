"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/Input";
import { Toggle } from "@/components/ui/Toggle";
import { SelectField, SelectItem } from "@/components/ui/Select";
import { ImagePickerSection } from "@/components/ui/ImagePickerSection";
import { QuickCategoryDrawer } from "@/components/categorias/QuickCategoryDrawer";
import { ConfirmDeleteModal } from "@/components/ui/ConfirmDeleteModal";
import {
  getProducts,
  getCategories,
  getCategory,
  saveProduct,
  deleteProduct,
  newEntityId,
  loadDB,
  getActiveBusinessId,
} from "@/lib/mock/db";
import { useMockDBRefresh } from "@/lib/hooks/useMockDBRefresh";
import {
  clearPlatformImage,
  uploadPlatformImage,
} from "@/lib/storage";
import { formatCurrency } from "@/lib/utils/formatCurrency";
import type { Category, Product, ProductType } from "@/lib/types/database";

export default function ProductoFormPage() {
  useMockDBRefresh();
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const isNew = id === "nuevo";

  const existing = isNew ? null : getProducts().find((p) => p.id === id) ?? null;

  const [entityId] = useState(() => existing?.id ?? newEntityId());
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
  const [pendingImageFile, setPendingImageFile] = useState<File | null>(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [categoryDrawerOpen, setCategoryDrawerOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const activeCategories = getCategories();
  const categories = (() => {
    const currentId = categoryId || existing?.category_id;
    if (!currentId || activeCategories.some((c) => c.id === currentId)) {
      return activeCategories;
    }
    const current = getCategory(currentId);
    return current ? [...activeCategories, current] : activeCategories;
  })();

  const categorySelectValue =
    !categoryId || categories.some((c) => c.id === categoryId)
      ? categoryId || "none"
      : "none";

  useEffect(() => {
    if (!id || isNew) return;
    const product = loadDB().products.find((p) => p.id === id);
    if (!product) return;

    const cats = getCategories();
    const cid = product.category_id ?? "";
    const categoryExists =
      !cid || cats.some((c) => c.id === cid) || Boolean(getCategory(cid));

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

  async function handleSave() {
    if (!name.trim() || saving) return;

    setSaving(true);
    setImageError(null);

    try {
      let finalImageUrl = imageUrl;
      const previousRemoteUrl = existing?.image_url ?? null;

      if (pendingImageFile) {
        setImageUploading(true);
        const { url } = await uploadPlatformImage({
          kind: "product",
          entityId,
          file: pendingImageFile,
          previousUrl: previousRemoteUrl,
        });
        finalImageUrl = url;
        if (imageUrl?.startsWith("blob:")) {
          URL.revokeObjectURL(imageUrl);
        }
      } else if (!imageUrl && previousRemoteUrl) {
        await clearPlatformImage(previousRemoteUrl);
        finalImageUrl = null;
      }

      const product: Product = {
        id: entityId,
        business_id: getActiveBusinessId(),
        category_id: categoryId || null,
        name: name.trim(),
        type,
        sale_price: sale,
        cost_price: cost,
        stock: parseInt(stock) || 0,
        image_url: finalImageUrl,
        active,
        created_at: existing?.created_at ?? new Date().toISOString(),
      };
      await saveProduct(product);
      router.push("/productos");
    } catch (err) {
      setImageError(
        err instanceof Error ? err.message : "No se pudo guardar el producto.",
      );
    } finally {
      setImageUploading(false);
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!existing) return;

    setDeleting(true);
    setDeleteError(null);

    try {
      await deleteProduct(existing.id);
      setDeleteOpen(false);
      router.push("/productos");
    } catch (err) {
      setDeleteError(
        err instanceof Error ? err.message : "No se pudo eliminar el producto.",
      );
      setDeleteOpen(false);
    } finally {
      setDeleting(false);
    }
  }

  function handleCategoryCreated(category: Category) {
    setCategoryId(category.id);
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
          uploadKind="product"
          entityId={entityId}
          deferUpload
          pendingFile={pendingImageFile}
          onPendingFileChange={setPendingImageFile}
          uploading={imageUploading}
          onUploadingChange={setImageUploading}
          error={imageError}
          onError={setImageError}
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
          <div className="gap-0 rounded-lg border border-neutral-200 py-4 shadow-sm shadow-neutral-100">
            <div className="!px-4 !py-0">
              <p className="text-sm font-semibold tabular-nums text-neutral-600">
                {formatCurrency(utility)}
              </p>
              <p className="text-sm text-primary">Margen: {margin}%</p>
            </div>
          </div>
        </div>

        <section className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-card-foreground">Categoría</h2>
            <button
              type="button"
              onClick={() => setCategoryDrawerOpen(true)}
              className="flex items-center gap-1 text-xs font-medium text-primary"
            >
              <Plus className="h-3.5 w-3.5" />
              Agregar
            </button>
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
            onClick={() => setDeleteOpen(true)}
            iconLeft={<Trash2 className="h-4 w-4" />}
          >
            Eliminar producto
          </Button>
        )}
      </div>

      {!isNew && existing && (
        <ConfirmDeleteModal
          open={deleteOpen}
          onClose={() => setDeleteOpen(false)}
          onConfirm={handleDelete}
          loading={deleting}
          title="Eliminar producto"
          confirmLabel="Sí, eliminar producto"
          description={
            <>
              ¿Eliminar{" "}
              <span className="font-semibold text-card-foreground">{existing.name}</span>?
              Se quitará del inventario y no podrás recuperarlo.
            </>
          }
        />
      )}

      {deleteError && (
        <p className="px-4 text-center text-xs text-destructive">{deleteError}</p>
      )}

      <div className="mx-auto max-w-mobile px-4">
        <div className="flex gap-3">
          <Button
            type="button"
            variant="secondary"
            fullWidth
            disabled={saving}
            onClick={() => router.push("/productos")}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="success"
            fullWidth
            disabled={!name.trim() || saving || imageUploading}
            onClick={() => void handleSave()}
          >
            {saving ? "Guardando…" : isNew ? "Crear producto" : "Guardar"}
          </Button>
        </div>
      </div>

      <QuickCategoryDrawer
        open={categoryDrawerOpen}
        onClose={() => setCategoryDrawerOpen(false)}
        onCreated={handleCategoryCreated}
      />
    </>
  );
}
