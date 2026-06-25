"use client";

import { useEffect, useState } from "react";

/** Evita mismatch SSR/cliente en contenido que depende del browser (localStorage, locale). */
export function useMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}
