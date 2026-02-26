"use client";

import { AppShell } from "@/components/layout/AppShell";
import { PageContainer } from "@/components/common/PageContainer";
import { SectionCard } from "@/components/common/SectionCard";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { drivers } from "@/mock-data/drivers";
import { partners } from "@/mock-data/partners";
import { agents } from "@/mock-data/agents";
import { rides } from "@/mock-data/rides";
import { commissions } from "@/mock-data/commissions";
import { auditLogs } from "@/mock-data/audit-logs";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid
} from "recharts";
import { format, parseISO } from "date-fns";

const currency = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(value);

function buildRidesTrend() {
  const grouped = new Map<string, number>();
  rides.forEach((ride) => {
    const day = format(parseISO(ride.startedAt), "MMM d");
    grouped.set(day, (grouped.get(day) ?? 0) + 1);
  });
  return Array.from(grouped.entries()).map(([day, count]) => ({
    day,
    count
  }));
}

function buildCommissionByAgent() {
  const grouped = new Map<string, number>();
  commissions.forEach((c) => {
    grouped.set(c.agentId, (grouped.get(c.agentId) ?? 0) + c.amount);
  });
  return agents.map((agent) => ({
    name: agent.name,
    total: Math.round(grouped.get(agent.id) ?? 0)
  }));
}

export default function AdminDashboardPage() {
  const totalDrivers = drivers.length;
  const totalPartners = partners.length;
  const totalAgents = agents.length;
  const totalRides = rides.length;
  const totalRevenue = rides.reduce((acc, r) => acc + r.fare, 0);
  const totalCommission = rides.reduce(
    (acc, r) => acc + r.commissionAmount,
    0
  );
  const activeDrivers = drivers.filter((d) => d.status === "APPROVED").length;
  const suspendedDrivers = drivers.filter(
    (d) => d.status === "SUSPENDED"
  ).length;

  const ridesTrend = buildRidesTrend();
  const commissionByAgent = buildCommissionByAgent();

  const recentActivity = auditLogs
    .slice(0, 8)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

  return (
    <AppShell title="Admin Dashboard">
      <PageContainer>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Card className="bg-gradient-to-b from-[#fce001] to-[#fdb813] text-slate-900 shadow-md">
            <CardContent className="space-y-2 pt-4">
              <p className="text-xs font-medium uppercase tracking-wide">
                Total Drivers
              </p>
              <p className="text-2xl font-heading font-semibold">
                {totalDrivers}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-b from-[#fce001] to-[#fdb813] text-slate-900 shadow-md">
            <CardContent className="space-y-2 pt-4">
              <p className="text-xs font-medium uppercase tracking-wide">
                Total Partners
              </p>
              <p className="text-2xl font-heading font-semibold">
                {totalPartners}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-b from-[#fce001] to-[#fdb813] text-slate-900 shadow-md">
            <CardContent className="space-y-2 pt-4">
              <p className="text-xs font-medium uppercase tracking-wide">
                Total Agents
              </p>
              <p className="text-2xl font-heading font-semibold">
                {totalAgents}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-b from-[#fce001] to-[#fdb813] text-slate-900 shadow-md">
            <CardContent className="space-y-2 pt-4">
              <p className="text-xs font-medium uppercase tracking-wide">
                Total Rides
              </p>
              <p className="text-2xl font-heading font-semibold">
                {totalRides}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="space-y-1 pt-4">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Revenue
              </p>
              <p className="text-xl font-heading font-semibold">
                {currency(totalRevenue)}
              </p>
              <p className="text-xs text-muted-foreground">
                Gross fares across all completed rides.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="space-y-1 pt-4">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Commissions
              </p>
              <p className="text-xl font-heading font-semibold">
                {currency(totalCommission)}
              </p>
              <p className="text-xs text-muted-foreground">
                Estimated commission captured by the platform.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="space-y-3 pt-4">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Active vs Suspended
              </p>
              <div className="flex items-center justify-between text-sm">
                <span>Active drivers</span>
                <StatusBadge status="APPROVED" />
                <span className="font-semibold">{activeDrivers}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Suspended drivers</span>
                <StatusBadge status="SUSPENDED" />
                <span className="font-semibold">{suspendedDrivers}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          <SectionCard
            title="Rides trend"
            description="Daily ride volume across your active markets."
            className="lg:col-span-2"
          >
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={ridesTrend}>
                  <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                  <XAxis dataKey="day" tickMargin={8} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#fdb813"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </SectionCard>

          <SectionCard
            title="Commission by agent"
            description="Top-line commission contribution per sales agent."
          >
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={commissionByAgent}>
                  <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.15} />
                  <XAxis dataKey="name" tickMargin={8} hide />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="total" fill="#fce001" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </SectionCard>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <SectionCard
            title="Recent activity"
            description="Key administrative events across drivers, partners, and agents."
          >
            <div className="space-y-3">
              {recentActivity.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/40 px-3 py-2 text-xs"
                >
                  <div>
                    <p className="font-medium">{log.action}</p>
                    <p className="text-[0.7rem] text-muted-foreground">
                      {log.entityType} • {log.entityId}
                    </p>
                  </div>
                  <span className="text-[0.7rem] text-muted-foreground">
                    {format(parseISO(log.createdAt), "MMM d, HH:mm")}
                  </span>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      </PageContainer>
    </AppShell>
  );
}

