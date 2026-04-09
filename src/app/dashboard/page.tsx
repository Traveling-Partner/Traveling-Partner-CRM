"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/store/hooks";

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.replace("/login");
      return;
    }

    if (user.role === "ADMIN") {
      router.replace("/admin/dashboard");
      return;
    }

    router.replace("/agent/dashboard");
  }, [isAuthenticated, router, user]);

  return null;
}
