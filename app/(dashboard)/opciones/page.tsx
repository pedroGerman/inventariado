"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ShoppingBag,
  Package,
  Tags,
  Users,
  Wallet,
  Settings,
  ChevronRight,
  RefreshCw,
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { logout } from "@/lib/auth/actions";
import { mockBusiness, mockEmployees } from "@/lib/mock/seed";
import { useEmployeeStore } from "@/lib/store/employee";
import { Modal } from "@/components/ui/Modal";

const menuItems = [
  { href: "/compras", label: "Compras", icon: ShoppingBag },
  { href: "/productos", label: "Productos", icon: Package },
  { href: "/productos", label: "Insumos", icon: Package },
  { href: "/opciones/categorias", label: "Categorías", icon: Tags },
  { href: "/opciones/clientes", label: "Clientes/Proveedores", icon: Users },
  { href: "/deudas", label: "Deudas", icon: Wallet },
  { href: "#", label: "Ajustes", icon: Settings },
];

export default function OpcionesPage() {
  const current = useEmployeeStore((s) => s.current);
  const setCurrent = useEmployeeStore((s) => s.setCurrent);
  const [employeeModal, setEmployeeModal] = useState(false);

  return (
    <>
      <Header title="Opciones" />

      <div className="flex flex-col gap-8 px-4 py-4">
        <Card className="!px-4 !py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-xl font-bold text-primary">
              {current?.name.charAt(0) ?? "U"}
            </div>
            <div className="flex flex-col gap-1">
              <p className="font-semibold text-sm">{current?.name ?? "Usuario"}</p>
              <p className="text-xs text-slate-500">demo@pos.app</p>
              {/* <p className="text-xs text-slate-400">ID soporte: POS-001</p> */}
            </div>
          </div>
        </Card>

        <div className="flex flex-col gap-3">
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
        </div>

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

        <button
          type="button"
          onClick={() => {
            localStorage.removeItem("pos-mock-db");
            window.location.reload();
          }}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 py-3 text-sm text-slate-600"
        >
          <RefreshCw className="h-4 w-4" /> Actualizar base de datos
        </button>

        <form action={logout}>
          <Button type="submit" variant="danger" fullWidth>
            Cerrar sesión
          </Button>
        </form>
      </div>

      <Modal open={employeeModal} onClose={() => setEmployeeModal(false)} title="Cambiar empleado">
        <div className="space-y-2">
          {mockEmployees.map((emp) => (
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
