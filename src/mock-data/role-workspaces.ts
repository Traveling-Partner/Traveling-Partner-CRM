/** UI-only demo data for new role dashboards until role-specific APIs exist. */

export const salesManagerKpis = {
  totalSales: 1284000,
  monthlyRevenue: 186500,
  activeAgents: 42,
  pendingCommissions: 28400,
  commissionPaid: 91200,
  conversionRate: 18.4
};

export const topPerformingAgents = [
  { id: "1", name: "Ayesha Khan", sales: 48500, commission: 4850, status: "ACTIVE" },
  { id: "2", name: "Omar Farooq", sales: 42100, commission: 4210, status: "ACTIVE" },
  { id: "3", name: "Sara Malik", sales: 38900, commission: 3890, status: "ACTIVE" },
  { id: "4", name: "Bilal Ahmed", sales: 35200, commission: 3520, status: "ACTIVE" },
  { id: "5", name: "Hina Raza", sales: 31800, commission: 3180, status: "ACTIVE" }
];

export const salesMonthlySeries = [
  { month: "Feb", revenue: 142000, sales: 98 },
  { month: "Mar", revenue: 158000, sales: 112 },
  { month: "Apr", revenue: 151000, sales: 105 },
  { month: "May", revenue: 172000, sales: 124 },
  { month: "Jun", revenue: 181000, sales: 131 },
  { month: "Jul", revenue: 186500, sales: 138 }
];

export const salesManagerActivities = [
  { id: "1", action: "Commission approved for Ayesha Khan", at: "2026-07-26T09:12:00Z" },
  { id: "2", action: "New agent onboarded — Hina Raza", at: "2026-07-25T16:40:00Z" },
  { id: "3", action: "Monthly revenue report exported", at: "2026-07-25T11:05:00Z" },
  { id: "4", action: "Pending commission flagged — Bilal Ahmed", at: "2026-07-24T14:22:00Z" },
  { id: "5", action: "Invoice INV-2041 marked paid", at: "2026-07-24T10:18:00Z" }
];

export const smFinancialRows = [
  { id: "tx-1", type: "Payment", party: "Agent Payout — Ayesha", amount: 4850, status: "PAID", date: "2026-07-20" },
  { id: "tx-2", type: "Invoice", party: "Fleet Partner Alpha", amount: 12500, status: "PENDING", date: "2026-07-19" },
  { id: "tx-3", type: "Transaction", party: "Platform fee collection", amount: 3200, status: "PAID", date: "2026-07-18" },
  { id: "tx-4", type: "Payment", party: "Agent Payout — Omar", amount: 4210, status: "PAID", date: "2026-07-17" },
  { id: "tx-5", type: "Invoice", party: "Corporate Client Beta", amount: 8900, status: "OVERDUE", date: "2026-07-12" }
];

export const smCommissionRows = [
  { id: "c-1", agent: "Ayesha Khan", month: "2026-07", amount: 4850, status: "PENDING" as const },
  { id: "c-2", agent: "Omar Farooq", month: "2026-07", amount: 4210, status: "PENDING" as const },
  { id: "c-3", agent: "Sara Malik", month: "2026-06", amount: 3890, status: "APPROVED" as const },
  { id: "c-4", agent: "Bilal Ahmed", month: "2026-06", amount: 3520, status: "REJECTED" as const },
  { id: "c-5", agent: "Hina Raza", month: "2026-06", amount: 3180, status: "APPROVED" as const },
  { id: "c-6", agent: "Ayesha Khan", month: "2026-05", amount: 4100, status: "APPROVED" as const }
];

export const marketingKpis = {
  campaigns: 12,
  published: 48,
  pending: 9,
  scheduled: 14,
  engagementRate: 6.8,
  reach: 245000
};

export const marketingContentRows = [
  {
    id: "cnt-1",
    title: "Summer Ride Promo",
    category: "Campaign",
    status: "PUBLISHED" as const,
    author: "Marketing Team",
    updatedAt: "2026-07-22",
    seoTitle: "Summer rides — save 20%"
  },
  {
    id: "cnt-2",
    title: "Driver Safety Tips",
    category: "Blog",
    status: "PENDING" as const,
    author: "Content Editor",
    updatedAt: "2026-07-21",
    seoTitle: "Safety tips for drivers"
  },
  {
    id: "cnt-3",
    title: "City Launch — Multan",
    category: "Social",
    status: "SCHEDULED" as const,
    author: "Social Lead",
    updatedAt: "2026-07-20",
    seoTitle: "Multan launch announcement"
  },
  {
    id: "cnt-4",
    title: "Newsletter — July",
    category: "Newsletter",
    status: "PUBLISHED" as const,
    author: "Marketing Team",
    updatedAt: "2026-07-15",
    seoTitle: "July partner newsletter"
  },
  {
    id: "cnt-5",
    title: "Carousel — Eid Offers",
    category: "Carousel",
    status: "UNPUBLISHED" as const,
    author: "Design",
    updatedAt: "2026-07-10",
    seoTitle: "Eid special offers"
  }
];

export const marketingActivities = [
  { id: "1", action: "Published Summer Ride Promo", at: "2026-07-22T08:00:00Z" },
  { id: "2", action: "Scheduled Multan launch social posts", at: "2026-07-20T15:30:00Z" },
  { id: "3", action: "Draft Driver Safety Tips submitted for review", at: "2026-07-21T11:10:00Z" },
  { id: "4", action: "July newsletter campaign completed", at: "2026-07-15T09:00:00Z" }
];

export const managerKpis = {
  revenue: 2140000,
  users: 1280,
  projects: 18,
  sales: 156000,
  activeDrivers: 640,
  activePartners: 92
};

export const managerUsers = [
  { id: "u-1", name: "Admin User", email: "admin@demo.com", role: "ADMIN", status: "ACTIVE", lastActive: "2026-07-26" },
  { id: "u-2", name: "Sales Agent 1", email: "agent1@demo.com", role: "AGENT", status: "ACTIVE", lastActive: "2026-07-26" },
  { id: "u-3", name: "Nadia Sales Mgr", email: "nadia.sm@demo.com", role: "SALES_MANAGER", status: "ACTIVE", lastActive: "2026-07-25" },
  { id: "u-4", name: "Kamran Marketing", email: "kamran.mm@demo.com", role: "MARKETING_MANAGER", status: "ACTIVE", lastActive: "2026-07-25" },
  { id: "u-5", name: "Zain Ops", email: "zain@demo.com", role: "MANAGER", status: "INACTIVE", lastActive: "2026-07-10" },
  { id: "u-6", name: "Sales Agent 2", email: "agent2@demo.com", role: "AGENT", status: "ACTIVE", lastActive: "2026-07-24" }
];

export const managerActivities = [
  { id: "1", action: "Reviewed Q2 financial report", at: "2026-07-26T10:00:00Z" },
  { id: "2", action: "Deactivated user Zain Ops", at: "2026-07-25T13:20:00Z" },
  { id: "3", action: "Approved new agent batch", at: "2026-07-24T09:45:00Z" },
  { id: "4", action: "Exported user activity report", at: "2026-07-23T16:00:00Z" }
];

export const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(value);
