import type { BlogCategory } from "@/services/blog";

/** Frontend-owned blog category names. Sent as a string array (no IDs). */
export const BLOG_CATEGORIES: BlogCategory[] = [
  { id: 1, name: "Booking" },
  { id: 2, name: "Rides" },
  { id: 3, name: "Safety" },
  { id: 4, name: "Payments" },
  { id: 5, name: "Drivers" },
  { id: 6, name: "Services" },
  { id: 7, name: "Delivery" },
  { id: 8, name: "Guides" },
  { id: 9, name: "Cities" },
  { id: 10, name: "Travel" },
  { id: 11, name: "Logistics" },
  { id: 12, name: "Pool Ride" }
];

function canonicalCategoryName(name: string): string {
  const match = BLOG_CATEGORIES.find(
    (category) => category.name.toLowerCase() === name.toLowerCase()
  );
  return match?.name ?? name;
}

/** Normalize selected names for `categoryName: string[]` on create/update. */
export function normalizeCategoryNames(names: string[]): string[] {
  return parseCategoryNames(names);
}

/** Accepts API array `["Drivers", "Partner"]` or legacy comma-separated string. */
export function parseCategoryNames(value?: unknown): string[] {
  const raw: string[] = [];

  if (Array.isArray(value)) {
    for (const item of value) {
      if (typeof item === "string" && item.trim()) raw.push(item.trim());
    }
  } else if (typeof value === "string" && value.trim()) {
    raw.push(
      ...value
        .split(",")
        .map((name) => name.trim())
        .filter(Boolean)
    );
  }

  const seen = new Set<string>();
  const out: string[] = [];
  for (const name of raw) {
    const canonical = canonicalCategoryName(name);
    const key = canonical.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(canonical);
  }
  return out;
}

export function toggleCategoryName(selected: string[], name: string): string[] {
  if (selected.includes(name)) {
    return selected.filter((item) => item !== name);
  }
  return [...selected, name];
}
