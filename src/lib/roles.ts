/**
 * Canonical frontend roles.
 * Backend may return variants (e.g. "Sales Manager"); normalizeRole() maps them here.
 * Do not rename ADMIN / AGENT — existing integrations depend on these values.
 */
export const ROLES = {
  ADMIN: "ADMIN",
  AGENT: "AGENT",
  SALES_MANAGER: "SALES_MANAGER",
  MARKETING_MANAGER: "MARKETING_MANAGER",
  FINANCE_MANAGER: "FINANCE_MANAGER",
  MANAGER: "MANAGER"
} as const;

export type AppRole = (typeof ROLES)[keyof typeof ROLES];

export const ROLE_LABELS: Record<AppRole, string> = {
  ADMIN: "Admin",
  AGENT: "Sales Agent",
  SALES_MANAGER: "Sales Manager",
  MARKETING_MANAGER: "Marketing Manager",
  FINANCE_MANAGER: "Finance Manager",
  MANAGER: "Manager"
};

export const ROLE_DASHBOARDS: Record<AppRole, string> = {
  ADMIN: "/dashboard",
  AGENT: "/dashboard",
  SALES_MANAGER: "/dashboard",
  MARKETING_MANAGER: "/dashboard",
  FINANCE_MANAGER: "/dashboard",
  MANAGER: "/dashboard"
};

export const ROLE_ROUTE_PREFIXES: Record<AppRole, string> = {
  ADMIN: "/admin",
  AGENT: "/agent",
  SALES_MANAGER: "/sales-manager",
  MARKETING_MANAGER: "/marketing-manager",
  FINANCE_MANAGER: "/admin",
  MANAGER: "/manager"
};

/**
 * Existing Admin pages shared with other roles.
 *
 * IMPORTANT: These are the same /admin/* route modules Admin uses (same components,
 * same React Query hooks, same src/services calls). Do not duplicate pages or
 * change API services for role access — only route allow-lists live here.
 */
const SHARED_ADMIN_ROUTE_ACCESS: Array<{ prefixes: string[]; roles: AppRole[] }> = [
  {
    prefixes: ["/app-commission-list", "/commission-management", "/agent-performance"],
    roles: [ROLES.ADMIN, ROLES.SALES_MANAGER, ROLES.MANAGER]
  },
  {
    prefixes: [
      "/blog-list",
      "/blogs",
      "/newsletter-list",
      "/newsletter",
      "/newsletter-subscribers-list",
      "/newsletter-subscribers",
      "/app-banner-list",
      "/carousel"
    ],
    roles: [ROLES.ADMIN, ROLES.MARKETING_MANAGER]
  },
  {
    prefixes: [
      "/sales-tax-list",
      "/tax-management",
      "/insurance-management-list",
      "/insurance-management",
      "/platform-fee-list",
      "/platform-fee-management"
    ],
    roles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.SALES_MANAGER]
  },
  {
    prefixes: ["/drivers", "/partners", "/agents", "/documents"],
    roles: [ROLES.ADMIN, ROLES.MANAGER]
  },
  {
    prefixes: ["/pool-rides", "/rides"],
    roles: [ROLES.ADMIN, ROLES.MANAGER]
  },
  {
    prefixes: [
      "/vehicle-types-list",
      "/vehicle-types",
      "/vehicle-models-list",
      "/vehicle-models",
      "/vehicle-colors",
      "/vehicle-brands-list",
      "/vehicle-brands",
      "/vehicle-model-variants-list",
      "/vehicle-model-variants"
    ],
    roles: [ROLES.ADMIN, ROLES.MANAGER]
  }
];

const ROLE_PATH_PREFIXES = [
  "/marketing-manager",
  "/sales-manager",
  "/admin",
  "/agent",
  "/manager"
] as const;

export function stripRolePrefix(pathname: string): string {
  for (const prefix of ROLE_PATH_PREFIXES) {
    if (pathname === prefix) return "/";
    if (pathname.startsWith(`${prefix}/`)) return pathname.slice(prefix.length);
  }
  return pathname;
}

export function getSharedAdminRolesForPath(pathname: string): AppRole[] | undefined {
  const path = stripRolePrefix(pathname);
  const match = SHARED_ADMIN_ROUTE_ACCESS.find(({ prefixes }) =>
    prefixes.some((prefix) => path === prefix || path.startsWith(`${prefix}/`))
  );
  return match?.roles;
}

/** Longest prefixes first so /marketing-manager is not treated as /manager. */
export const ROUTE_PREFIX_CHECKS: Array<{ prefix: string; roles: AppRole[] }> = [
  { prefix: "/admin", roles: [ROLES.ADMIN] },
  { prefix: "/agent", roles: [ROLES.AGENT, ROLES.ADMIN] },
  { prefix: "/sales-manager", roles: [ROLES.SALES_MANAGER] },
  { prefix: "/marketing-manager", roles: [ROLES.MARKETING_MANAGER] },
  { prefix: "/manager", roles: [ROLES.MANAGER] }
];

export function isAppRole(value: string): value is AppRole {
  return (Object.values(ROLES) as string[]).includes(value);
}

function withPortalRoles(roles: AppRole[]): AppRole[] {
  const portalRoles: AppRole[] = [
    ROLES.FINANCE_MANAGER,
    ROLES.MARKETING_MANAGER,
    ROLES.MANAGER
  ];
  return portalRoles.reduce(
    (next, role) => (next.includes(role) ? next : [...next, role]),
    roles
  );
}

export function getAllowedRolesForPath(pathname: string): AppRole[] | undefined {
  const path = stripRolePrefix(pathname);
  const shared = getSharedAdminRolesForPath(pathname);
  if (shared) return withPortalRoles(shared);

  if (path === "/dashboard") {
    return [
      ROLES.ADMIN,
      ROLES.AGENT,
      ROLES.SALES_MANAGER,
      ROLES.MARKETING_MANAGER,
      ROLES.FINANCE_MANAGER,
      ROLES.MANAGER
    ];
  }

  if (
    path === "/listings" ||
    path.startsWith("/listings/") ||
    path === "/commissions" ||
    path.startsWith("/commissions/") ||
    path === "/profile" ||
    path.startsWith("/profile/")
  ) {
    return [ROLES.AGENT, ROLES.ADMIN];
  }

  if (path === "/content" || path.startsWith("/content/")) {
    return withPortalRoles([ROLES.MARKETING_MANAGER, ROLES.ADMIN]);
  }

  if (path === "/users" || path.startsWith("/users/")) {
    return withPortalRoles([ROLES.MANAGER, ROLES.ADMIN]);
  }

  const match = ROUTE_PREFIX_CHECKS.find(({ prefix }) => pathname.startsWith(prefix));
  if (!match) {
    if (
      path === "/sos" ||
      path.startsWith("/sos/") ||
      path === "/emergency-services-list" ||
      path.startsWith("/emergency-services-list/") ||
      path === "/safety" ||
      path.startsWith("/safety/") ||
      path === "/audit-logs-list" ||
      path.startsWith("/audit-logs-list/") ||
      path === "/audit-logs" ||
      path.startsWith("/audit-logs/") ||
      path === "/access-management" ||
      path.startsWith("/access-management/") ||
      path === "/vehicle-model-variants-list" ||
      path.startsWith("/vehicle-model-variants-list/") ||
      path === "/vehicle-model-variants" ||
      path.startsWith("/vehicle-model-variants/")
    ) {
      return withPortalRoles([ROLES.ADMIN]);
    }
    return undefined;
  }
  if (match.prefix === "/admin") return withPortalRoles(match.roles);
  return match.roles;
}

export function getRolePrefixForPath(pathname: string): string | null {
  const match = ROUTE_PREFIX_CHECKS.find(({ prefix }) => pathname.startsWith(prefix));
  return match?.prefix ?? null;
}
