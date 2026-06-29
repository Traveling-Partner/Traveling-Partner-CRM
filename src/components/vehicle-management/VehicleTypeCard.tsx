import { Pencil, Trash2, Users, BriefcaseBusiness } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VehicleTypeCardProps {
  name: string;
  image: string;
  passengerCapacity: number;
  luggageCapacity: number;
  serviceLevel: string;
  energyType: string;
  onEdit: () => void;
  onDelete: () => void;
}

export function VehicleTypeCard({
  name,
  image,
  passengerCapacity,
  luggageCapacity,
  serviceLevel,
  energyType,
  onEdit,
  onDelete
}: VehicleTypeCardProps) {
  return (
    <article className="group relative overflow-hidden rounded-xl border border-border/70 bg-card shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-xl">
      <div className="relative h-44 w-full overflow-hidden">
        <img
          src={image}
          alt={name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={(event) => {
            event.currentTarget.src =
              "https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg?auto=compress&cs=tinysrgb&w=1200";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        <div className="absolute right-3 top-3 flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
          <Button
            type="button"
            size="icon"
            variant="secondary"
            className="h-8 w-8"
            aria-label={`Edit ${name}`}
            onClick={onEdit}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            size="icon"
            variant="destructive"
            className="h-8 w-8"
            aria-label={`Delete ${name}`}
            onClick={onDelete}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="space-y-3 p-4">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-base font-semibold">{name}</h3>
          <span className="rounded-full border border-border/70 bg-muted/50 px-2.5 py-1 text-xs font-medium">
            {serviceLevel}
          </span>
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5" />
            {passengerCapacity} seats
          </span>
          <span className="inline-flex items-center gap-1.5">
            <BriefcaseBusiness className="h-3.5 w-3.5" />
            {luggageCapacity} bags
          </span>
        </div>
        <p className="text-xs text-muted-foreground">{energyType}</p>
      </div>
    </article>
  );
}
