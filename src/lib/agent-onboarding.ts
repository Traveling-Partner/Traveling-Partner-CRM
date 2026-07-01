/**
 * UI-only performance enrichment for agent pages.
 *
 * Does NOT call APIs or modify services/hooks in src/services or src/hooks/queries.
 * Real agent list/detail still comes from useAgentsListQuery / useAgentDetailQuery.
 * Functions here only add demo stats (drivers, passengers, commissions) until backend endpoints exist.
 */
import {
  agentPerformanceCommissions,
  agentPerformanceDrivers,
  agentPerformancePassengers,
  AGENT_MOCK_SLOTS,
  getStaticJoiningDate
} from "@/mock-data/agent-performance";
import type { AgentRow } from "@/services/users";
import type { Commission, Driver, Partner } from "@/types/domain";

export type AgentPerformanceRow = AgentRow & {
  driverCount: number;
  passengerCount: number;
  totalCommission: number;
  paidAmount: number;
  remainingAmount: number;
  lastPaymentDate: string | null;
  joiningDate: string | null;
};

export function normalizeAgentId(id: string | number): string {
  return String(id);
}

/** Map any API agent id to a stable demo slot (1–8). */
export function resolveAgentMockSlot(agentId: string | number): number {
  const raw = normalizeAgentId(agentId);

  if (raw.startsWith("agent-")) {
    const parsed = Number.parseInt(raw.replace("agent-", ""), 10);
    if (!Number.isNaN(parsed) && parsed > 0) {
      return ((parsed - 1) % AGENT_MOCK_SLOTS) + 1;
    }
  }

  const numeric = Number(raw);
  if (!Number.isNaN(numeric) && numeric > 0) {
    return ((numeric - 1) % AGENT_MOCK_SLOTS) + 1;
  }

  return 1;
}

export function resolveAgentMockKey(agentId: string | number): string {
  return `agent-${resolveAgentMockSlot(agentId)}`;
}

export function getAgentDrivers(agentId: string | number): Driver[] {
  const mockKey = resolveAgentMockKey(agentId);
  return agentPerformanceDrivers.filter((d) => d.createdByAgentId === mockKey);
}

export function getAgentPartners(agentId: string | number): Partner[] {
  const mockKey = resolveAgentMockKey(agentId);
  return agentPerformancePassengers.filter((p) => p.createdByAgentId === mockKey);
}

export function getAgentCommissions(agentId: string | number): Commission[] {
  const mockKey = resolveAgentMockKey(agentId);
  return agentPerformanceCommissions.filter((c) => c.agentId === mockKey);
}

export function getAgentPaymentSummary(agentId: string | number) {
  const agentCommissions = getAgentCommissions(agentId);
  const total = agentCommissions.reduce((sum, c) => sum + c.amount, 0);
  const paid = agentCommissions
    .filter((c) => c.status === "PAID")
    .reduce((sum, c) => sum + c.amount, 0);
  const remaining = total - paid;

  return { total, paid, remaining, commissions: agentCommissions };
}

export function getAgentJoiningDate(
  agentId: string | number,
  /** Use API value when the backend provides it (e.g. createdAt). */
  apiJoiningDate?: string | null
): string | null {
  if (apiJoiningDate) return apiJoiningDate;
  return getStaticJoiningDate(resolveAgentMockSlot(agentId));
}

export function getAgentLastPaymentDate(agentId: string | number): string | null {
  const lastPaid = getAgentCommissions(agentId)
    .filter((c) => c.status === "PAID")
    .sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )[0];

  return lastPaid?.createdAt ?? null;
}

/** Merges API agent row with mock-only performance fields. API fields are never overwritten. */
export function buildAgentPerformanceRow(
  agent: AgentRow & { createdAt?: string | null }
): AgentPerformanceRow {
  const payment = getAgentPaymentSummary(agent.id);

  return {
    ...agent,
    driverCount: getAgentDrivers(agent.id).length,
    passengerCount: getAgentPartners(agent.id).length,
    totalCommission: payment.total,
    paidAmount: payment.paid,
    remainingAmount: payment.remaining,
    lastPaymentDate: getAgentLastPaymentDate(agent.id),
    joiningDate: getAgentJoiningDate(agent.id, agent.createdAt)
  };
}

export function formatAgentDate(value: string | null | undefined): string {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
}

/** Map performance entity ids to driver/partner detail routes. */
export function extractNumericEntityId(entityId: string): string {
  const perfMatch = entityId.match(/^perf-(?:driver|passenger)-\d+-(\d+)$/);
  if (perfMatch) return perfMatch[1];

  const match = entityId.match(/(\d+)$/);
  return match ? match[1] : entityId;
}

export const formatAgentCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(value);
