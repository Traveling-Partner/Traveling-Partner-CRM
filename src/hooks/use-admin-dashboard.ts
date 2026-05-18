/**
 * @deprecated Import `useAdminDashboardQuery` from `@/hooks/queries/use-admin-dashboard-query`.
 * Kept for backward compatibility during migration.
 */
export {
  useAdminDashboardQuery as useAdminDashboard,
  type AdminDashboardData
} from "@/hooks/queries/use-admin-dashboard-query";

export { DASHBOARD_REFETCH_INTERVAL_MS as ADMIN_DASHBOARD_REFRESH_INTERVAL_MS } from "@/lib/api/query-config";
