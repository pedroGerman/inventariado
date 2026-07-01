"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ComprasOrdenesRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/ordenes?tab=purchase");
  }, [router]);

  return null;
}
