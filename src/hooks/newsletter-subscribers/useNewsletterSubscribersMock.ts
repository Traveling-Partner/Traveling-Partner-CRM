"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { NewsletterSubscriber, NewsletterSubscriberStatus } from "@/types/newsletter-subscribers";

<<<<<<< Updated upstream
const DEFAULT_PAGE_SIZE = 10;
=======
<<<<<<< HEAD
const DEFAULT_PAGE_SIZE = 6;
=======
const DEFAULT_PAGE_SIZE = 10;
>>>>>>> 46c4ba4917a754ff26ec5eaaf226e9a4e85baa3e
>>>>>>> Stashed changes
const INITIAL_LOAD_DELAY_MS = 500;

interface UseNewsletterSubscribersMockOptions {
  initialData: NewsletterSubscriber[];
}

<<<<<<< Updated upstream
export function useNewsletterSubscribersMock({
  initialData
}: UseNewsletterSubscribersMockOptions) {
=======
<<<<<<< HEAD
export function useNewsletterSubscribersMock({ initialData }: UseNewsletterSubscribersMockOptions) {
=======
export function useNewsletterSubscribersMock({
  initialData
}: UseNewsletterSubscribersMockOptions) {
>>>>>>> 46c4ba4917a754ff26ec5eaaf226e9a4e85baa3e
>>>>>>> Stashed changes
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | NewsletterSubscriberStatus>("all");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  useEffect(() => {
    setIsLoading(true);
    const timer = window.setTimeout(() => {
      setSubscribers(initialData);
      setIsLoading(false);
    }, INITIAL_LOAD_DELAY_MS);

    return () => window.clearTimeout(timer);
  }, [initialData]);

  const filteredSubscribers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return subscribers.filter((subscriber) => {
      const matchesEmail = !query || subscriber.email.toLowerCase().includes(query);
      const matchesStatus =
        statusFilter === "all" || subscriber.status === statusFilter;
      return matchesEmail && matchesStatus;
    });
  }, [subscribers, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredSubscribers.length / pageSize));

<<<<<<< Updated upstream
=======
<<<<<<< HEAD
  useEffect(() => {
    if (page >= totalPages) {
      setPage(Math.max(0, totalPages - 1));
    }
  }, [page, totalPages]);

=======
>>>>>>> 46c4ba4917a754ff26ec5eaaf226e9a4e85baa3e
>>>>>>> Stashed changes
  const paginatedSubscribers = useMemo(() => {
    const start = page * pageSize;
    return filteredSubscribers.slice(start, start + pageSize);
  }, [filteredSubscribers, page, pageSize]);

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    setPage(0);
  }, []);

  const handleStatusFilterChange = useCallback((value: "all" | NewsletterSubscriberStatus) => {
    setStatusFilter(value);
    setPage(0);
  }, []);

  const handlePageSizeChange = useCallback((value: number) => {
    setPageSize(value);
    setPage(0);
  }, []);

  return {
    subscribers: paginatedSubscribers,
    totalSubscribers: filteredSubscribers.length,
    isLoading,
    search,
    statusFilter,
    page,
    pageSize,
    totalPages,
    setPage,
    handleSearchChange,
    handleStatusFilterChange,
    handlePageSizeChange
  };
}
