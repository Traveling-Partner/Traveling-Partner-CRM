"use client";

import { useEffect, type ReactNode } from "react";
import { usePageAccess } from "@/hooks/use-page-access";
import { setWriteAllowed } from "@/lib/write-guard";

/** Keeps fetcher mutations blocked on Read-only pages. */
export function WriteLock() {
  const { canWrite } = usePageAccess();
  useEffect(() => {
    setWriteAllowed(canWrite);
    return () => setWriteAllowed(true);
  }, [canWrite]);
  return null;
}

/** Hides add / edit / delete / block actions when the page is Read-only. */
export function WriteOnly({ children }: { children: ReactNode }) {
  const { canWrite } = usePageAccess();
  if (!canWrite) return null;
  return <>{children}</>;
}
