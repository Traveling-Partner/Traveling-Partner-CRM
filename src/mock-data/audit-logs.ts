import { subDays, subHours } from "date-fns";
import { AuditLog } from "@/types/domain";
import { adminUsers, agentUsers } from "./users";

const actions = [
  "DRIVER_APPROVED",
  "DRIVER_RESTRICTED",
  "PARTNER_CREATED",
  "AGENT_UPDATED",
  "COMMISSION_MARKED_PAID",
  "BLOG_PUBLISHED"
];

const entityTypes = ["DRIVER", "PARTNER", "AGENT", "COMMISSION", "BLOG_POST"];

export const auditLogs: AuditLog[] = Array.from({ length: 30 }).map(
  (_, index) => {
    const actor =
      index % 3 === 0
        ? agentUsers[index % agentUsers.length]
        : adminUsers[index % adminUsers.length];

    const baseDate = subDays(new Date(), index % 14);
    const createdAt = subHours(baseDate, index % 6).toISOString();

    return {
      id: `audit-${index + 1}`,
      action: actions[index % actions.length],
      actorId: actor.id,
      entityType: entityTypes[index % entityTypes.length],
      entityId: `${entityTypes[index % entityTypes.length].toLowerCase()}-${
        (index % 20) + 1
      }`,
      createdAt,
      metadata: {
        ip: `10.0.0.${index + 10}`,
        userAgent: "Mozilla/5.0",
        riskScore: (index % 5) + 1
      }
    };
  }
);

