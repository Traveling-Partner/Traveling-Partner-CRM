export type PoolRideCategory =
  | "CAR_PREMIUM"
  | "BIKE"
  | "CITY_TO_CITY"
  | "SHARED"
  | "OUT_OF_CITY"
  | "RICKSHAW"
  | "ECONOMY";

export type PoolVehicleType = "CAR" | "BIKE" | "RICKSHAW";

export type PoolRideStatus =
  | "BOOKED"
  | "DRIVER_ACCEPTED"
  | "DRIVER_ARRIVED"
  | "STARTED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED";

export type PoolBookingStatus = "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";

export type PoolTripType = "ONE_WAY" | "ROUND_TRIP" | "SCHEDULED";

export type PoolPaymentMethod = "CARD" | "CASH" | "WALLET";

export type PoolPaymentStatus = "PAID" | "PENDING" | "REFUNDED" | "FAILED";
export type PoolServiceMode = "POOL_RIDE" | "TAXI_STAND_CAR";

export type PoolRefundStatus = "PROCESSED" | "PENDING" | "NOT_APPLICABLE" | "FAILED";

export type PoolCancelledBy = "DRIVER" | "PASSENGER" | "SYSTEM";

export type PoolTimelineStage =
  | "BOOKED"
  | "DRIVER_ACCEPTED"
  | "DRIVER_ARRIVED"
  | "STARTED"
  | "COMPLETED"
  | "CANCELLED";

export interface PoolRidePerson {
  name: string;
  phone: string;
  email: string;
  photoUrl?: string;
}

export interface PoolRideDriver extends PoolRidePerson {
  id: string;
  rating: number;
  status: "ACTIVE" | "INACTIVE" | "ON_TRIP" | "OFFLINE";
  vehicleNumber: string;
}

export interface PoolCarVehicle {
  vehicleType: "CAR";
  carName: string;
  brand: string;
  model: string;
  color: string;
  registrationNumber: string;
  plateNumber: string;
}

export interface PoolBikeVehicle {
  vehicleType: "BIKE";
  bikeName: string;
  model: string;
  color: string;
  registrationNumber: string;
}

export interface PoolRickshawVehicle {
  vehicleType: "RICKSHAW";
  rickshawNumber: string;
  model: string;
  color: string;
}

export type PoolVehicleDetails = PoolCarVehicle | PoolBikeVehicle | PoolRickshawVehicle;

export interface PoolRideTimelineEvent {
  stage: PoolTimelineStage;
  label: string;
  timestamp?: string;
  completed: boolean;
}

export interface PoolRideCancellation {
  cancelledBy: PoolCancelledBy;
  reason: string;
  cancelledAt: string;
  refundStatus: PoolRefundStatus;
}

export interface PoolRide {
  id: string;
  bookingDate: string;
  passenger: PoolRidePerson;
  driver: PoolRideDriver;
  category: PoolRideCategory;
  rideType: string;
  vehicleType: PoolVehicleType;
  vehicle: PoolVehicleDetails;
  pickupAddress: string;
  destinationAddress: string;
  intermediateStops?: string[];
  fare: number;
  discount: number;
  taxes: number;
  platformFee: number;
  finalAmount: number;
  driverEarnings: number;
  promoCode?: string;
  paymentMethod: PoolPaymentMethod;
  serviceMode: PoolServiceMode;
  paymentStatus: PoolPaymentStatus;
  rideStatus: PoolRideStatus;
  bookingStatus: PoolBookingStatus;
  tripType: PoolTripType;
  estimatedDistanceKm: number;
  actualDistanceKm?: number;
  estimatedTimeMinutes: number;
  actualTimeMinutes?: number;
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
  driverLat?: number;
  driverLng?: number;
  timeline: PoolRideTimelineEvent[];
  cancellation?: PoolRideCancellation;
  reviewRating?: number;
  reviewComment?: string;
}

export interface PoolRideStats {
  totalRides: number;
  bookedRides: number;
  poolRides: number;
  taxiStandCars: number;
  carPremiumRides: number;
  bikeRides: number;
  cityToCityRides: number;
  sharedRides: number;
  outOfCityRides: number;
  completedRides: number;
  cancelledRides: number;
  rickshawRides: number;
  economyRides: number;
}

export type PoolRideSortField =
  | "bookingDate"
  | "passengerName"
  | "driverName"
  | "fare"
  | "rideStatus";

export function computePoolRideStats(rides: PoolRide[]): PoolRideStats {
  return {
    totalRides: rides.length,
    bookedRides: rides.filter((r) => r.rideStatus === "BOOKED").length,
    poolRides: rides.filter((r) => r.serviceMode === "POOL_RIDE").length,
    taxiStandCars: rides.filter((r) => r.serviceMode === "TAXI_STAND_CAR").length,
    carPremiumRides: rides.filter((r) => r.category === "CAR_PREMIUM").length,
    bikeRides: rides.filter((r) => r.vehicleType === "BIKE").length,
    cityToCityRides: rides.filter((r) => r.category === "CITY_TO_CITY").length,
    sharedRides: rides.filter((r) => r.category === "SHARED").length,
    outOfCityRides: rides.filter((r) => r.category === "OUT_OF_CITY").length,
    completedRides: rides.filter((r) => r.rideStatus === "COMPLETED").length,
    cancelledRides: rides.filter((r) => r.rideStatus === "CANCELLED").length,
    rickshawRides: rides.filter((r) => r.vehicleType === "RICKSHAW").length,
    economyRides: rides.filter((r) => r.category === "ECONOMY").length
  };
}
