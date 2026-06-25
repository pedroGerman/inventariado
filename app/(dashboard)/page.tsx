"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { mockBusiness, mockCashRegister, mockEmployees } from "@/lib/mock/seed";
import { getDebts } from "@/lib/mock/db";
import { useMockDBRefresh } from "@/lib/hooks/useMockDBRefresh";
import { useMounted } from "@/lib/hooks/useMounted";
import { useEmployeeStore } from "@/lib/store/employee";
import { formatCurrency } from "@/lib/utils/formatCurrency";
import { formatDateTime } from "@/lib/utils/date";
import { Modal } from "@/components/ui/Modal";

export default function DashboardPage() {
  useMockDBRefresh();
  const mounted = useMounted();
  const current = useEmployeeStore((s) => s.current);
  const setCurrent = useEmployeeStore((s) => s.setCurrent);
  const [hideAmounts, setHideAmounts] = useState(true);
  const [employeeModal, setEmployeeModal] = useState(false);

  const debts = mounted ? getDebts() : [];
  const porCobrar = debts.reduce((s, d) => s + d.remaining, 0);
  const employee = mockEmployees.find((e) => e.id === mockCashRegister.employee_id);
  const displayEmployee = mounted ? current ?? mockEmployees[0] : mockEmployees[0];
  const openedLabel = formatDateTime(mockCashRegister.opened_at);

  return (
    <>
      <Header
        businessName={mockBusiness.name}
        employeeName={displayEmployee?.name ?? "—"}
        employeeRole={displayEmployee?.role ?? "—"}
        showEmployeeSwitcher
        onSwitchEmployee={() => setEmployeeModal(true)}
      />

      <div className="space-y-4 px-4 py-4">
        {/* Promotion modal */}
        {/* <div className="overflow-hidden rounded-2xl bg-gradient-to-r from-primary to-green-600 p-6 text-white">
          <p className="text-sm opacity-90">Promoción del mes</p>
          <p className="mt-1 text-xl font-bold">Gestiona tu negocio desde el móvil</p>
        </div> */}

        <div className="flex flex-col gap-3">
          <Link href="/estadisticas">
            <Card className="flex !flex-row items-center !py-5 justify-between px-4">
              <div>
                <h3 className="font-semibold text-sm">Ver Estadísticas</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Ventas, compras, inventario y deudas
                </p>
              </div>
              <ArrowRight className="h-5 w-5 shrink-0 text-primary" />
            </Card>
          </Link>

          <Link href="/ventas" className="block">
            <Button
              variant="success"
              fullWidth
              className="justify-between px-4 py-5"
              iconRight={<ArrowRight className="h-5 w-5" />}
            >
              Nueva venta
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Link href="/compras">
            <Button variant="secondary" fullWidth>
              Nueva Compra
            </Button>
          </Link>
          <Button variant="secondary" fullWidth disabled>
            Nuevo Gasto
          </Button>
        </div>

        <Card className="px-4 !gap-3.5">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm">Deudas</h3>
            <button
              type="button"
              onClick={() => setHideAmounts(!hideAmounts)}
              className="text-slate-400"
            >
              {hideAmounts ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-slate-500">Pendiente por cobrar</p>
              <p className="font-bold text-warning">
                {hideAmounts ? "•••••" : formatCurrency(porCobrar)}
              </p>
            </div>
            <div>
              <p className="text-slate-500">Pendiente por pagar</p>
              <p className="font-bold text-slate-400">
                {hideAmounts ? "•••••" : formatCurrency(0)}
              </p>
            </div>
          </div>
          <Link href="/deudas" className="block text-sm text-primary">
            Ver deudas →
          </Link>
        </Card>

        <Card className="px-4 flex flex-col !gap-2">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Caja</h3>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-primary" />
              <span className="text-xs capitalize">{mockCashRegister.status === "open" ? "Abierta" : "Cerrada"}</span>
            </div>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Cajero: {employee?.name ?? "—"}
          </p>
          <p className="text-xs text-slate-400">
            Abierta: {openedLabel}
          </p>
        </Card>

        <Card className="px-4 flex flex-col !gap-2">
          <h3 className="font-semibold text-slate-400">Notificaciones</h3>
          <p className="text-sm text-slate-400">Sin notificaciones nuevas</p>
        </Card>

        <Link href="/productos" className="block text-center text-sm font-medium text-primary">
          Administrar tus productos →
        </Link>
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
