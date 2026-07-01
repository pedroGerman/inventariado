"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/Input";
import { getSuppliers } from "@/lib/mock/db";
import { useMockDBRefresh } from "@/lib/hooks/useMockDBRefresh";
import { formatPhoneDisplay } from "@/lib/utils/phone";
import type { Supplier } from "@/lib/types/database";

const CREATE_SUPPLIER_HREF =
  "/opciones/clientes/nuevo-proveedor?returnTo=%2Fcompras%2Fcaja&openSupplierDrawer=1";

interface AddSupplierModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (supplier: Supplier) => void;
  highlightSupplierId?: string | null;
}

export function AddSupplierModal({
  open,
  onClose,
  onSelect,
  highlightSupplierId,
}: AddSupplierModalProps) {
  useMockDBRefresh();
  const router = useRouter();
  const suppliers = getSuppliers();
  const [search, setSearch] = useState("");

  const filtered = suppliers.filter((s) => {
    const query = search.toLowerCase();
    return (
      s.name.toLowerCase().includes(query) ||
      s.phone?.includes(search) ||
      s.nit?.toLowerCase().includes(query)
    );
  });

  function handleCreateSupplier() {
    onClose();
    router.push(CREATE_SUPPLIER_HREF);
  }

  return (
    <Modal open={open} onClose={onClose} title="Agregar Proveedor">
      <div className="flex min-h-0 flex-1 flex-col gap-4">
        <div className="flex shrink-0 items-center gap-2 pt-1">
          <TextField
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="h-4 w-4" />}
            placeholder="Buscar proveedor..."
            className="min-w-0 flex-1"
          />
          <Button
            type="button"
            variant="success"
            size="default"
            onClick={handleCreateSupplier}
            className="h-9 shrink-0 px-4 !rounded-md"
          >
            Crear
          </Button>
        </div>

        <div className="min-h-0 flex-1 space-y-2 overflow-y-auto pt-0.5">
          {filtered.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-500">
              No hay proveedores que coincidan
            </p>
          ) : (
            filtered.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => {
                  onSelect(s);
                  onClose();
                }}
                className={
                  s.id === highlightSupplierId
                    ? "w-full rounded-xl border-0 bg-surface-2 px-4 py-3 text-left text-secondary-foreground shadow-overview-metric ring-2 ring-primary/30 transition-[box-shadow] active:bg-surface-3"
                    : "w-full rounded-xl border-0 bg-surface-2 px-4 py-3 text-left text-secondary-foreground shadow-card-edge transition-[box-shadow] hover:shadow-overview-metric active:bg-surface-3"
                }
              >
                <p className="font-medium">{s.name}</p>
                {(s.phone || s.nit) && (
                  <p className="text-xs text-slate-500">
                    {[s.phone ? formatPhoneDisplay(s.phone) : null, s.nit ? `NIT ${s.nit}` : null]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                )}
              </button>
            ))
          )}
        </div>
      </div>
    </Modal>
  );
}
