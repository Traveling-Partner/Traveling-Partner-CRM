"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type {
  PercentageManagementFormValues,
  PercentageManagementItem
} from "@/types/percentage-management";

const DEFAULT_PAGE_SIZE = 10;
const INITIAL_LOAD_DELAY_MS = 600;

interface UsePercentageManagementMockOptions {
  initialData: PercentageManagementItem[];
}

export function usePercentageManagementMock({ initialData }: UsePercentageManagementMockOptions) {
  const [items, setItems] = useState<PercentageManagementItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  useEffect(() => {
    setIsLoading(true);
    const timer = window.setTimeout(() => {
      setItems(initialData);
      setIsLoading(false);
    }, INITIAL_LOAD_DELAY_MS);

    return () => window.clearTimeout(timer);
  }, [initialData]);

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return items;

    return items.filter((item) => item.name.toLowerCase().includes(query));
  }, [items, search]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / pageSize));

  const paginatedItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredItems.slice(start, start + pageSize);
  }, [filteredItems, page, pageSize]);

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  const handlePageSizeChange = useCallback((value: number) => {
    setPageSize(value);
    setPage(1);
  }, []);

  const createItem = useCallback((values: PercentageManagementFormValues) => {
    const newItem: PercentageManagementItem = {
      id: `item-${Date.now()}`,
      ...values
    };
    setItems((current) => [newItem, ...current]);
    setPage(1);
    return newItem;
  }, []);

  const updateItem = useCallback((id: string, values: PercentageManagementFormValues) => {
    setItems((current) =>
      current.map((item) => (item.id === id ? { ...item, ...values } : item))
    );
  }, []);

  const deleteItem = useCallback((id: string) => {
    setItems((current) => current.filter((item) => item.id !== id));
    setPage((currentPage) => {
      const nextTotal = Math.max(1, Math.ceil((filteredItems.length - 1) / pageSize));
      return Math.min(currentPage, nextTotal);
    });
  }, [filteredItems.length, pageSize]);

  return {
    items: paginatedItems,
    totalItems: filteredItems.length,
    isLoading,
    search,
    page,
    pageSize,
    totalPages,
    setPage,
    handleSearchChange,
    handlePageSizeChange,
    createItem,
    updateItem,
    deleteItem
  };
}
