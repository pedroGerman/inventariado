"use client";

import { useParams } from "next/navigation";
import { CustomerForm } from "@/components/clientes/CustomerForm";
import { Header } from "@/components/layout/Header";
import { getCustomers } from "@/lib/mock/db";
import { useMockDBRefresh } from "@/lib/hooks/useMockDBRefresh";

export default function EditarClientePage() {
  useMockDBRefresh();
  const { id } = useParams<{ id: string }>();
  const customer = getCustomers().find((c) => c.id === id);

  if (!customer) {
    return (
      <>
        <Header title="Cliente" showBack backHref="/opciones/clientes" />
        <p className="py-12 text-center text-sm text-muted-foreground">
          Cliente no encontrado
        </p>
      </>
    );
  }

  return (
    <CustomerForm
      mode="customer"
      backHref="/opciones/clientes"
      customer={customer}
    />
  );
}
