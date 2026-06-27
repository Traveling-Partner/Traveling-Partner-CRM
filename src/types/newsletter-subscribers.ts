export type NewsletterSubscriberStatus = "ACTIVE" | "UNSUBSCRIBED";

export interface SentNewsletterRecord {
  newsletterId: number;
  message: string | null;
  sentAt: string;
}

export interface NewsletterSubscriber {
  id: string;
  name: string | null;
  email: string;
  subscriptionDate: string;
  status: NewsletterSubscriberStatus;
  sentNewsletters: SentNewsletterRecord[];
}

export function getTotalNewslettersReceived(subscriber: NewsletterSubscriber): number {
  return subscriber.sentNewsletters.length;
}

export function getLastNewsletterReceived(subscriber: NewsletterSubscriber): string | null {
  if (subscriber.sentNewsletters.length === 0) return null;

  return subscriber.sentNewsletters.reduce((latest, record) => {
    return new Date(record.sentAt) > new Date(latest) ? record.sentAt : latest;
  }, subscriber.sentNewsletters[0].sentAt);
}
