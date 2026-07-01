"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type {
  PoolRide,
  PoolRideSortField,
  PoolRideStats
} from "@/types/pool-ride";
import { computePoolRideStats } from "@/types/pool-ride";

const DEFAULT_PAGE_SIZE = 8;
const INITIAL_LOAD_DELAY_MS = 400;

export type PoolRideTypeFilter = "all" | string;
export type PoolServiceModeFilter = "all" | PoolRide["serviceMode"];
export type PoolRideStatusFilter = "all" | PoolRide["rideStatus"];
export type SortDirection = "asc" | "desc";

interface UsePoolRidesMockOptions {
  initialData: PoolRide[];
}

function matchesSearch(ride: PoolRide, query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return (
    ride.id.toLowerCase().includes(q) ||
    ride.passenger.name.toLowerCase().includes(q) ||
    ride.driver.name.toLowerCase().includes(q) ||
    ride.pickupAddress.toLowerCase().includes(q) ||
    ride.destinationAddress.toLowerCase().includes(q) ||
    ride.rideType.toLowerCase().includes(q)
  );
}

function matchesDate(ride: PoolRide, dateFilter: string) {
  if (!dateFilter) return true;
  const rideDay = ride.bookingDate.slice(0, 10);
  return rideDay === dateFilter;
}

function sortRides(
  rides: PoolRide[],
  field: PoolRideSortField,
  direction: SortDirection
) {
  const sorted = [...rides].sort((a, b) => {
    let cmp = 0;
    switch (field) {
      case "bookingDate":
        cmp = new Date(a.bookingDate).getTime() - new Date(b.bookingDate).getTime();
        break;
      case "passengerName":
        cmp = a.passenger.name.localeCompare(b.passenger.name);
        break;
      case "driverName":
        cmp = a.driver.name.localeCompare(b.driver.name);
        break;
      case "fare":
        cmp = a.finalAmount - b.finalAmount;
        break;
      case "rideStatus":
        cmp = a.rideStatus.localeCompare(b.rideStatus);
        break;
      default:
        cmp = 0;
    }
    return direction === "asc" ? cmp : -cmp;
  });
  return sorted;
}

export function usePoolRidesMock({ initialData }: UsePoolRidesMockOptions) {
  const [rides, setRides] = useState<PoolRide[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [rideTypeFilter, setRideTypeFilter] = useState<PoolRideTypeFilter>("all");
  const [serviceModeFilter, setServiceModeFilter] =
    useState<PoolServiceModeFilter>("all");
  const [rideStatusFilter, setRideStatusFilter] = useState<PoolRideStatusFilter>("all");
  const [dateFilter, setDateFilter] = useState("");
  const [sortField, setSortField] = useState<PoolRideSortField>("bookingDate");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setRides(initialData);
      setIsLoading(false);
    }, INITIAL_LOAD_DELAY_MS);
    return () => clearTimeout(timer);
  }, [initialData]);

  const filteredRides = useMemo(() => {
    return rides.filter((ride) => {
      if (!matchesSearch(ride, search)) return false;
      if (serviceModeFilter !== "all" && ride.serviceMode !== serviceModeFilter) return false;
      if (
        serviceModeFilter === "POOL_RIDE" &&
        !["SHARED", "CITY_TO_CITY", "OUT_OF_CITY"].includes(ride.category)
      ) {
        return false;
      }
      if (
        rideTypeFilter !== "all" &&
        !(
          ride.rideType === rideTypeFilter ||
          (rideTypeFilter === "City to City" && ride.rideType === "Out of City")
        )
      ) {
        return false;
      }
      if (rideStatusFilter !== "all" && ride.rideStatus !== rideStatusFilter) return false;
      if (!matchesDate(ride, dateFilter)) return false;
      return true;
    });
  }, [
    rides,
    search,
    serviceModeFilter,
    rideTypeFilter,
    rideStatusFilter,
    dateFilter
  ]);

  const sortedRides = useMemo(
    () => sortRides(filteredRides, sortField, sortDirection),
    [filteredRides, sortField, sortDirection]
  );

  const stats: PoolRideStats = useMemo(
    () => computePoolRideStats(rides),
    [rides]
  );

  const totalPages = Math.max(1, Math.ceil(sortedRides.length / pageSize));

  useEffect(() => {
    if (page >= totalPages) {
      setPage(Math.max(0, totalPages - 1));
    }
  }, [page, totalPages]);

  const paginatedRides = useMemo(() => {
    const start = page * pageSize;
    return sortedRides.slice(start, start + pageSize);
  }, [sortedRides, page, pageSize]);

  const rideTypeOptions = useMemo(() => {
    const normalizedTypes = rides.map((r) =>
      r.rideType === "Out of City" ? "City to City" : r.rideType
    );
    const types = Array.from(new Set(normalizedTypes));
    return types.sort();
  }, [rides]);

  const resetPage = useCallback(() => setPage(0), []);

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearch(value);
      resetPage();
    },
    [resetPage]
  );

  const handleRideTypeFilterChange = useCallback(
    (value: PoolRideTypeFilter) => {
      setRideTypeFilter(value);
      resetPage();
    },
    [resetPage]
  );

  const handleServiceModeFilterChange = useCallback(
    (value: PoolServiceModeFilter) => {
      setServiceModeFilter(value);
      resetPage();
    },
    [resetPage]
  );

  const handleRideStatusFilterChange = useCallback(
    (value: PoolRideStatusFilter) => {
      setRideStatusFilter(value);
      resetPage();
    },
    [resetPage]
  );

  const handleDateFilterChange = useCallback(
    (value: string) => {
      setDateFilter(value);
      resetPage();
    },
    [resetPage]
  );

  const handleSortChange = useCallback(
    (field: PoolRideSortField) => {
      setSortField((prev) => {
        if (prev === field) {
          setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
          return prev;
        }
        setSortDirection("desc");
        return field;
      });
      resetPage();
    },
    [resetPage]
  );

  const handlePageSizeChange = useCallback(
    (size: number) => {
      setPageSize(size);
      resetPage();
    },
    [resetPage]
  );

  return {
    rides: paginatedRides,
    allRides: rides,
    totalRides: rides.length,
    filteredCount: sortedRides.length,
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
  };
}

export function findPoolRideById(id: string, data: PoolRide[]) {
  return data.find((r) => r.id === id);
}
