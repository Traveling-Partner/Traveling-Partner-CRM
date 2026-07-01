"use client";

import { useMemo } from "react";
import {
  Car,
  CheckCircle2,
  Search,
  Share2,
  Timer,
  CarTaxiFront,
  XCircle
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageContainer } from "@/components/common/PageContainer";
import { SectionCard } from "@/components/common/SectionCard";
import { EmptyState } from "@/components/common/EmptyState";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { PaginationControls } from "@/components/vehicle-management/PaginationControls";
import { PoolRideStatCard } from "@/components/pool-rides/PoolRideStatCard";
import { PoolRideResponsiveTable } from "@/components/pool-rides/PoolRideResponsiveTable";
import { usePoolRidesMock } from "@/hooks/pool-rides/usePoolRidesMock";
import { poolRides } from "@/mock-data/pool-rides";
import { computePoolRideStats } from "@/types/pool-ride";

function PoolRideTableSkeleton() {
  return (
    <>
      <div className="space-y-3 md:hidden">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-52 w-full rounded-2xl" />
        ))}
      </div>
      <div className="hidden space-y-2 md:block">
        <Skeleton className="h-11 w-full rounded-t-2xl" />
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
    </>
  );
}

export default function PoolRidesPage() {
  const {
    rides,
    allRides,
    filteredCount,
    stats,
    isLoading,
    search,
    rideTypeFilter,
    serviceModeFilter,
    rideStatusFilter,
    dateFilter,
    sortField,
    sortDirection,
    page,
    pageSize,
    totalPages,
    rideTypeOptions,
    setPage,
    handleSearchChange,
    handleRideTypeFilterChange,
    handleServiceModeFilterChange,
    handleRideStatusFilterChange,
    handleDateFilterChange,
    handleSortChange,
    handlePageSizeChange
  } = usePoolRidesMock({ initialData: poolRides });

  const scopedStats = useMemo(() => {
    if (serviceModeFilter === "all") return stats;
    const source = allRides.filter((ride) => ride.serviceMode === serviceModeFilter);
    return computePoolRideStats(source);
  }, [allRides, serviceModeFilter, stats]);

  const statCards = useMemo(
    () => {
      const baseCards = [
        {
          label: "Total Rides",
          value: scopedStats.totalRides,
          icon: Car,
          iconBg: "bg-amber-50 dark:bg-amber-500/10",
          iconColor: "text-amber-600 dark:text-amber-400",
          accentBorder: "border-amber-500/20"
        },
        {
          label: "Booked Rides",
          value: scopedStats.bookedRides,
          icon: Timer,
          iconBg: "bg-sky-50 dark:bg-sky-500/10",
          iconColor: "text-sky-600 dark:text-sky-400",
          accentBorder: "border-sky-500/20"
        },
        {
          label: "Completed",
          value: scopedStats.completedRides,
          icon: CheckCircle2,
          iconBg: "bg-green-50 dark:bg-green-500/10",
          iconColor: "text-green-600 dark:text-green-400",
          accentBorder: "border-green-500/20"
        },
        {
          label: "Cancelled",
          value: scopedStats.cancelledRides,
          icon: XCircle,
          iconBg: "bg-red-50 dark:bg-red-500/10",
          iconColor: "text-red-600 dark:text-red-400",
          accentBorder: "border-red-500/20"
        }
      ];

      if (serviceModeFilter === "POOL_RIDE") {
        return [
          ...baseCards,
          {
            label: "Pool Ride",
            value: scopedStats.poolRides,
            icon: Share2,
            iconBg: "bg-emerald-50 dark:bg-emerald-500/10",
            iconColor: "text-emerald-600 dark:text-emerald-400",
            accentBorder: "border-emerald-500/20"
          }
        ];
      }

      if (serviceModeFilter === "TAXI_STAND_CAR") {
        return [
          ...baseCards,
          {
            label: "Taxi Stand Car",
            value: scopedStats.taxiStandCars,
            icon: CarTaxiFront,
            iconBg: "bg-violet-50 dark:bg-violet-500/10",
            iconColor: "text-violet-600 dark:text-violet-400",
            accentBorder: "border-violet-500/20"
          }
        ];
      }

      return [
        ...baseCards,
        {
          label: "Pool Ride",
          value: scopedStats.poolRides,
          icon: Share2,
          iconBg: "bg-emerald-50 dark:bg-emerald-500/10",
          iconColor: "text-emerald-600 dark:text-emerald-400",
          accentBorder: "border-emerald-500/20"
        },
        {
          label: "Taxi Stand Car",
          value: scopedStats.taxiStandCars,
          icon: CarTaxiFront,
          iconBg: "bg-violet-50 dark:bg-violet-500/10",
          iconColor: "text-violet-600 dark:text-violet-400",
          accentBorder: "border-violet-500/20"
        }
      ];
    },
    [scopedStats, serviceModeFilter]
  );

  return (
    <AppShell title="Rides">
      <PageContainer>
        <div className="mb-4">
          <h2 className="font-heading text-xl font-semibold tracking-tight">Rides</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Monitor bookings, fleet mix, and trip outcomes across all ride types.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {statCards.map((stat) => (
            <PoolRideStatCard
              key={stat.label}
              label={stat.label}
              value={stat.value}
              icon={stat.icon}
              iconBg={stat.iconBg}
              iconColor={stat.iconColor}
              accentBorder={stat.accentBorder}
              isLoading={isLoading}
            />
          ))}
        </div>

        <SectionCard
          title="Ride list"
          description="Search, filter, and open any ride for the full operational view."
          className="mt-6"
        >
          <div className="grid grid-cols-1 gap-3 pb-4 sm:grid-cols-2 xl:grid-cols-12">
            <div className="relative min-w-0 sm:col-span-2 xl:col-span-4">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search rides, passengers, drivers…"
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="h-11 pl-9"
              />
            </div>
            <Select value={rideTypeFilter} onValueChange={handleRideTypeFilterChange}>
              <SelectTrigger className="h-11 w-full sm:col-span-1 xl:col-span-2">
                <SelectValue placeholder="Ride type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All ride types</SelectItem>
                {rideTypeOptions.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={serviceModeFilter} onValueChange={handleServiceModeFilterChange}>
              <SelectTrigger className="h-11 w-full sm:col-span-1 xl:col-span-2">
                <SelectValue placeholder="Service mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All services</SelectItem>
                <SelectItem value="POOL_RIDE">Pool Ride</SelectItem>
                <SelectItem value="TAXI_STAND_CAR">Taxi Stand Car</SelectItem>
              </SelectContent>
            </Select>
            <Select value={rideStatusFilter} onValueChange={handleRideStatusFilterChange}>
              <SelectTrigger className="h-11 w-full sm:col-span-1 xl:col-span-2">
                <SelectValue placeholder="Ride status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="BOOKED">Booked</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="date"
              value={dateFilter}
              onChange={(e) => handleDateFilterChange(e.target.value)}
              className="h-11 w-full sm:col-span-1 xl:col-span-2"
              aria-label="Filter by booking date"
            />
            <Select
              value={String(pageSize)}
              onValueChange={(v) => handlePageSizeChange(Number(v))}
            >
              <SelectTrigger className="h-11 w-full sm:col-span-1 xl:col-span-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="8">8 / page</SelectItem>
                <SelectItem value="10">10 / page</SelectItem>
                <SelectItem value="20">20 / page</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <PoolRideTableSkeleton />
          ) : filteredCount === 0 ? (
            <EmptyState
              title="No rides found"
              description="Try adjusting your search or filters."
            />
          ) : (
            <PoolRideResponsiveTable
              rides={rides}
              sortField={sortField}
              sortDirection={sortDirection}
              onSort={handleSortChange}
            />
          )}

          {!isLoading && filteredCount > 0 ? (
            <div className="mt-4 flex flex-col gap-3 border-t border-border/40 pt-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-muted-foreground">
                Showing{" "}
                <span className="font-medium text-foreground">
                  {page * pageSize + 1}
                </span>
                –
                <span className="font-medium text-foreground">
                  {Math.min((page + 1) * pageSize, filteredCount)}
                </span>{" "}
                of{" "}
                <span className="font-medium text-foreground">{filteredCount}</span>
              </p>
              <PaginationControls
                currentPage={page + 1}
                totalPages={totalPages}
                onPageChange={(next) => setPage(next - 1)}
              />
            </div>
          ) : null}
        </SectionCard>
      </PageContainer>
    </AppShell>
  );
}
