import type { BlogCategory } from "@/services/blog";

/** Frontend-owned blog categories. Sent with create/update as categoryId + categoryName. */
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

export const DEFAULT_BLOG_CATEGORY_ID = BLOG_CATEGORIES[0]?.id ?? 1;

export function getBlogCategoryName(id: number): string {
  return BLOG_CATEGORIES.find((category) => category.id === id)?.name ?? BLOG_CATEGORIES[0]?.name ?? "";
}

export function resolveBlogCategoryId(categoryId?: number | null, categoryName?: string | null): number {
  const byName = categoryName?.trim().toLowerCase();
  if (byName) {
    const match = BLOG_CATEGORIES.find((category) => category.name.toLowerCase() === byName);
    if (match) return match.id;
  }
  if (typeof categoryId === "number" && BLOG_CATEGORIES.some((category) => category.id === categoryId)) {
    return categoryId;
  }
  return DEFAULT_BLOG_CATEGORY_ID;
}
