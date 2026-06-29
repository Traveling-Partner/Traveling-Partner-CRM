import { Mail, Phone, Star, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface PersonCardProps {
  title: string;
  name: string;
  phone: string;
  email: string;
  photoUrl?: string;
  rating?: number;
  status?: string;
  extra?: { label: string; value: string }[];
  className?: string;
}

function PersonAvatar({ name, photoUrl }: { name: string; photoUrl?: string }) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  if (photoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={photoUrl}
        alt={name}
        className="h-12 w-12 rounded-xl object-cover ring-2 ring-border/60"
      />
    );
  }

  return (
    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#fce001]/30 to-[#fdb813]/20 text-sm font-bold text-amber-900 dark:text-amber-200 ring-2 ring-amber-500/20">
      {initials || <User className="h-5 w-5" />}
    </div>
  );
}

export function PersonCard({
  title,
  name,
  phone,
  email,
  photoUrl,
  rating,
  status,
  extra,
  className
}: PersonCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border/60 bg-gradient-to-b from-card to-muted/15 p-4 transition-shadow hover:shadow-sm",
        className
      )}
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </p>
      <div className="mt-3 flex items-start gap-3">
        <PersonAvatar name={name} photoUrl={photoUrl} />
        <div className="min-w-0 flex-1">
          <p className="font-heading text-lg font-semibold">{name}</p>
          {rating != null ? (
            <p className="mt-0.5 flex items-center gap-1 text-sm text-amber-600 dark:text-amber-400">
              <Star className="h-3.5 w-3.5 fill-current" />
              <span className="font-semibold tabular-nums">{rating.toFixed(1)}</span>
              <span className="text-muted-foreground">rating</span>
            </p>
          ) : null}
          {status ? (
            <p className="mt-1 text-xs font-medium text-muted-foreground">
              Status: <span className="text-foreground">{status.replace(/_/g, " ")}</span>
            </p>
          ) : null}
          <div className="mt-2 space-y-1">
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Phone className="h-3.5 w-3.5 shrink-0" />
              {phone}
            </p>
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{email}</span>
            </p>
          </div>
          {extra?.length ? (
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {extra.map((item) => (
                <div
                  key={item.label}
                  className="rounded-lg border border-border/50 bg-muted/25 px-2.5 py-1.5"
                >
                  <p className="text-[0.65rem] uppercase text-muted-foreground">{item.label}</p>
                  <p className="text-sm font-medium">{item.value}</p>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
