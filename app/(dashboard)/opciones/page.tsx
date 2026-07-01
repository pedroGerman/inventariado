"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ShoppingBag,
  Package,
  Tags,
  Users,
  Wallet,
  ChevronRight,
  RefreshCw,
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { logout } from "@/lib/auth/actions";
import { useEmployeeStore } from "@/lib/store/employee";
import { isMockMode } from "@/lib/config";
import { mockEmployees } from "@/lib/mock/seed";
import { Modal } from "@/components/ui/Modal";
import { AccountProfileHeader } from "@/components/opciones/AccountProfileHeader";

const menuItems = [
  { href: "/compras", label: "Compras", icon: ShoppingBag },
  { href: "/productos", label: "Productos", icon: Package },
  { href: "/productos", label: "Insumos", icon: Package },
  { href: "/opciones/categorias", label: "Categorías", icon: Tags },
  { href: "/opciones/clientes", label: "Clientes/Proveedores", icon: Users },
  { href: "/deudas", label: "Deudas", icon: Wallet },
  // { href: "#", label: "Ajustes", icon: Settings },
];

export default function OpcionesPage() {
  const current = useEmployeeStore((s) => s.current);
  const setCurrent = useEmployeeStore((s) => s.setCurrent);
  const [employeeModal, setEmployeeModal] = useState(false);
  const employees = isMockMode() ? mockEmployees : current ? [current] : [];

  return (
    <>
      <Header title="Opciones" />

      <div className="flex flex-col gap-8 px-3 py-4">
        <AccountProfileHeader />

        {/* <div className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-card-foreground">
            Manejo de cuenta
          </h2>
          <Card className="gap-0 !py-0">
            <div className="divide-y divide-border/50 !px-3.5">
              <button
                type="button"
                onClick={() => setEmployeeModal(true)}
                className="flex w-full items-center justify-between py-3.5 text-sm text-card-foreground transition-colors hover:text-foreground"
              >
                <span>Cambiar empleado</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </button>
              <button
                type="button"
                className="flex w-full items-center justify-between py-3.5 text-sm text-card-foreground transition-colors hover:text-foreground"
              >
                <span>Cambiar punto de venta</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
          </Card>
        </div> */}

        <div className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-card-foreground">
            Gestión del negocio
          </h2>
          <Card className="gap-0 !py-0">
            <div className="divide-y divide-border/50 !px-3.5">
              {menuItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="flex items-center gap-3 py-3.5 text-sm transition-colors hover:text-foreground"
                >
                  <item.icon className="h-5 w-5 shrink-0 text-muted-foreground" />
                  <span className="flex-1 font-medium text-card-foreground">
                    {item.label}
                  </span>
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                </Link>
              ))}
            </div>
          </Card>
        </div>

        {isMockMode() && (
          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={() => {
                localStorage.removeItem("pos-mock-db");
                window.location.reload();
              }}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 py-3 text-sm text-slate-600"
            >
              <RefreshCw className="h-4 w-4" /> Actualizar base de datos
            </button>
          </div>
        )}

        <div className="flex flex-col gap-3">
          <Button
            type="button"
            variant="danger"
            fullWidth
            size="sm"
            className="!rounded-lg !py-5 text-sm font-bold"
            onClick={() => {
              void logout();
            }}
          >
            Cerrar sesión
          </Button>
        </div>
      </div>

      <Modal open={employeeModal} onClose={() => setEmployeeModal(false)} title="Cambiar empleado">
        <div className="space-y-2">
          {employees.map((emp) => (
            <button
              key={emp.id}
              type="button"
              onClick={() => {
                setCurrent(emp);
                setEmployeeModal(false);
              }}
              className="w-full rounded-xl bg-slate-50 px-4 py-3 text-left hover:bg-green-50"
            >
              <p className="font-medium">{emp.name}</p>
              <p className="text-xs capitalize text-slate-500">{emp.role}</p>
            </button>
          ))}
        </div>
      </Modal>
    </>
  );
}
