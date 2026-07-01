import { addMinutes, subDays, subMinutes } from "date-fns";
import type {
  PoolRide,
  PoolRideCategory,
  PoolRideStatus,
  PoolVehicleType,
  PoolVehicleDetails,
  PoolTimelineStage
} from "@/types/pool-ride";

const CITY_CENTER: Record<string, { lat: number; lng: number }> = {
  Dubai: { lat: 25.2048, lng: 55.2708 },
  "Abu Dhabi": { lat: 24.4539, lng: 54.3773 },
  Riyadh: { lat: 24.7136, lng: 46.6753 },
  Doha: { lat: 25.2854, lng: 51.531 },
  Jeddah: { lat: 21.5433, lng: 39.1728 }
};

const CATEGORIES: PoolRideCategory[] = [
  "CAR_PREMIUM",
  "BIKE",
  "CITY_TO_CITY",
  "SHARED",
  "OUT_OF_CITY",
  "RICKSHAW",
  "ECONOMY"
];

const CATEGORY_LABELS: Record<PoolRideCategory, string> = {
  CAR_PREMIUM: "Car Premium",
  BIKE: "Bike Ride",
  CITY_TO_CITY: "City to City Shared Ride",
  SHARED: "In City Shared Ride",
  OUT_OF_CITY: "Out of City",
  RICKSHAW: "Rickshaw Ride",
  ECONOMY: "Economy Ride"
};

const VEHICLE_FOR_CATEGORY: Record<PoolRideCategory, PoolVehicleType> = {
  CAR_PREMIUM: "CAR",
  BIKE: "BIKE",
  CITY_TO_CITY: "CAR",
  SHARED: "CAR",
  OUT_OF_CITY: "CAR",
  RICKSHAW: "RICKSHAW",
  ECONOMY: "CAR"
};

const SERVICE_MODE_FOR_CATEGORY: Record<PoolRideCategory, PoolRide["serviceMode"]> = {
  SHARED: "POOL_RIDE",
  CITY_TO_CITY: "POOL_RIDE",
  OUT_OF_CITY: "POOL_RIDE",
  CAR_PREMIUM: "TAXI_STAND_CAR",
  BIKE: "TAXI_STAND_CAR",
  RICKSHAW: "TAXI_STAND_CAR",
  ECONOMY: "TAXI_STAND_CAR"
};

const FIRST_NAMES = ["Layla", "Omar", "Noor", "Khalid", "Hana", "Youssef", "Amira", "Faisal"];
const LAST_NAMES = ["Al-Mansoori", "Hassan", "Rahman", "Ibrahim", "Saleh", "Nasser"];
const DRIVER_FIRST = ["Ahmed", "Raj", "Hassan", "Vikram", "Samir", "Tariq", "Imran", "Yusuf"];
const DRIVER_LAST = ["Khan", "Ali", "Patel", "Hussain", "Malik", "Sharma"];

function person(index: number, role: "passenger" | "driver") {
  const first = role === "passenger" ? FIRST_NAMES : DRIVER_FIRST;
  const last = role === "passenger" ? LAST_NAMES : DRIVER_LAST;
  const name = `${first[index % first.length]} ${last[index % last.length]}`;
  const phone = `+971 ${50 + (index % 9)} ${100 + (index % 800)} ${2000 + (index % 7000)}`;
  const email = `${name.toLowerCase().replace(/\s+/g, ".")}@example.com`;
  return { name, phone, email };
}

function vehicleFor(index: number, type: PoolVehicleType): PoolVehicleDetails {
  const colors = ["Pearl White", "Midnight Black", "Silver", "Blue", "Red"];
  const color = colors[index % colors.length];

  if (type === "BIKE") {
    return {
      vehicleType: "BIKE",
      bikeName: `CityRider ${100 + (index % 50)}`,
      model: index % 2 === 0 ? "Sport 150" : "Commuter 125",
      color,
      registrationNumber: `BK-${String(10000 + index).slice(-5)}`
    };
  }

  if (type === "RICKSHAW") {
    return {
      vehicleType: "RICKSHAW",
      rickshawNumber: `RK-${String(500 + index).padStart(4, "0")}`,
      model: index % 2 === 0 ? "E-Rick V2" : "Classic Auto",
      color
    };
  }

  const brands = ["Toyota", "Honda", "Hyundai", "Kia", "Nissan"];
  const models = ["Camry", "Accord", "Elantra", "Optima", "Altima"];
  const brand = brands[index % brands.length];
  const model = models[index % models.length];
  return {
    vehicleType: "CAR",
    carName: `${brand} ${model}`,
    brand,
    model,
    color,
    registrationNumber: `REG-${String(20000 + index).slice(-6)}`,
    plateNumber: `${String.fromCharCode(65 + (index % 26))}${1000 + (index % 9000)}`
  };
}

function rideStatusFor(index: number): PoolRideStatus {
  const statuses: PoolRideStatus[] = [
    "BOOKED",
    "DRIVER_ACCEPTED",
    "DRIVER_ARRIVED",
    "STARTED",
    "IN_PROGRESS",
    "COMPLETED",
    "CANCELLED"
  ];
  return statuses[index % statuses.length];
}

function buildTimeline(
  bookingDate: Date,
  status: PoolRideStatus,
  durationMins: number
): PoolRide["timeline"] {
  const allStages: { stage: PoolTimelineStage; label: string; offsetMins: number }[] = [
    { stage: "BOOKED", label: "Ride Booked", offsetMins: 0 },
    { stage: "DRIVER_ACCEPTED", label: "Driver Accepted", offsetMins: 3 },
    { stage: "DRIVER_ARRIVED", label: "Driver Arrived", offsetMins: 12 },
    { stage: "STARTED", label: "Ride Started", offsetMins: 15 },
    { stage: "COMPLETED", label: "Ride Completed", offsetMins: 15 + durationMins }
  ];

  const progressMap: Record<PoolRideStatus, number> = {
    BOOKED: 0,
    DRIVER_ACCEPTED: 1,
    DRIVER_ARRIVED: 2,
    STARTED: 3,
    IN_PROGRESS: 3,
    COMPLETED: 4,
    CANCELLED: -1
  };

  if (status === "CANCELLED") {
    return [
      {
        stage: "BOOKED",
        label: "Ride Booked",
        timestamp: bookingDate.toISOString(),
        completed: true
      },
      {
        stage: "DRIVER_ACCEPTED",
        label: "Driver Accepted",
        timestamp: addMinutes(bookingDate, 4).toISOString(),
        completed: true
      },
      {
        stage: "CANCELLED",
        label: "Ride Cancelled",
        timestamp: addMinutes(bookingDate, 8).toISOString(),
        completed: true
      }
    ];
  }

  const maxIdx = progressMap[status];
  return allStages.map((s, i) => ({
    stage: s.stage,
    label: s.label,
    timestamp: i <= maxIdx ? addMinutes(bookingDate, s.offsetMins).toISOString() : undefined,
    completed: i <= maxIdx
  }));
}

function bookingStatusFor(rideStatus: PoolRideStatus): PoolRide["bookingStatus"] {
  if (rideStatus === "CANCELLED") return "CANCELLED";
  if (rideStatus === "COMPLETED") return "COMPLETED";
  if (rideStatus === "BOOKED") return "PENDING";
  return "CONFIRMED";
}

function paymentStatusFor(rideStatus: PoolRideStatus): PoolRide["paymentStatus"] {
  if (rideStatus === "CANCELLED") return "REFUNDED";
  if (rideStatus === "COMPLETED") return "PAID";
  if (rideStatus === "BOOKED") return "PENDING";
  return "PAID";
}

export const poolRides: PoolRide[] = Array.from({ length: 42 }).map((_, index) => {
  const category = CATEGORIES[index % CATEGORIES.length];
  const vehicleType = VEHICLE_FOR_CATEGORY[category];
  const cityKeys = Object.keys(CITY_CENTER);
  const city = cityKeys[index % cityKeys.length];
  const center = CITY_CENTER[city];

  const bookingDate = subDays(new Date(), index % 20);
  const rideStatus = rideStatusFor(index);
  const durationMins = 18 + (index % 25);
  const estimatedDistanceKm = Math.round((3 + (index % 18) * 0.8) * 10) / 10;
  const isFinished = rideStatus === "COMPLETED" || rideStatus === "CANCELLED";

  const fare = Math.round((12 + (index % 30) * 2.8) * 100) / 100;
  const discount = index % 5 === 0 ? Math.round(fare * 0.1 * 100) / 100 : 0;
  const taxes = Math.round((fare - discount) * 0.05 * 100) / 100;
  const platformFee = Math.round((fare - discount) * 0.12 * 100) / 100;
  const finalAmount = Math.round((fare - discount + taxes) * 100) / 100;
  const driverEarnings = Math.round((finalAmount - platformFee - taxes) * 100) / 100;

  const startLat = center.lat + Math.sin(index * 1.1) * 0.025;
  const startLng = center.lng + Math.cos(index * 0.9) * 0.03;
  const endLat = startLat + 0.02 + (index % 5) * 0.003;
  const endLng = startLng + 0.025 + (index % 4) * 0.004;

  const passenger = person(index, "passenger");
  const driverPerson = person(index + 3, "driver");
  const payments: PoolRide["paymentMethod"][] = ["CARD", "CASH", "WALLET"];
  const tripTypes: PoolRide["tripType"][] = ["ONE_WAY", "ROUND_TRIP", "SCHEDULED"];

  const pickupAddress = `${100 + index} Main Street, ${city}`;
  const destinationAddress = `${200 + index} Central Avenue, ${city}`;

  const driverStatuses: PoolRide["driver"]["status"][] = [
    "ACTIVE",
    "ON_TRIP",
    "OFFLINE",
    "INACTIVE"
  ];

  return {
    id: `pool-${String(index + 1).padStart(4, "0")}`,
    bookingDate: bookingDate.toISOString(),
    passenger: {
      ...passenger,
      photoUrl: undefined
    },
    driver: {
      id: `drv-pool-${index + 1}`,
      ...driverPerson,
      rating: Math.round((3.8 + (index % 12) * 0.1) * 10) / 10,
      status: driverStatuses[index % driverStatuses.length],
      vehicleNumber: vehicleType === "RICKSHAW"
        ? `RK-${500 + index}`
        : vehicleType === "BIKE"
          ? `BK-${10000 + index}`
          : `${String.fromCharCode(65 + (index % 26))}${1000 + index}`
    },
    category,
    rideType: CATEGORY_LABELS[category],
    vehicleType,
    vehicle: vehicleFor(index, vehicleType),
    pickupAddress,
    destinationAddress,
    intermediateStops:
      index % 4 === 0
        ? [`Stop A — ${city} Mall`, `Stop B — ${city} Station`]
        : index % 7 === 0
          ? [`Waypoint — ${city} Plaza`]
          : undefined,
    fare,
    discount,
    taxes,
    platformFee,
    finalAmount,
    driverEarnings,
    promoCode: discount > 0 ? `SAVE10-${index}` : undefined,
    paymentMethod: payments[index % payments.length],
    serviceMode: SERVICE_MODE_FOR_CATEGORY[category],
    paymentStatus: paymentStatusFor(rideStatus),
    rideStatus,
    bookingStatus: bookingStatusFor(rideStatus),
    tripType: tripTypes[index % tripTypes.length],
    estimatedDistanceKm,
    actualDistanceKm: isFinished && rideStatus === "COMPLETED"
      ? Math.round((estimatedDistanceKm + (index % 3) * 0.3) * 10) / 10
      : undefined,
    estimatedTimeMinutes: durationMins,
    actualTimeMinutes:
      rideStatus === "COMPLETED" ? durationMins + (index % 4) - 1 : undefined,
    startLat,
    startLng,
    endLat,
    endLng,
    driverLat:
      rideStatus === "IN_PROGRESS" || rideStatus === "STARTED"
        ? startLat + (endLat - startLat) * 0.45
        : rideStatus === "DRIVER_ARRIVED"
          ? startLat
          : undefined,
    driverLng:
      rideStatus === "IN_PROGRESS" || rideStatus === "STARTED"
        ? startLng + (endLng - startLng) * 0.45
        : rideStatus === "DRIVER_ARRIVED"
          ? startLng
          : undefined,
    timeline: buildTimeline(subMinutes(bookingDate, 2), rideStatus, durationMins),
    reviewRating:
      rideStatus === "COMPLETED" && index % 2 === 0
        ? Number((4 + (index % 10) * 0.08).toFixed(1))
        : undefined,
    reviewComment:
      rideStatus === "COMPLETED" && index % 2 === 0
        ? index % 4 === 0
          ? "Smooth ride and punctual driver."
          : "Clean vehicle and good driving."
        : undefined,
    cancellation:
      rideStatus === "CANCELLED"
        ? {
            cancelledBy: index % 3 === 0 ? "PASSENGER" : index % 3 === 1 ? "DRIVER" : "SYSTEM",
            reason:
              index % 3 === 0
                ? "Passenger changed plans"
                : index % 3 === 1
                  ? "Driver could not reach pickup in time"
                  : "Payment authorization failed",
            cancelledAt: addMinutes(bookingDate, 8).toISOString(),
            refundStatus: index % 2 === 0 ? "PROCESSED" : "PENDING"
          }
        : undefined
  };
});
