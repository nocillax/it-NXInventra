// hooks/useSharedInventories.ts
"use client";

import useSWR from "swr";
import { Inventory } from "@/types/shared";
import { apiFetch } from "@/lib/apiClient";

export function useSharedInventories() {
  const { data, error, isLoading, mutate } = useSWR<{
    inventories: Inventory[];
    pagination: any;
  }>("/inventories/shared-with-me", apiFetch);

  return {
    inventories: data?.inventories || [],
    error,
    isLoading,
    mutate,
  };
}
