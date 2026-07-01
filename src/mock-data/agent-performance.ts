import { subDays, subMonths } from "date-fns";
import type { Commission, Driver, Partner } from "@/types/domain";

/**
 * Static demo data for Agent Performance pages only.
 * Not wired into src/services — replace with API responses when endpoints are ready.
 */

export const AGENT_MOCK_SLOTS = 8;

/** Per-slot demo counts so the overview table shows varied numbers. */
const SLOT_PROFILES = [
  { drivers: 5, passengers: 4, baseCommission: 3200 },
  { drivers: 3, passengers: 6, baseCommission: 2800 },
  { drivers: 4, passengers: 3, baseCommission: 4100 },
  { drivers: 2, passengers: 5, baseCommission: 2600 },
  { drivers: 6, passengers: 2, baseCommission: 4800 },
  { drivers: 3, passengers: 4, baseCommission: 3100 },
  { drivers: 4, passengers: 3, baseCommission: 3500 },
  { drivers: 2, passengers: 2, baseCommission: 2200 }
] as const;

const DRIVER_CITIES = ["Dubai", "Abu Dhabi", "Riyadh", "Doha", "Kuwait City"];
const DRIVER_STATUSES: Driver["status"][] = ["PENDING", "APPROVED", "APPROVED", "RESTRICTED"];
const PASSENGER_STATUSES: Partner["status"][] = ["PENDING", "APPROVED", "APPROVED", "SUSPENDED"];

const DRIVER_NAMES = [
  "Ahmed Al Mansoori",
  "Omar Hassan",
  "Khalid Rahman",
  "Youssef Ibrahim",
  "Faisal Nasser",
  "Tariq Mahmoud",
  "Hassan Ali",
  "Rashid Khan"
];

const PASSENGER_NAMES = [
  "Sarah Mitchell",
  "James Cooper",
  "Emily Watson",
  "Michael Brooks",
  "Lisa Anderson",
  "David Chen",
  "Nadia Farouk",
  "Robert Taylor"
];

function buildDriversForSlot(slot: number): Driver[] {
  const profile = SLOT_PROFILES[slot - 1];
  const mockKey = `agent-${slot}`;

  return Array.from({ length: profile.drivers }).map((_, index) => {
    const createdAt = subDays(new Date(), 3 + slot + index * 2);
    const status = DRIVER_STATUSES[index % DRIVER_STATUSES.length];

    return {
      id: `perf-driver-${slot}-${index + 1}`,
      name: DRIVER_NAMES[(slot + index) % DRIVER_NAMES.length],
      phone: `+9715${(3000000 + slot * 100 + index).toString().slice(0, 7)}`,
      city: DRIVER_CITIES[index % DRIVER_CITIES.length],
      status,
      createdAt: createdAt.toISOString(),
      createdByAgentId: mockKey,
      approvedByAdminId: status !== "PENDING" ? "admin-1" : undefined,
      statusHistory: [
        {
          status: "PENDING" as const,
          changedAt: subDays(createdAt, 2).toISOString(),
          changedByUserId: mockKey
        }
      ]
    };
  });
}

function buildPassengersForSlot(slot: number): Partner[] {
  const profile = SLOT_PROFILES[slot - 1];
  const mockKey = `agent-${slot}`;

  return Array.from({ length: profile.passengers }).map((_, index) => {
    const createdAt = subDays(new Date(), 5 + slot + index * 3);
    const status = PASSENGER_STATUSES[index % PASSENGER_STATUSES.length];

    return {
      id: `perf-passenger-${slot}-${index + 1}`,
      name: PASSENGER_NAMES[(slot + index) % PASSENGER_NAMES.length],
      city: DRIVER_CITIES[(index + 1) % DRIVER_CITIES.length],
      status,
      createdAt: createdAt.toISOString(),
      createdByAgentId: mockKey,
      approvedByAdminId: status !== "PENDING" ? "admin-1" : undefined,
      statusHistory: [
        {
          status: "PENDING" as const,
          changedAt: subDays(createdAt, 1).toISOString(),
          changedByUserId: mockKey
        }
      ]
    };
  });
}

function buildCommissionsForSlot(slot: number): Commission[] {
  const profile = SLOT_PROFILES[slot - 1];
  const mockKey = `agent-${slot}`;

  return Array.from({ length: 6 }).map((_, monthIndex) => {
    const monthDate = subMonths(new Date(), monthIndex);
    const month = `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, "0")}`;
    const amount = profile.baseCommission + monthIndex * 120 + slot * 80;
    const status: Commission["status"] = monthIndex % 2 === 0 ? "PAID" : "PENDING";

    return {
      id: `perf-commission-${slot}-${monthIndex + 1}`,
      agentId: mockKey,
      amount,
      month,
      status,
      createdAt: monthDate.toISOString()
    };
  });
}

const JOINING_DATES = SLOT_PROFILES.map((_, index) =>
  subDays(new Date(), 120 - index * 12).toISOString()
);

export const agentPerformanceDrivers: Driver[] = Array.from({ length: AGENT_MOCK_SLOTS }).flatMap(
  (_, index) => buildDriversForSlot(index + 1)
);

export const agentPerformancePassengers: Partner[] = Array.from({ length: AGENT_MOCK_SLOTS }).flatMap(
  (_, index) => buildPassengersForSlot(index + 1)
);

export const agentPerformanceCommissions: Commission[] = Array.from({ length: AGENT_MOCK_SLOTS }).flatMap(
  (_, index) => buildCommissionsForSlot(index + 1)
);

export function getStaticJoiningDate(slot: number): string {
  return JOINING_DATES[slot - 1] ?? JOINING_DATES[0];
}
