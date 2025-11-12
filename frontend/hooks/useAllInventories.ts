"use client";

import useSWR from "swr";
import { Inventory } from "@/types/shared";
import { apiFetch } from "@/lib/apiClient";

export function useAllInventories(page: number = 1, limit: number = 10) {
  const { data, error, isLoading, mutate } = useSWR<{
    inventories: Inventory[];
    pagination: any;
  }>(`/inventories/all?page=${page}&limit=${limit}`, apiFetch);

  console.log("🔍 useAllInventories - API response:", data);

  return {
    inventories: data?.inventories || [],
    pagination: data?.pagination,
    error,
    isLoading,
    mutate,
  };
}
