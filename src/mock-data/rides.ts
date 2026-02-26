import { addMinutes, subDays } from "date-fns";
import { Ride } from "@/types/domain";
import { drivers } from "./drivers";
import { partners } from "./partners";

const statuses: Ride["status"][] = ["COMPLETED", "CANCELLED", "IN_PROGRESS"];
const cities = ["Dubai", "Abu Dhabi", "Riyadh", "Doha", "Jeddah"];

export const rides: Ride[] = Array.from({ length: 40 }).map((_, index) => {
  const driver = drivers[index % drivers.length];
  const partner = partners[index % partners.length];
  const startedAt = subDays(new Date(), index % 12);
  const status = statuses[index % statuses.length];
  const completedAt =
    status === "COMPLETED"
      ? addMinutes(startedAt, 25 + (index % 15)).toISOString()
      : undefined;
  const fare = 35 + (index % 20) * 3.5;
  const commissionAmount = fare * 0.18;

  return {
    id: `ride-${index + 1}`,
    driverId: driver.id,
    partnerId: partner.id,
    city: cities[index % cities.length],
    status,
    fare,
    commissionAmount,
    startedAt: startedAt.toISOString(),
    completedAt
  };
});

