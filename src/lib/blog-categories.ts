import type { BlogCategory } from "@/services/blog";

/** Frontend-owned blog category names. Sent as a comma-separated string (no IDs). */
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

export function joinCategoryNames(names: string[]): string {
  return names.map((name) => name.trim()).filter(Boolean).join(", ");
}

export function parseCategoryNames(value?: string | null): string[] {
  if (!value?.trim()) return [];
  const allowed = new Set(BLOG_CATEGORIES.map((category) => category.name.toLowerCase()));
  return value
    .split(",")
    .map((name) => name.trim())
    .filter(Boolean)
    .filter((name) => allowed.has(name.toLowerCase()))
    .map((name) => BLOG_CATEGORIES.find((category) => category.name.toLowerCase() === name.toLowerCase())?.name ?? name);
}

export function toggleCategoryName(selected: string[], name: string): string[] {
  if (selected.includes(name)) {
    return selected.filter((item) => item !== name);
  }
  return [...selected, name];
}
