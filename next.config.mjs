/** @type {import('next').NextConfig} */

const ADMIN_PAGES = [
  "drivers",
  "partners",
  "agents",
  "documents",
  "rides",
  "safety",
  "audit-logs",
  "access-management",
  "newsletter",
  "newsletter-subscribers",
  "carousel",
  "tax-management",
  "commission-management",
  "insurance-management",
  "platform-fee-management",
  "vehicle-types",
  "vehicle-brands",
  "vehicle-models",
  "vehicle-model-variants",
  "agent-performance",
  "pool-rides",
  "settings",
  "notifications"
];

function pageRules(fromPrefix, pages) {
  return pages.flatMap((page) => [
    { source: `/${page}`, destination: `${fromPrefix}/${page}` },
    { source: `/${page}/:path*`, destination: `${fromPrefix}/${page}/:path*` }
  ]);
}

const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      { source: "/admin/dashboard", destination: "/dashboard", permanent: false },
      { source: "/agent/dashboard", destination: "/dashboard", permanent: false },
      { source: "/sales-manager/dashboard", destination: "/dashboard", permanent: false },
      { source: "/marketing-manager/dashboard", destination: "/dashboard", permanent: false },
      { source: "/manager/dashboard", destination: "/dashboard", permanent: false },
      ...ADMIN_PAGES.map((page) => ({
        source: `/admin/${page}`,
        destination: `/${page}`,
        permanent: false
      })),
      ...ADMIN_PAGES.map((page) => ({
        source: `/admin/${page}/:path*`,
        destination: `/${page}/:path*`,
        permanent: false
      })),
      { source: "/agent/listings", destination: "/listings", permanent: false },
      { source: "/agent/listings/:path*", destination: "/listings/:path*", permanent: false },
      { source: "/agent/commissions", destination: "/commissions", permanent: false },
      { source: "/agent/commissions/:path*", destination: "/commissions/:path*", permanent: false },
      { source: "/agent/profile", destination: "/profile", permanent: false },
      { source: "/agent/profile/:path*", destination: "/profile/:path*", permanent: false },
      { source: "/sales-manager/commissions", destination: "/commissions", permanent: false },
      { source: "/sales-manager/settings", destination: "/settings", permanent: false },
      { source: "/sales-manager/notifications", destination: "/notifications", permanent: false },
      { source: "/sales-manager/financial", destination: "/financial", permanent: false },
      { source: "/sales-manager/financial/:path*", destination: "/financial/:path*", permanent: false },
      { source: "/sales-manager/profile", destination: "/profile", permanent: false },
      { source: "/marketing-manager/content", destination: "/content", permanent: false },
      { source: "/marketing-manager/content/:path*", destination: "/content/:path*", permanent: false },
      { source: "/marketing-manager/settings", destination: "/settings", permanent: false },
      { source: "/marketing-manager/notifications", destination: "/notifications", permanent: false },
      { source: "/marketing-manager/profile", destination: "/profile", permanent: false },
      { source: "/manager/users", destination: "/users", permanent: false },
      { source: "/manager/users/:path*", destination: "/users/:path*", permanent: false },
      { source: "/manager/financial", destination: "/financial", permanent: false },
      { source: "/manager/financial/:path*", destination: "/financial/:path*", permanent: false },
      { source: "/manager/settings", destination: "/settings", permanent: false },
      { source: "/manager/notifications", destination: "/notifications", permanent: false },
      { source: "/manager/profile", destination: "/profile", permanent: false }
    ];
  },
  async rewrites() {
    return [
      ...pageRules("/admin", ADMIN_PAGES),
      { source: "/listings", destination: "/agent/listings" },
      { source: "/listings/:path*", destination: "/agent/listings/:path*" },
      { source: "/commissions", destination: "/agent/commissions" },
      { source: "/commissions/:path*", destination: "/agent/commissions/:path*" },
      { source: "/profile", destination: "/agent/profile" },
      { source: "/profile/:path*", destination: "/agent/profile/:path*" },
      { source: "/content", destination: "/marketing-manager/content" },
      { source: "/content/:path*", destination: "/marketing-manager/content/:path*" },
      { source: "/users", destination: "/manager/users" },
      { source: "/users/:path*", destination: "/manager/users/:path*" },
      { source: "/financial", destination: "/sales-manager/financial" },
      { source: "/financial/:path*", destination: "/sales-manager/financial/:path*" }
    ];
  }
};

export default nextConfig;
