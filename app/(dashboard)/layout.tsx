"use client";

import { BottomNav } from "@/components/layout/BottomNav";
import { EmployeeProvider } from "@/components/providers/EmployeeProvider";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <EmployeeProvider>
      <div className="mx-auto min-h-screen max-w-mobile bg-white pb-24">
        {children}
      </div>
      <BottomNav />
    </EmployeeProvider>
  );
}
