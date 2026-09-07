import { format, subDays } from "date-fns";
import type {
  DashboardCityCount,
  DashboardDocumentsPending,
  DashboardFarePoint,
  DashboardOutcomePoint,
  DashboardRideFunnel
} from "@/services/admin-dashboard";

function last14DayLabels() {
  return Array.from({ length: 14 }, (_, index) =>
    format(subDays(new Date(), 13 - index), "MMM d")
  );
}

/** Placeholder ops-chart data until the dedicated dashboard APIs exist. */
export const DEMO_RIDE_FUNNEL: DashboardRideFunnel = {
  stages: [
    { status: "REQUESTED", count: 420 },
    { status: "COUNTER_OFFERED", count: 312 },
    { status: "ACCEPTED", count: 268 },
    { status: "DRIVER_ON_THE_WAY", count: 241 },
    { status: "DRIVER_ARRIVED", count: 228 },
    { status: "PARTNER_COMING", count: 214 },
    { status: "RIDE_STARTED", count: 198 },
    { status: "COMPLETED", count: 176 }
  ],
  canceled: 62,
  expired: 18
};

export const DEMO_OUTCOME_TREND: DashboardOutcomePoint[] = last14DayLabels().map(
  (day, index) => ({
    day,
    completed: [48, 52, 41, 63, 58, 71, 66, 54, 61, 77, 69, 73, 81, 74][index],
    canceled: [9, 7, 11, 8, 6, 10, 12, 8, 7, 9, 5, 8, 11, 6][index]
  })
);

export const DEMO_FARE_TREND: DashboardFarePoint[] = last14DayLabels().map((day, index) => ({
  day,
  amount: [
    186000, 214500, 168000, 241000, 229500, 278000, 256000, 198500, 221000, 302000, 267500,
    284000, 318000, 291500
  ][index]
}));

export const DEMO_RIDES_BY_CITY: DashboardCityCount[] = [
  { city: "Lahore", count: 186 },
  { city: "Karachi", count: 154 },
  { city: "Islamabad", count: 97 },
  { city: "Rawalpindi", count: 64 },
  { city: "Faisalabad", count: 41 },
  { city: "Multan", count: 28 },
  { city: "Peshawar", count: 21 },
  { city: "Quetta", count: 12 }
];

export const DEMO_DOCUMENTS_PENDING: DashboardDocumentsPending = {
  driverCnic: 18,
  driverLicense: 11,
  vehicle: 9,
  partnerCnic: 7
};
