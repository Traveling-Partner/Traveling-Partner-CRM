"use client";

import { useMemo } from "react";
import { usePathname } from "next/navigation";
import { useUserPermissionsQuery } from "@/hooks/queries/use-user-permissions";
import { getLevelForPath } from "@/lib/page-permissions";

/** Current page access from GET /auth/ops/permissions. No extra API. */
export function usePageAccess(pathname?: string) {
  const currentPath = usePathname();
  const path = pathname ?? currentPath ?? "";
  const { gate, isSuccess } = useUserPermissionsQuery();
  const level = useMemo(() => getLevelForPath(path, gate), [path, gate]);
  const enforce = isSuccess && Boolean(gate);

  return {
    level,
    canView: !enforce || level === null || level === "READ" || level === "WRITE",
    canWrite: !enforce || level === null || level === "WRITE"
  };
}
