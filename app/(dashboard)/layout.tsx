"use client";

import { BottomNav } from "@/components/layout/BottomNav";
import { CartReplaceConfirmDialog } from "@/components/ordenes/CartReplaceConfirmDialog";
import { AppSessionProvider } from "@/components/providers/AppSessionProvider";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppSessionProvider>
      <div className="mx-auto min-h-screen max-w-mobile bg-white pb-24">
        {children}
      </div>
      <BottomNav />
      <CartReplaceConfirmDialog />
    </AppSessionProvider>
  );
}
