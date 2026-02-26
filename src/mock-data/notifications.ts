import { subDays, subMinutes } from "date-fns";
import { Notification } from "@/types/domain";
import { allUsers } from "./users";

const titles = [
  "Document verification required",
  "New driver onboarded",
  "Commission statement ready",
  "Partner contract expiring",
  "System maintenance window"
];

export const notifications: Notification[] = Array.from({ length: 24 }).map(
  (_, index) => {
    const user = allUsers[index % allUsers.length];
    const createdAt = subMinutes(subDays(new Date(), index % 7), index * 5);

    return {
      id: `notification-${index + 1}`,
      title: titles[index % titles.length],
      body:
        "This is a mock notification message providing context about recent activity in the Traveling Partner Portal.",
      createdAt: createdAt.toISOString(),
      read: index % 3 === 0,
      userId: user.id
    };
  }
);

