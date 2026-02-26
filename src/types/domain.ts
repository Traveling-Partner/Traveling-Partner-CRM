export type Status = "PENDING" | "APPROVED" | "RESTRICTED" | "SUSPENDED";

export interface StatusHistoryEntry {
  status: Status;
  changedAt: string;
  changedByUserId: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "AGENT";
}

export interface Driver {
  id: string;
  name: string;
  phone: string;
  city: string;
  status: Status;
  createdAt: string;
  createdByAgentId: string;
  approvedByAdminId?: string;
  statusHistory: StatusHistoryEntry[];
}

export interface Partner {
  id: string;
  name: string;
  city: string;
  status: Status;
  createdAt: string;
  createdByAgentId: string;
  approvedByAdminId?: string;
  statusHistory: StatusHistoryEntry[];
}

export interface Agent {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: Status;
  commissionRate: number;
  createdAt: string;
}

export interface Commission {
  id: string;
  agentId: string;
  amount: number;
  month: string;
  status: "PENDING" | "PAID";
  createdAt: string;
}

export interface Ride {
  id: string;
  driverId: string;
  partnerId?: string;
  city: string;
  status: "COMPLETED" | "CANCELLED" | "IN_PROGRESS";
  fare: number;
  commissionAmount: number;
  startedAt: string;
  completedAt?: string;
}

export interface AuditLog {
  id: string;
  action: string;
  actorId: string;
  entityType: string;
  entityId: string;
  createdAt: string;
  metadata?: Record<string, string | number | boolean>;
}

export interface Notification {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
  userId: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  status: "DRAFT" | "PUBLISHED";
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  views: number;
  featuredImageUrl?: string;
  seoTitle?: string;
  seoDescription?: string;
  createdByAdminId: string;
}

