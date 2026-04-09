import { addMinutes, subDays, subMinutes } from "date-fns";
import type { Ride, RidePaymentMethod, RideServiceType } from "@/types/domain";
import { drivers } from "./drivers";
import { partners } from "./partners";

const statuses: Ride["status"][] = ["COMPLETED", "CANCELLED", "IN_PROGRESS"];

const CITY_CENTER: Record<string, { lat: number; lng: number }> = {
  Dubai: { lat: 25.2048, lng: 55.2708 },
  "Abu Dhabi": { lat: 24.4539, lng: 54.3773 },
  Riyadh: { lat: 24.7136, lng: 46.6753 },
  Doha: { lat: 25.2854, lng: 51.531 },
  Jeddah: { lat: 21.5433, lng: 39.1728 }
};

const ROUTE_ENDS: Record<string, [string, string]> = {
  Dubai: [
    "Sheikh Zayed Rd — near DIFC",
    "JBR Walk — The Beach, Jumeirah"
  ],
  "Abu Dhabi": ["Corniche Rd W — Nation Towers", "Electra St — Al Zahiyah"],
  Riyadh: ["King Fahd Rd — Al Olaya", "Tahlia St — Al Mohammadiyyah"],
  Doha: ["Al Corniche St — West Bay", "The Pearl-Qatar — Porto Arabia"],
  Jeddah: ["King Rd — Al Hamra", "Corniche Rd — Al Shati"]
};

const PAYMENTS: RidePaymentMethod[] = ["CARD", "CASH", "WALLET"];
const SERVICES: RideServiceType[] = ["STANDARD", "PREMIUM", "POOL"];

const FIRST_NAMES = [
  "Layla",
  "Omar",
  "Noor",
  "Khalid",
  "Hana",
  "Youssef",
  "Amira",
  "Faisal",
  "Mariam",
  "Rashid"
];
const LAST_NAMES = [
  "Al-Mansoori",
  "Hassan",
  "Rahman",
  "Ibrahim",
  "Saleh",
  "Nasser",
  "Al-Suwaidi"
];

function passengerForIndex(i: number) {
  const name = `${FIRST_NAMES[i % FIRST_NAMES.length]} ${
    LAST_NAMES[i % LAST_NAMES.length]
  }`;
  const phone = `+971 ${50 + (i % 9)} ${100 + (i % 800)} ${2000 + (i % 7000)}`;
  return { name, phone };
}

export const rides: Ride[] = Array.from({ length: 40 }).map((_, index) => {
  const driver = drivers[index % drivers.length];
  const partner = partners[index % partners.length];
  const cityKeys = Object.keys(CITY_CENTER);
  const city = cityKeys[index % cityKeys.length];
  const center = CITY_CENTER[city];
  const [pickStreet, dropStreet] = ROUTE_ENDS[city];

  const startedAt = subDays(new Date(), index % 12);
  const status = statuses[index % statuses.length];
  const durationMins = 18 + (index % 22);
  const completedAt =
    status === "COMPLETED"
      ? addMinutes(startedAt, durationMins).toISOString()
      : status === "CANCELLED"
        ? addMinutes(startedAt, 6 + (index % 8)).toISOString()
        : undefined;

  const fare = Math.round((35 + (index % 20) * 3.5) * 100) / 100;
  const commissionAmount = Math.round(fare * 0.18 * 100) / 100;

  const startLat =
    center.lat + Math.sin(index * 1.17) * 0.028 + (index % 5) * 0.003;
  const startLng =
    center.lng + Math.cos(index * 0.93) * 0.032 + (index % 4) * 0.002;
  const endLat = startLat + 0.018 + (index % 7) * 0.004;
  const endLng = startLng + 0.022 + (index % 6) * 0.005;

  const distanceKm = Math.round((2.4 + (index % 16) * 0.65 + (index % 3) * 0.2) * 10) / 10;

  const { name: passengerName, phone: passengerPhone } = passengerForIndex(index);

  return {
    id: `ride-${index + 1}`,
    driverId: driver.id,
    partnerId: partner.id,
    city,
    status,
    fare,
    commissionAmount,
    startedAt: startedAt.toISOString(),
    completedAt,
    pickupAddress: `${pickStreet}, ${city}`,
    dropoffAddress: `${dropStreet}, ${city}`,
    startLat,
    startLng,
    endLat,
    endLng,
    distanceKm,
    durationMinutes: durationMins,
    passengerName,
    passengerPhone,
    paymentMethod: PAYMENTS[index % PAYMENTS.length],
    rideType: SERVICES[index % SERVICES.length],
    bookingReference: `BK-${String(index + 1).padStart(5, "0")}`,
    requestedAt: subMinutes(startedAt, 4 + (index % 6)).toISOString(),
    tipAmount:
      status === "COMPLETED" && index % 4 === 0
        ? Math.round((2 + (index % 5)) * 100) / 100
        : undefined,
    cancellationReason:
      status === "CANCELLED"
        ? index % 3 === 0
          ? "Rider cancelled — change of plans"
          : index % 3 === 1
            ? "Driver unavailable — reassigned in production"
            : "Payment authorization failed"
        : undefined
  };
});
