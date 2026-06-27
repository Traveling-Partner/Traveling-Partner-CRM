import type { NewsletterRow } from "@/services/newsletter-list";

/** Published newsletter snapshots — mirrors NewsletterRow fields for subscriber send history. */
export const publishedNewsletterCatalog: Pick<
  NewsletterRow,
  "id" | "message" | "status"
>[] = [
  {
    id: 101,
    message: "March travel updates: new routes, partner perks, and safety reminders for drivers.",
    status: "PUBLISHED"
  },
  {
    id: 102,
    message: "April newsletter — summer booking trends and commission highlights for agents.",
    status: "PUBLISHED"
  },
  {
    id: 103,
    message: "Platform maintenance window and improved document verification workflow.",
    status: "PUBLISHED"
  },
  {
    id: 104,
    message: "Holiday season promotions and fleet incentive program announcement.",
    status: "PUBLISHED"
  },
  {
    id: 105,
    message: "Q1 partner spotlight and new vehicle type rollouts across major cities.",
    status: "PUBLISHED"
  },
  {
    id: 106,
    message: "Weekly digest: top-performing drivers and customer satisfaction scores.",
    status: "PUBLISHED"
  }
];
