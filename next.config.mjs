/** @type {import('next').NextConfig} */

const ADMIN_PAGES = [
  "drivers",
  "partners",
  "documents",
  "rides",
  "access-management",
  "agent-performance",
  "pool-rides",
  "settings",
  "notifications"
];

/** Public URL → existing /admin folder. Old public URLs redirect here. */
const RENAMED_PAGES = [
  { to: "employees-list", folder: "agents", from: "agents" },
  { to: "newsletter-list", folder: "newsletter", from: "newsletter" },
  { to: "newsletter-subscribers-list", folder: "newsletter-subscribers", from: "newsletter-subscribers" },
  { to: "app-banner-list", folder: "carousel", from: "carousel" },
  { to: "sales-tax-list", folder: "tax-management", from: "tax-management" },
  { to: "app-commission-list", folder: "commission-management", from: "commission-management" },
  { to: "insurance-management-list", folder: "insurance-management", from: "insurance-management" },
  { to: "platform-fee-list", folder: "platform-fee-management", from: "platform-fee-management" },
  { to: "vehicle-types-list", folder: "vehicle-types", from: "vehicle-types" },
  { to: "vehicle-brands-list", folder: "vehicle-brands", from: "vehicle-brands" },
  { to: "vehicle-models-list", folder: "vehicle-models", from: "vehicle-models" },
  { to: "vehicle-model-variants-list", folder: "vehicle-model-variants", from: "vehicle-model-variants" },
  { to: "audit-logs-list", folder: "audit-logs", from: "audit-logs" },
  { to: "sos", folder: "safety", from: "safety" }
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
      { source: "/admin/safety/services", destination: "/emergency-services-list", permanent: false },
      { source: "/admin/safety/services/:path*", destination: "/emergency-services-list/:path*", permanent: false },
      { source: "/safety/services", destination: "/emergency-services-list", permanent: false },
      { source: "/safety/services/:path*", destination: "/emergency-services-list/:path*", permanent: false },
      { source: "/sos/services", destination: "/emergency-services-list", permanent: false },
      { source: "/sos/services/:path*", destination: "/emergency-services-list/:path*", permanent: false },
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
      ...RENAMED_PAGES.flatMap(({ from, to, folder }) => [
        { source: `/admin/${folder}`, destination: `/${to}`, permanent: false },
        { source: `/admin/${folder}/:path*`, destination: `/${to}/:path*`, permanent: false },
        { source: `/${from}`, destination: `/${to}`, permanent: false },
        { source: `/${from}/:path*`, destination: `/${to}/:path*`, permanent: false }
      ]),
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
      { source: "/manager/profile", destination: "/profile", permanent: false },
      { source: "/admin/blog", destination: "/blog-list", permanent: false },
      { source: "/admin/blog/:path*", destination: "/blog-list/:path*", permanent: false },
      { source: "/blogs", destination: "/blog-list", permanent: false },
      { source: "/blogs/:path*", destination: "/blog-list/:path*", permanent: false }
    ];
  },
  async rewrites() {
    return [
      { source: "/emergency-services-list", destination: "/admin/safety/services" },
      { source: "/emergency-services-list/:path*", destination: "/admin/safety/services/:path*" },
      ...pageRules("/admin", ADMIN_PAGES),
      ...RENAMED_PAGES.flatMap(({ to, folder }) => [
        { source: `/${to}`, destination: `/admin/${folder}` },
        { source: `/${to}/:path*`, destination: `/admin/${folder}/:path*` }
      ]),
      { source: "/blog-list", destination: "/admin/blog" },
      { source: "/blog-list/:path*", destination: "/admin/blog/:path*" },
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
