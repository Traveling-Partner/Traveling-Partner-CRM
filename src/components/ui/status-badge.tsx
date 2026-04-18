import { Badge } from "@/components/ui/badge";

export type Status =
  | "PENDING"
  | "APPROVED"
  | "RESTRICTED"
  | "SUSPENDED"
  | "ACTIVE"
  | "INACTIVE"
  | "BLOCKED";

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const normalized = status.toUpperCase();

  switch (normalized) {
    case "APPROVED":
      return <Badge variant="success">Approved</Badge>;
    case "ACTIVE":
      return <Badge variant="success">Active</Badge>;
    case "PENDING":
      return <Badge variant="warning">Pending</Badge>;
    case "RESTRICTED":
      return <Badge variant="info">Restricted</Badge>;
    case "SUSPENDED":
      return <Badge variant="danger">Suspended</Badge>;
    case "INACTIVE":
      return <Badge variant="danger">Inactive</Badge>;
    case "BLOCKED":
      return <Badge variant="danger">Blocked</Badge>;
    case "REJECTED":
      return <Badge variant="danger">Rejected</Badge>;
    default:
      return <Badge>{status}</Badge>;
  }
}

