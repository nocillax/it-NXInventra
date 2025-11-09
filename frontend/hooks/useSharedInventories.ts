// hooks/useSharedInventories.ts
"use client";

import useSWR from "swr";
import { Inventory } from "@/types/shared";
import { apiFetch } from "@/lib/apiClient";

export function useSharedInventories(page: number = 1, limit: number = 10) {
  const { data, error, isLoading, mutate } = useSWR<{
    inventories: Inventory[];
    pagination: any;
  }>(`/inventories/shared-with-me?page=${page}&limit=${limit}`, apiFetch);

  return {
    inventories: data?.inventories || [],
    pagination: data?.pagination,
    error,
    isLoading,
    mutate,
  };
}
