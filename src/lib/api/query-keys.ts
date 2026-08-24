/**
 * Centralized TanStack Query keys.
 * Always use these factories so cache invalidation stays consistent.
 */
export const queryKeys = {
  auth: {
    all: ["auth"] as const
  },
  dashboard: {
    admin: () => ["dashboard", "admin"] as const
  },
  users: {
    all: ["users"] as const,
    drivers: (filters: DriversListFilters) =>
      ["users", "drivers", "list", filters] as const,
    driverStatusCounts: () => ["users", "drivers", "status-counts"] as const,
    driverDetail: (id: string | number) => ["users", "drivers", "detail", String(id)] as const,
    driverDocuments: (id: string | number) =>
      ["users", "drivers", "documents", String(id)] as const,
    driverDocumentSummary: (id: number) =>
      ["users", "drivers", "document-summary", id] as const,
    partners: (filters: PartnersListFilters) =>
      ["users", "partners", "list", filters] as const,
    partnerStatusCounts: () => ["users", "partners", "status-counts"] as const,
    partnerDetail: (id: string | number) => ["users", "partners", "detail", String(id)] as const,
    agents: (filters: AgentsListFilters) =>
      ["users", "agents", "list", filters] as const,
    agentStatusCounts: () => ["users", "agents", "status-counts"] as const,
    agentDetail: (id: string | number) => ["users", "agents", "detail", String(id)] as const,
    documentsQueue: (filters: DocumentsQueueFilters) =>
      ["users", "documents", "queue", filters] as const
  },
  vehicle: {
    all: ["vehicle"] as const,
    types: (filters: VehicleTypesListFilters) => ["vehicle", "types", filters] as const,
    models: (filters: VehicleModelsListFilters) => ["vehicle", "models", filters] as const,
    colors: (filters: VehicleColorsListFilters) => ["vehicle", "colors", filters] as const,
    brands: (filters: VehicleBrandsListFilters) => ["vehicle", "brands", filters] as const
  },
  blog: {
    all: ["blog"] as const,
    list: (filters: BlogListFilters) => ["blog", "list", filters] as const,
    detail: (id: number) => ["blog", "detail", id] as const,
    categories: () => ["blog", "categories"] as const
  },
  newsletter: {
    all: ["newsletter"] as const,
    list: (filters: NewsletterListFilters) => ["newsletter", "list", filters] as const,
    detail: (id: number) => ["newsletter", "detail", id] as const,
    subscribers: (filters: NewsletterSubscribersListFilters) =>
      ["newsletter", "subscribers", "list", filters] as const,
    subscriberDetail: (id: string | number, page: number, pageSize: number) =>
      ["newsletter", "subscribers", "detail", String(id), page, pageSize] as const
  },
  carousel: {
    banners: () => ["carousel", "banners"] as const,
    publishedIds: () => ["carousel", "published-ids"] as const,
    detail: (id: number) => ["carousel", "detail", id] as const
  },
  audit: {
    logs: (page: number, size: number) => ["audit", "logs", { page, size }] as const
  },
  tax: {
    all: ["tax"] as const,
    list: (filters: TaxListFilters) => ["tax", "list", filters] as const
<<<<<<< Updated upstream
=======
  },
  sos: {
    all: ["sos"] as const,
    list: (filters: SosListFilters) => ["sos", "list", filters] as const
  },
  platformFee: {
    all: ["platformFee"] as const,
    list: (filters: PlatformFeeListFilters) => ["platformFee", "list", filters] as const
>>>>>>> Stashed changes
  }
} as const;

export interface DriversListFilters {
  page: number;
  pageSize: number;
  status: string;
  name: string;
  mobileNumber: string;
  city: string;
  gender: string;
}

export interface PartnersListFilters {
  page: number;
  pageSize: number;
  status: string;
  name: string;
  mobileNumber: string;
  city: string;
  gender: string;
}

export interface AgentsListFilters {
  page: number;
  pageSize: number;
  status: string;
  name: string;
  mobileNumber: string;
  city: string;
  gender: string;
}

export interface DocumentsQueueFilters {
  page: number;
  pageSize: number;
  name: string;
  mobileNumber: string;
  city: string;
  gender: string;
  status: string;
  documentType: string;
}

export interface BlogListFilters {
  page: number;
  pageSize: number;
  search: string;
  status: string;
}

export interface NewsletterListFilters {
  page: number;
  pageSize: number;
  search: string;
  status: string;
}

export interface NewsletterSubscribersListFilters {
  page: number;
  pageSize: number;
  search: string;
  status: string;
}

export interface VehicleListFiltersBase {
  page: number;
  pageSize: number;
  search: string;
}

export interface TaxListFilters {
  page: number;
  pageSize: number;
  search: string;
}

<<<<<<< Updated upstream
=======
export interface SosListFilters {
  page: number;
  pageSize: number;
  search: string;
}

export interface PlatformFeeListFilters {
  page: number;
  pageSize: number;
  search: string;
}

>>>>>>> Stashed changes
export type VehicleTypesListFilters = VehicleListFiltersBase;
export type VehicleModelsListFilters = VehicleListFiltersBase;
export type VehicleColorsListFilters = VehicleListFiltersBase;
export type VehicleBrandsListFilters = VehicleListFiltersBase;
