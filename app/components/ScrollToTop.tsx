"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/** Garante que toda navegação entre rotas comece no topo da página. */
export default function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);

  return null;
}
