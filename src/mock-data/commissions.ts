import { subMonths } from "date-fns";
import { Commission } from "@/types/domain";
import { agents } from "./agents";

const statuses: Commission["status"][] = ["PENDING", "PAID"];

export const commissions: Commission[] = agents.flatMap((agent, agentIndex) =>
  Array.from({ length: 6 }).map((_, monthIndex) => {
    const monthDate = subMonths(new Date(), monthIndex);
    const month = `${monthDate.getFullYear()}-${String(
      monthDate.getMonth() + 1
    ).padStart(2, "0")}`;

    return {
      id: `commission-${agentIndex + 1}-${monthIndex + 1}`,
      agentId: agent.id,
      amount: 2500 + agentIndex * 150 + monthIndex * 80,
      month,
      status: statuses[(agentIndex + monthIndex) % statuses.length],
      createdAt: monthDate.toISOString()
    };
  })
);

