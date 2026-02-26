import { User } from "@/types/domain";

export const adminUsers: User[] = [
  {
    id: "admin-1",
    name: "Admin User",
    email: "admin@demo.com",
    role: "ADMIN"
  },
  {
    id: "admin-2",
    name: "Operations Lead",
    email: "ops.lead@demo.com",
    role: "ADMIN"
  }
];

export const agentUsers: User[] = Array.from({ length: 8 }).map((_, index) => {
  const id = `agent-${index + 1}`;
  return {
    id,
    name: `Sales Agent ${index + 1}`,
    email: `agent${index + 1}@demo.com`,
    role: "AGENT" as const
  };
});

export const allUsers: User[] = [...adminUsers, ...agentUsers];

