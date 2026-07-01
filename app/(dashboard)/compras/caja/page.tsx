"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ComprasCajaRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/ventas/caja?tab=purchase");
  }, [router]);

  return null;
}
