import { addDays, subDays } from "date-fns";
import { Agent } from "@/types/domain";
import { agentUsers } from "./users";

export const agents: Agent[] = agentUsers.map((user, index) => {
  const createdAt = subDays(new Date(), 20 - index);
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: `+9715${(2000000 + index).toString().slice(0, 7)}`,
    status: index % 7 === 0 ? "RESTRICTED" : "APPROVED",
    commissionRate: 10 + (index % 5) * 2,
    createdAt: addDays(createdAt, 1).toISOString()
  };
});

