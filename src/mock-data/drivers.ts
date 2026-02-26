import { addDays, subDays } from "date-fns";
import { Driver, StatusHistoryEntry } from "@/types/domain";
import { agentUsers, adminUsers } from "./users";

const cities = ["Dubai", "Abu Dhabi", "Riyadh", "Doha", "Kuwait City"];
const statuses: Driver["status"][] = [
  "PENDING",
  "APPROVED",
  "RESTRICTED",
  "SUSPENDED"
];

function buildStatusHistory(
  baseDate: Date,
  initialStatus: Driver["status"],
  approvedByAdminId?: string
): StatusHistoryEntry[] {
  const history: StatusHistoryEntry[] = [
    {
      status: "PENDING",
      changedAt: subDays(baseDate, 3).toISOString(),
      changedByUserId: agentUsers[0]?.id ?? "agent-1"
    }
  ];

  if (initialStatus === "APPROVED" && approvedByAdminId) {
    history.push({
      status: "APPROVED",
      changedAt: subDays(baseDate, 1).toISOString(),
      changedByUserId: approvedByAdminId
    });
  }

  if (initialStatus === "RESTRICTED" || initialStatus === "SUSPENDED") {
    history.push({
      status: initialStatus,
      changedAt: baseDate.toISOString(),
      changedByUserId: approvedByAdminId ?? adminUsers[0]?.id ?? "admin-1"
    });
  }

  return history;
}

export const drivers: Driver[] = Array.from({ length: 22 }).map((_, index) => {
  const createdAt = subDays(new Date(), 10 - (index % 10));
  const agent = agentUsers[index % agentUsers.length];
  const status = statuses[index % statuses.length];
  const approvedByAdmin =
    status === "APPROVED" || status === "RESTRICTED" || status === "SUSPENDED"
      ? adminUsers[index % adminUsers.length]?.id
      : undefined;

  return {
    id: `driver-${index + 1}`,
    name: `Driver ${index + 1}`,
    phone: `+9715${(1000000 + index).toString().slice(0, 7)}`,
    city: cities[index % cities.length],
    status,
    createdAt: createdAt.toISOString(),
    createdByAgentId: agent.id,
    approvedByAdminId: approvedByAdmin,
    statusHistory: buildStatusHistory(
      addDays(createdAt, 2),
      status,
      approvedByAdmin
    )
  };
});

