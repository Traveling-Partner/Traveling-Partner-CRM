"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

function toTitle(segment: string): string {
  return segment
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 0) {
    return null;
  }

  const items = segments.map((segment, index) => {
    const href = "/" + segments.slice(0, index + 1).join("/");
    const isLast = index === segments.length - 1;

    return {
      label: toTitle(segment),
      href,
      isLast
    };
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
        {items.map((item) => (
          <li key={item.href} className="flex items-center gap-1">
            <ChevronRight className="h-3 w-3 shrink-0 opacity-40" aria-hidden />
            {item.isLast ? (
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
