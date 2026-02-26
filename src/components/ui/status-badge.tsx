import { Badge } from "@/components/ui/badge";

export type Status = "PENDING" | "APPROVED" | "RESTRICTED" | "SUSPENDED";

interface StatusBadgeProps {
  status: Status;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const normalized = status.toUpperCase() as Status;

  switch (normalized) {
    case "APPROVED":
      return <Badge variant="success">Approved</Badge>;
    case "PENDING":
      return <Badge variant="warning">Pending</Badge>;
    case "RESTRICTED":
      return <Badge variant="info">Restricted</Badge>;
    case "SUSPENDED":
      return <Badge variant="danger">Suspended</Badge>;
    default:
      return <Badge>{status}</Badge>;
  }
}

