"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

const SKIP_SEGMENTS = new Set([
  "admin",
  "agent",
  "sales-manager",
  "marketing-manager",
  "manager"
]);

const SEGMENT_LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  "pool-rides": "Pool Ride",
  drivers: "Drivers",
  passengers: "Passengers",
  partners: "Partners",
  agents: "Agents",
  "agent-performance": "Agent Performance",
  documents: "Documents",
  blog: "Blog",
  newsletter: "Newsletter",
  "newsletter-subscribers": "Newsletter Subscribers",
  carousel: "Carousel",
  "tax-management": "Tax Management",
  "commission-management": "Commission Management",
  "insurance-management": "Insurance Management",
  "platform-fee-management": "Platform Fee Management",
  "vehicle-types": "Vehicle Types",
  "vehicle-models": "Vehicle Models",
  "vehicle-colors": "Vehicle Colors",
  "vehicle-brands": "Vehicle Brands",
  settings: "Settings",
  commissions: "Commissions",
  create: "Create",
  edit: "Edit",
  listings: "My Listings",
  profile: "Profile",
  financial: "Financial Management",
  payments: "Payments",
  transactions: "Transactions",
  invoices: "Invoices",
  reports: "Reports",
  content: "Content",
  calendar: "Calendar",
  media: "Media Library",
  analytics: "Analytics",
  users: "Users",
  notifications: "Notifications",
  safety: "Safety Center",
  incidents: "SOS Incidents",
  services: "Emergency Services"
};

const GROUP_BY_SEGMENT: Record<string, string> = {
  drivers: "User Management",
  partners: "User Management",
  documents: "User Management",
  agents: "Agent Management",
  "agent-performance": "Agent Management",
  blog: "Content Management",
  newsletter: "Content Management",
  "newsletter-subscribers": "Content Management",
  carousel: "Content Management",
  content: "Content Management",
  calendar: "Content Management",
  media: "Content Management",
  analytics: "Content Management",
  "tax-management": "Financial Management",
  "commission-management": "Financial Management",
  "insurance-management": "Financial Management",
  "platform-fee-management": "Financial Management",
  financial: "Financial Management",
  payments: "Financial Management",
  transactions: "Financial Management",
  invoices: "Financial Management",
  reports: "Financial Management",
  commissions: "Commission Management",
  users: "User Management",
  "vehicle-types": "Vehicle Management",
  "vehicle-models": "Vehicle Management",
  "vehicle-colors": "Vehicle Management",
  "vehicle-brands": "Vehicle Management",
  settings: "System",
  safety: "Safety Center",
  incidents: "Safety Center",
  services: "Safety Center"
};

function toTitle(segment: string): string {
  if (/^\d+$/.test(segment)) return segment;
  return (
    SEGMENT_LABELS[segment] ??
    segment
      .split("-")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ")
  );
}

export function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 0) {
    return null;
  }

  const rolePrefix =
    segments[0] === "admin" ||
    segments[0] === "agent" ||
    segments[0] === "sales-manager" ||
    segments[0] === "marketing-manager" ||
    segments[0] === "manager"
      ? segments[0]
      : null;
  const visibleSegments = segments.filter((segment) => !SKIP_SEGMENTS.has(segment));

  const items: Array<{ label: string; href?: string; isLast: boolean }> = [];
  let groupInserted = false;

  visibleSegments.forEach((segment, index) => {
    const groupLabel = GROUP_BY_SEGMENT[segment];
    if (groupLabel && !groupInserted) {
      items.push({ label: groupLabel, isLast: false });
      groupInserted = true;
    }

    const hrefSegments = rolePrefix
      ? [rolePrefix, ...visibleSegments.slice(0, index + 1)]
      : visibleSegments.slice(0, index + 1);

    items.push({
      label: toTitle(segment),
      href: "/" + hrefSegments.join("/"),
      isLast: index === visibleSegments.length - 1
    });
  });

  return (
    <nav className="flex items-center text-xs text-muted-foreground" aria-label="Breadcrumb">
      <ol className="breadcrumb-list inline-flex list-none flex-wrap items-center gap-1 pl-0">
        <li>
          <Link
            href="/"
            className="flex items-center gap-1 transition-colors duration-150 hover:text-foreground"
          >
            <Home className="h-3 w-3" />
            <span className="sr-only sm:not-sr-only">Home</span>
          </Link>
        </li>
        {items.map((item, index) => (
          <li key={`${item.label}-${index}`} className="flex items-center gap-1">
            <ChevronRight className="h-3 w-3 shrink-0 opacity-40" aria-hidden />
            {item.isLast || !item.href ? (
              <span className="font-semibold text-foreground">{item.label}</span>
            ) : (
              <Link
                href={item.href}
                className="transition-colors duration-150 hover:text-foreground"
              >
                {item.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
