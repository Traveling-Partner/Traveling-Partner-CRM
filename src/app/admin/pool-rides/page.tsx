"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ColumnDef } from "@tanstack/react-table";
import {
  ArrowUpDown,
  Bike,
  Building2,
  Car,
  CheckCircle2,
  MapPinned,
  Search,
  Share2,
  Sparkles,
  Timer,
  Truck,
  XCircle
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageContainer } from "@/components/common/PageContainer";
import { SectionCard } from "@/components/common/SectionCard";
import { DataTable } from "@/components/common/DataTable";
import { EmptyState } from "@/components/common/EmptyState";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
import {
  PoolRideBadge,
  poolRideCurrency,
  poolRidePaymentLabel
} from "@/components/pool-rides/PoolRideBadges";
import { usePoolRidesMock } from "@/hooks/pool-rides/usePoolRidesMock";
import { poolRides } from "@/mock-data/pool-rides";
import type { PoolRide, PoolRideSortField } from "@/types/pool-ride";

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
}

function SortableHeader({
  label,
  field,
  activeField,
  direction,
  onSort
}: {
  label: string;
  field: PoolRideSortField;
  activeField: PoolRideSortField;
  direction: "asc" | "desc";
  onSort: (field: PoolRideSortField) => void;
}) {
  const isActive = activeField === field;
  return (
    <button
      type="button"
      onClick={() => onSort(field)}
      className="inline-flex items-center gap-1 text-left font-medium transition-colors hover:text-foreground"
    >
      {label}
      <ArrowUpDown
        className={`h-3.5 w-3.5 ${isActive ? "text-primary" : "text-muted-foreground/50"}`}
      />
      {isActive ? (
        <span className="sr-only">Sorted {direction}</span>
      ) : null}
    </button>
  );
}

export default function PoolRidesPage() {
  const {
    rides,
    filteredCount,
    stats,
    isLoading,
    search,
    rideTypeFilter,
    rideStatusFilter,
    bookingStatusFilter,
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
    handleRideStatusFilterChange,
    handleBookingStatusFilterChange,
    handleDateFilterChange,
    handleSortChange,
    handlePageSizeChange
  } = usePoolRidesMock({ initialData: poolRides });

  const statCards = useMemo(
    () => [
      {
        label: "Total Rides",
        value: stats.totalRides,
        icon: Car,
        iconBg: "bg-amber-50 dark:bg-amber-500/10",
        iconColor: "text-amber-600 dark:text-amber-400",
        accentBorder: "border-amber-500/20"
      },
      {
        label: "Booked Rides",
        value: stats.bookedRides,
        icon: Timer,
        iconBg: "bg-sky-50 dark:bg-sky-500/10",
        iconColor: "text-sky-600 dark:text-sky-400",
        accentBorder: "border-sky-500/20"
      },
      {
        label: "Car Premium",
        value: stats.carPremiumRides,
        icon: Sparkles,
        iconBg: "bg-violet-50 dark:bg-violet-500/10",
        iconColor: "text-violet-600 dark:text-violet-400",
        accentBorder: "border-violet-500/20"
      },
      {
        label: "Bike Rides",
        value: stats.bikeRides,
        icon: Bike,
        iconBg: "bg-cyan-50 dark:bg-cyan-500/10",
        iconColor: "text-cyan-600 dark:text-cyan-400",
        accentBorder: "border-cyan-500/20"
      },
      {
        label: "City to City",
        value: stats.cityToCityRides,
        icon: Building2,
        iconBg: "bg-indigo-50 dark:bg-indigo-500/10",
        iconColor: "text-indigo-600 dark:text-indigo-400",
        accentBorder: "border-indigo-500/20"
      },
      {
        label: "Shared Rides",
        value: stats.sharedRides,
        icon: Share2,
        iconBg: "bg-emerald-50 dark:bg-emerald-500/10",
        iconColor: "text-emerald-600 dark:text-emerald-400",
        accentBorder: "border-emerald-500/20"
      },
      {
        label: "Out of City",
        value: stats.outOfCityRides,
        icon: MapPinned,
        iconBg: "bg-orange-50 dark:bg-orange-500/10",
        iconColor: "text-orange-600 dark:text-orange-400",
        accentBorder: "border-orange-500/20"
      },
      {
        label: "Completed",
        value: stats.completedRides,
        icon: CheckCircle2,
        iconBg: "bg-green-50 dark:bg-green-500/10",
        iconColor: "text-green-600 dark:text-green-400",
        accentBorder: "border-green-500/20"
      },
      {
        label: "Cancelled",
        value: stats.cancelledRides,
        icon: XCircle,
        iconBg: "bg-red-50 dark:bg-red-500/10",
        iconColor: "text-red-600 dark:text-red-400",
        accentBorder: "border-red-500/20"
      },
      {
        label: "Rickshaw",
        value: stats.rickshawRides,
        icon: Truck,
        iconBg: "bg-lime-50 dark:bg-lime-500/10",
        iconColor: "text-lime-700 dark:text-lime-400",
        accentBorder: "border-lime-500/20"
      },
      {
        label: "Economy",
        value: stats.economyRides,
        icon: Car,
        iconBg: "bg-slate-100 dark:bg-slate-500/10",
        iconColor: "text-slate-600 dark:text-slate-400",
        accentBorder: "border-slate-500/20"
      }
    ],
    [stats]
  );

  const columns: ColumnDef<PoolRide>[] = useMemo(
    () => [
      {
        accessorKey: "id",
        header: "Ride ID",
        cell: ({ row }) => (
          <span className="font-mono text-xs font-medium">{row.original.id}</span>
        )
      },
      {
        accessorKey: "bookingDate",
        header: () => (
          <SortableHeader
            label="Booking Date"
            field="bookingDate"
            activeField={sortField}
            direction={sortDirection}
            onSort={handleSortChange}
          />
        ),
        cell: ({ row }) => (
          <span className="text-[12px] text-muted-foreground tabular-nums">
            {formatDate(row.original.bookingDate)}
          </span>
        )
      },
      {
        id: "passengerName",
        header: () => (
          <SortableHeader
            label="Passenger"
            field="passengerName"
            activeField={sortField}
            direction={sortDirection}
            onSort={handleSortChange}
          />
        ),
        cell: ({ row }) => (
          <span className="text-sm font-medium">{row.original.passenger.name}</span>
        )
      },
      {
        id: "driverName",
        header: () => (
          <SortableHeader
            label="Driver"
            field="driverName"
            activeField={sortField}
            direction={sortDirection}
            onSort={handleSortChange}
          />
        ),
        cell: ({ row }) => (
          <span className="text-sm">{row.original.driver.name}</span>
        )
      },
      {
        accessorKey: "rideType",
        header: "Ride Type",
        cell: ({ row }) => (
          <span className="text-[13px]">{row.original.rideType}</span>
        )
      },
      {
        accessorKey: "vehicleType",
        header: "Vehicle",
        cell: ({ row }) => (
          <span className="text-[13px] text-muted-foreground">
            {row.original.vehicleType}
          </span>
        )
      },
      {
        accessorKey: "pickupAddress",
        header: "Pickup",
        cell: ({ row }) => (
          <span className="line-clamp-1 max-w-[140px] text-[12px] text-muted-foreground">
            {row.original.pickupAddress}
          </span>
        )
      },
      {
        accessorKey: "destinationAddress",
        header: "Destination",
        cell: ({ row }) => (
          <span className="line-clamp-1 max-w-[140px] text-[12px] text-muted-foreground">
            {row.original.destinationAddress}
          </span>
        )
      },
      {
        accessorKey: "finalAmount",
        header: () => (
          <SortableHeader
            label="Fare"
            field="fare"
            activeField={sortField}
            direction={sortDirection}
            onSort={handleSortChange}
          />
        ),
        cell: ({ row }) => (
          <span className="text-sm font-medium tabular-nums">
            {poolRideCurrency(row.original.finalAmount)}
          </span>
        )
      },
      {
        accessorKey: "paymentMethod",
        header: "Payment",
        cell: ({ row }) => (
          <span className="text-[12px] text-muted-foreground">
            {poolRidePaymentLabel(row.original.paymentMethod)}
          </span>
        )
      },
      {
        accessorKey: "rideStatus",
        header: () => (
          <SortableHeader
            label="Ride Status"
            field="rideStatus"
            activeField={sortField}
            direction={sortDirection}
            onSort={handleSortChange}
          />
        ),
        cell: ({ row }) => <PoolRideBadge status={row.original.rideStatus} variant="ride" />
      },
      {
        accessorKey: "bookingStatus",
        header: "Booking",
        cell: ({ row }) => (
          <PoolRideBadge status={row.original.bookingStatus} variant="booking" />
        )
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <Button size="sm" variant="outline" asChild>
            <Link href={`/admin/pool-rides/${row.original.id}`}>View</Link>
          </Button>
        )
      }
    ],
    [sortField, sortDirection, handleSortChange]
  );

  return (
    <AppShell title="Pool Ride">
      <PageContainer>
        <div className="mb-4">
          <h2 className="font-heading text-xl font-semibold tracking-tight">Pool Ride</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Monitor shared and multi-category rides — bookings, fleet mix, and trip outcomes.
          </p>
        </div>

        <div className="grid gap-3 grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6">
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
          <div className="flex flex-col gap-3 pb-4 lg:flex-row lg:flex-wrap lg:items-end">
            <div className="relative min-w-[200px] flex-1 lg:max-w-xs">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search rides, passengers, drivers…"
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={rideTypeFilter} onValueChange={handleRideTypeFilterChange}>
              <SelectTrigger className="w-full sm:w-[160px]">
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
            <Select value={rideStatusFilter} onValueChange={handleRideStatusFilterChange}>
              <SelectTrigger className="w-full sm:w-[160px]">
                <SelectValue placeholder="Ride status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="BOOKED">Booked</SelectItem>
                <SelectItem value="DRIVER_ACCEPTED">Driver Accepted</SelectItem>
                <SelectItem value="DRIVER_ARRIVED">Driver Arrived</SelectItem>
                <SelectItem value="STARTED">Started</SelectItem>
                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={bookingStatusFilter} onValueChange={handleBookingStatusFilterChange}>
              <SelectTrigger className="w-full sm:w-[160px]">
                <SelectValue placeholder="Booking status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All bookings</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="date"
              value={dateFilter}
              onChange={(e) => handleDateFilterChange(e.target.value)}
              className="w-full sm:w-[160px]"
              aria-label="Filter by booking date"
            />
            <Select
              value={String(pageSize)}
              onValueChange={(v) => handlePageSizeChange(Number(v))}
            >
              <SelectTrigger className="w-full sm:w-[120px]">
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
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full rounded-lg" />
              ))}
            </div>
          ) : filteredCount === 0 ? (
            <EmptyState
              title="No pool rides found"
              description="Try adjusting your search or filters."
            />
          ) : (
            <div className="overflow-x-auto">
              <DataTable
                columns={columns}
                data={rides}
                getRowId={(row) => row.id}
                emptyTitle="No rides"
                emptyDescription="No rides match your filters."
              />
            </div>
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
