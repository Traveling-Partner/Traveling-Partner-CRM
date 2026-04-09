import { addDays, subDays } from "date-fns";
import { Partner, StatusHistoryEntry } from "@/types/domain";
import { agentUsers, adminUsers } from "./users";

const cities = ["Dubai", "Abu Dhabi", "Riyadh", "Doha", "Jeddah"];
const statuses: Partner["status"][] = [
  "PENDING",
  "APPROVED",
  "RESTRICTED",
  "SUSPENDED"
];

const partnerDocumentImages = [
  "/mock-images/trade-license.svg",
  "/mock-images/vat-certificate.svg",
  "/mock-images/owner-id.svg"
];

function buildStatusHistory(
  baseDate: Date,
  initialStatus: Partner["status"],
  approvedByAdminId?: string
): StatusHistoryEntry[] {
  const history: StatusHistoryEntry[] = [
    {
      status: "PENDING",
      changedAt: subDays(baseDate, 5).toISOString(),
      changedByUserId: agentUsers[1]?.id ?? "agent-2"
    }
  ];

  if (initialStatus === "APPROVED" && approvedByAdminId) {
    history.push({
      status: "APPROVED",
      changedAt: subDays(baseDate, 2).toISOString(),
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

export const partners: Partner[] = Array.from({ length: 18 }).map(
  (_, index) => {
    const createdAt = subDays(new Date(), 14 - (index % 12));
    const agent = agentUsers[(index + 2) % agentUsers.length];
    const status = statuses[index % statuses.length];
    const approvedByAdmin =
      status === "APPROVED" || status === "RESTRICTED" || status === "SUSPENDED"
        ? adminUsers[index % adminUsers.length]?.id
        : undefined;

    return {
      id: `partner-${index + 1}`,
      name: `Fleet Partner ${index + 1}`,
      city: cities[index % cities.length],
      status,
      createdAt: createdAt.toISOString(),
      createdByAgentId: agent.id,
      approvedByAdminId: approvedByAdmin,
      statusHistory: buildStatusHistory(
        addDays(createdAt, 3),
        status,
        approvedByAdmin
      ),
      documents: [
        {
          id: `partner-${index + 1}-doc-1`,
          type: "TRADE_LICENSE",
          fileName: `trade-license-${index + 1}.jpg`,
          fileUrl: partnerDocumentImages[0],
          uploadedAt: addDays(createdAt, 1).toISOString(),
          status: "VERIFIED"
        },
        {
          id: `partner-${index + 1}-doc-2`,
          type: "VAT_CERTIFICATE",
          fileName: `vat-certificate-${index + 1}.jpg`,
          fileUrl: partnerDocumentImages[1],
          uploadedAt: addDays(createdAt, 2).toISOString(),
          status: status === "PENDING" ? "PENDING" : "VERIFIED"
        },
        {
          id: `partner-${index + 1}-doc-3`,
          type: "OWNER_ID",
          fileName: `owner-id-${index + 1}.jpg`,
          fileUrl: partnerDocumentImages[2],
          uploadedAt: addDays(createdAt, 2).toISOString(),
          status: status === "SUSPENDED" ? "REJECTED" : "VERIFIED"
        }
      ]
    };
  }
);

