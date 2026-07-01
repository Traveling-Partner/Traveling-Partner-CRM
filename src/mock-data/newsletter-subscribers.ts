import { publishedNewsletterCatalog } from "@/mock-data/published-newsletter-catalog";
import type { NewsletterSubscriber } from "@/types/newsletter-subscribers";

function sentFromCatalog(
  newsletterId: number,
  sentAt: string
): NewsletterSubscriber["sentNewsletters"][number] {
  const newsletter = publishedNewsletterCatalog.find((item) => item.id === newsletterId);
  return {
    newsletterId,
    message: newsletter?.message ?? null,
    sentAt
  };
}

export const newsletterSubscribers: NewsletterSubscriber[] = [
  {
    id: "sub-1",
    name: "Ayesha Khan",
    email: "ayesha.khan@example.com",
    subscriptionDate: "2024-11-12T09:15:00.000Z",
    status: "ACTIVE",
    sentNewsletters: [
      sentFromCatalog(101, "2025-03-02T10:00:00.000Z"),
      sentFromCatalog(102, "2025-04-05T10:00:00.000Z"),
      sentFromCatalog(104, "2025-12-01T10:00:00.000Z"),
      sentFromCatalog(106, "2026-01-20T10:00:00.000Z")
    ]
  },
  {
    id: "sub-2",
    name: "Bilal Ahmed",
    email: "bilal.ahmed@example.com",
    subscriptionDate: "2025-01-08T14:30:00.000Z",
    status: "ACTIVE",
    sentNewsletters: [
      sentFromCatalog(101, "2025-03-02T10:00:00.000Z"),
      sentFromCatalog(103, "2025-05-10T10:00:00.000Z"),
      sentFromCatalog(105, "2026-02-14T10:00:00.000Z")
    ]
  },
  {
    id: "sub-3",
    name: null,
    email: "travel.updates@mailinator.com",
    subscriptionDate: "2025-02-20T11:45:00.000Z",
    status: "ACTIVE",
    sentNewsletters: [
      sentFromCatalog(102, "2025-04-05T10:00:00.000Z"),
      sentFromCatalog(106, "2026-01-20T10:00:00.000Z")
    ]
  },
  {
    id: "sub-4",
    name: "Sara Malik",
    email: "sara.malik@example.com",
    subscriptionDate: "2024-09-03T08:00:00.000Z",
    status: "UNSUBSCRIBED",
    sentNewsletters: [
      sentFromCatalog(101, "2025-03-02T10:00:00.000Z"),
      sentFromCatalog(102, "2025-04-05T10:00:00.000Z")
    ]
  },
  {
    id: "sub-5",
    name: "Hassan Raza",
    email: "hassan.raza@example.com",
    subscriptionDate: "2025-06-18T16:20:00.000Z",
    status: "ACTIVE",
    sentNewsletters: [
      sentFromCatalog(103, "2025-05-10T10:00:00.000Z"),
      sentFromCatalog(104, "2025-12-01T10:00:00.000Z"),
      sentFromCatalog(105, "2026-02-14T10:00:00.000Z"),
      sentFromCatalog(106, "2026-01-20T10:00:00.000Z")
    ]
  },
  {
    id: "sub-6",
    name: "Fatima Noor",
    email: "fatima.noor@example.com",
    subscriptionDate: "2025-08-01T12:10:00.000Z",
    status: "UNSUBSCRIBED",
    sentNewsletters: [sentFromCatalog(104, "2025-12-01T10:00:00.000Z")]
  },
  {
    id: "sub-7",
    name: "Omar Siddiqui",
    email: "omar.siddiqui@example.com",
    subscriptionDate: "2025-10-15T07:55:00.000Z",
    status: "ACTIVE",
    sentNewsletters: [sentFromCatalog(105, "2026-02-14T10:00:00.000Z")]
  },
  {
    id: "sub-8",
    name: null,
    email: "newsletter.reader@gmail.com",
    subscriptionDate: "2025-11-22T18:40:00.000Z",
    status: "ACTIVE",
    sentNewsletters: [
      sentFromCatalog(105, "2026-02-14T10:00:00.000Z"),
      sentFromCatalog(106, "2026-01-20T10:00:00.000Z")
    ]
  },
  {
    id: "sub-9",
    name: "Zainab Ali",
    email: "zainab.ali@example.com",
    subscriptionDate: "2024-12-30T13:25:00.000Z",
    status: "ACTIVE",
    sentNewsletters: [
      sentFromCatalog(101, "2025-03-02T10:00:00.000Z"),
      sentFromCatalog(102, "2025-04-05T10:00:00.000Z"),
      sentFromCatalog(103, "2025-05-10T10:00:00.000Z"),
      sentFromCatalog(104, "2025-12-01T10:00:00.000Z"),
      sentFromCatalog(105, "2026-02-14T10:00:00.000Z"),
      sentFromCatalog(106, "2026-01-20T10:00:00.000Z")
    ]
  },
  {
    id: "sub-10",
    name: "Imran Qureshi",
    email: "imran.qureshi@example.com",
    subscriptionDate: "2026-01-05T10:05:00.000Z",
    status: "ACTIVE",
    sentNewsletters: []
  },
  {
    id: "sub-11",
    name: "Nadia Hussain",
    email: "nadia.hussain@example.com",
    subscriptionDate: "2025-03-14T08:20:00.000Z",
    status: "ACTIVE",
    sentNewsletters: [sentFromCatalog(101, "2025-03-15T10:00:00.000Z")]
  },
  {
    id: "sub-12",
    name: "Kamran Shah",
    email: "kamran.shah@example.com",
    subscriptionDate: "2025-04-22T16:45:00.000Z",
    status: "UNSUBSCRIBED",
    sentNewsletters: [sentFromCatalog(102, "2025-04-23T10:00:00.000Z")]
  },
  {
    id: "sub-13",
    name: "Mehwish Tariq",
    email: "mehwish.tariq@example.com",
    subscriptionDate: "2025-05-30T11:30:00.000Z",
    status: "ACTIVE",
    sentNewsletters: [
      sentFromCatalog(103, "2025-05-31T10:00:00.000Z"),
      sentFromCatalog(104, "2025-12-01T10:00:00.000Z")
    ]
  },
  {
    id: "sub-14",
    name: null,
    email: "updates@travelpartner.io",
    subscriptionDate: "2025-07-12T09:00:00.000Z",
    status: "ACTIVE",
    sentNewsletters: [sentFromCatalog(104, "2025-12-01T10:00:00.000Z")]
  },
  {
    id: "sub-15",
    name: "Rashid Mehmood",
    email: "rashid.mehmood@example.com",
    subscriptionDate: "2025-08-25T14:15:00.000Z",
    status: "ACTIVE",
    sentNewsletters: [
      sentFromCatalog(105, "2026-02-14T10:00:00.000Z"),
      sentFromCatalog(106, "2026-01-20T10:00:00.000Z")
    ]
  },
  {
    id: "sub-16",
    name: "Sana Iqbal",
    email: "sana.iqbal@example.com",
    subscriptionDate: "2025-09-18T10:40:00.000Z",
    status: "UNSUBSCRIBED",
    sentNewsletters: []
  },
  {
    id: "sub-17",
    name: "Tariq Jamil",
    email: "tariq.jamil@example.com",
    subscriptionDate: "2025-10-02T07:25:00.000Z",
    status: "ACTIVE",
    sentNewsletters: [sentFromCatalog(106, "2026-01-20T10:00:00.000Z")]
  },
  {
    id: "sub-18",
    name: "Hina Sheikh",
    email: "hina.sheikh@example.com",
    subscriptionDate: "2025-11-08T13:55:00.000Z",
    status: "ACTIVE",
    sentNewsletters: [
      sentFromCatalog(101, "2025-03-02T10:00:00.000Z"),
      sentFromCatalog(105, "2026-02-14T10:00:00.000Z")
    ]
  }
];

export function getNewsletterSubscriberById(id: string): NewsletterSubscriber | undefined {
  return newsletterSubscribers.find((subscriber) => subscriber.id === id);
}
