"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/Input";
import { getCustomers } from "@/lib/mock/db";
import { useMockDBRefresh } from "@/lib/hooks/useMockDBRefresh";
import { formatPhoneDisplay } from "@/lib/utils/phone";
import type { Customer } from "@/lib/types/database";

const CREATE_CUSTOMER_HREF =
  "/opciones/clientes/nuevo?returnTo=%2Fventas%2Fcaja&openCustomerDrawer=1";

interface AddCustomerModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (customer: Customer) => void;
  highlightCustomerId?: string | null;
}

export function AddCustomerModal({
  open,
  onClose,
  onSelect,
  highlightCustomerId,
}: AddCustomerModalProps) {
  useMockDBRefresh();
  const router = useRouter();
  const customers = getCustomers();
  const [search, setSearch] = useState("");

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone?.includes(search),
  );

  function handleCreateCustomer() {
    onClose();
    router.push(CREATE_CUSTOMER_HREF);
  }

  return (
    <Modal open={open} onClose={onClose} title="Agregar Cliente">
      <div className="flex min-h-0 flex-1 flex-col gap-4">
        <div className="flex shrink-0 items-center gap-2">
          <TextField
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="h-4 w-4" />}
            placeholder="Buscar cliente..."
            className="min-w-0 flex-1"
          />
          <Button
            type="button"
            variant="success"
            size="default"
            onClick={handleCreateCustomer}
            className="h-9 shrink-0 px-4 !rounded-md"
          >
            Crear
          </Button>
        </div>

        <div className="min-h-0 flex-1 space-y-2 pt-0.5 overflow-y-auto">
          {filtered.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-500">
              No hay clientes que coincidan
            </p>
          ) : (
            filtered.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => {
                  onSelect(c);
                  onClose();
                }}
                className={
                  c.id === highlightCustomerId
                    ? "w-full rounded-xl border-0 bg-surface-2 px-4 py-3 text-left text-secondary-foreground shadow-overview-metric ring-2 ring-primary/30 transition-[box-shadow] active:bg-surface-3"
                    : "w-full rounded-xl border-0 bg-surface-2 px-4 py-3 text-left text-secondary-foreground shadow-card-edge transition-[box-shadow] hover:shadow-overview-metric active:bg-surface-3"
                }
              >
                <p className="font-medium">{c.name}</p>
                {c.phone && (
                  <p className="text-xs text-slate-500">
                    {formatPhoneDisplay(c.phone)}
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
