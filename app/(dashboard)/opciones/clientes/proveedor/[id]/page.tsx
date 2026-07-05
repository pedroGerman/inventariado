"use client";

import { useParams } from "next/navigation";
import { CustomerForm } from "@/components/clientes/CustomerForm";
import { Header } from "@/components/layout/Header";
import { getSuppliers } from "@/lib/mock/db";
import { useMockDBRefresh } from "@/lib/hooks/useMockDBRefresh";

export default function EditarProveedorPage() {
  useMockDBRefresh();
  const { id } = useParams<{ id: string }>();
  const supplier = getSuppliers().find((s) => s.id === id);

  if (!supplier) {
    return (
      <>
        <Header title="Proveedor" showBack backHref="/opciones/clientes" />
        <p className="py-12 text-center text-sm text-muted-foreground">
          Proveedor no encontrado
        </p>
      </>
    );
  }

  return (
    <CustomerForm
      mode="supplier"
      backHref="/opciones/clientes"
      supplier={supplier}
    />
  );
}
