export type CarouselStatus = "DRAFT" | "PUBLISHED" | "INACTIVE";

export interface AppCarouselSlide {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  status: CarouselStatus;
  updatedAt: string;
}

export const appCarouselSlides: AppCarouselSlide[] = [
  {
    id: "slide-1",
    title: "Ride Faster in Downtown",
    description: "Get matched with nearby drivers in under 2 minutes during peak hours.",
    imageUrl:
      "https://images.unsplash.com/photo-1549924231-f129b911e442?auto=format&fit=crop&w=1200&q=80",
    status: "PUBLISHED",
    updatedAt: "2026-04-10T08:30:00.000Z"
  },
  {
    id: "slide-2",
    title: "Weekend Airport Promo",
    description: "Enjoy discounted airport drops for all weekend pre-booked rides.",
    imageUrl:
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80",
    status: "DRAFT",
    updatedAt: "2026-04-11T11:15:00.000Z"
  },
  {
    id: "slide-3",
    title: "Safety First",
    description: "Track ride route in real-time and share trip details with trusted contacts.",
    imageUrl:
      "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=1200&q=80",
    status: "INACTIVE",
    updatedAt: "2026-04-09T14:20:00.000Z"
  }
];
