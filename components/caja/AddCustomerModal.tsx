"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/Input";
import { ContactRow } from "@/components/clientes/ContactRow";
import { getCustomers } from "@/lib/mock/db";
import { useMockDBRefresh } from "@/lib/hooks/useMockDBRefresh";
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
        <div className="flex shrink-0 items-center gap-2 pt-1">
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

        <div className="min-h-0 flex-1 overflow-y-auto px-1 pt-0.5">
          {filtered.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No hay clientes que coincidan
            </p>
          ) : (
            <div className="divide-y divide-border/50">
              {filtered.map((c) => (
                <ContactRow
                  key={c.id}
                  name={c.name}
                  phone={c.phone}
                  tone="success"
                  selected={c.id === highlightCustomerId}
                  onClick={() => {
                    onSelect(c);
                    onClose();
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
