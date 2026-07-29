"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import { getDefaultRouteForRole } from "@/lib/rbac";

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.replace("/login");
      return;
    }

    router.replace(getDefaultRouteForRole(user.role));
  }, [isAuthenticated, router, user]);

  return null;
}
