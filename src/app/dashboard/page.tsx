"use client";

import AdminDashboardPage from "@/app/admin/dashboard/page";
import AgentDashboardPage from "@/app/agent/dashboard/page";
import SalesManagerDashboardPage from "@/app/sales-manager/dashboard/page";
import { useAppSelector } from "@/store/hooks";
import { normalizeRole } from "@/lib/rbac";
import { ROLES } from "@/lib/roles";

export default function DashboardPage() {
  const role = normalizeRole(useAppSelector((state) => state.auth.user?.role));
  if (role === ROLES.AGENT) return <AgentDashboardPage />;
  if (role === ROLES.SALES_MANAGER) return <SalesManagerDashboardPage />;
  return <AdminDashboardPage />;
}
