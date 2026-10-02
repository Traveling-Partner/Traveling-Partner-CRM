"use client";

import type { ReactNode } from "react";
import { usePageAccess } from "@/hooks/use-page-access";

/** Hides add / edit / delete / block actions when the page is Read-only. */
export function WriteOnly({ children }: { children: ReactNode }) {
  const { canWrite } = usePageAccess();
  if (!canWrite) return null;
  return <>{children}</>;
}
