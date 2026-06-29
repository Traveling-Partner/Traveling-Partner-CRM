import { Bike, Car, Truck } from "lucide-react";
import type { PoolVehicleDetails } from "@/types/pool-ride";

interface VehicleDetailsCardProps {
  vehicle: PoolVehicleDetails;
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border/50 bg-muted/25 px-3 py-2">
      <p className="text-[0.65rem] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-0.5 text-sm font-medium">{value}</p>
    </div>
  );
}

export function VehicleDetailsCard({ vehicle }: VehicleDetailsCardProps) {
  if (vehicle.vehicleType === "BIKE") {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Bike className="h-4 w-4 text-primary" />
          Bike details
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          <Field label="Bike name" value={vehicle.bikeName} />
          <Field label="Model" value={vehicle.model} />
          <Field label="Color" value={vehicle.color} />
          <Field label="Registration number" value={vehicle.registrationNumber} />
        </div>
      </div>
    );
  }

  if (vehicle.vehicleType === "RICKSHAW") {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Truck className="h-4 w-4 text-primary" />
          Rickshaw details
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          <Field label="Rickshaw number" value={vehicle.rickshawNumber} />
          <Field label="Model" value={vehicle.model} />
          <Field label="Color" value={vehicle.color} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
        <Car className="h-4 w-4 text-primary" />
        Car details
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        <Field label="Car name" value={vehicle.carName} />
        <Field label="Brand" value={vehicle.brand} />
        <Field label="Model" value={vehicle.model} />
        <Field label="Color" value={vehicle.color} />
        <Field label="Registration number" value={vehicle.registrationNumber} />
        <Field label="Plate number" value={vehicle.plateNumber} />
      </div>
    </div>
  );
}
