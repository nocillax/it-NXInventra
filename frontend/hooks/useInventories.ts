// hooks/useInventories.ts - UPDATED FOR NEW ENDPOINT
"use client";

import useSWR from "swr";
import { Inventory } from "@/types/shared";
import { apiFetch } from "@/lib/apiClient";

export function useInventories(page: number = 1, limit: number = 10) {
  const { data, error, isLoading, mutate } = useSWR<{
    inventories: Inventory[];
    pagination: any;
  }>(`/inventories?page=${page}&limit=${limit}`, apiFetch);

  console.log("🔍 useInventories - API response:", data);

  return {
    inventories: data?.inventories || [],
    pagination: data?.pagination,
    error,
    isLoading,
    mutate,
  };
}
