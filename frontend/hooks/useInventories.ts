// hooks/useInventories.ts - UPDATED FOR NEW ENDPOINT
"use client";

import useSWR from "swr";
import { Inventory } from "@/types/shared";
import { apiFetch } from "@/lib/apiClient";

export function useInventories() {
  const { data, error, isLoading, mutate } = useSWR<{
    inventories: Inventory[];
    pagination: any;
  }>(
    "/inventories", // This now returns { inventories: [], pagination: {} }
    apiFetch
  );

  console.log("🔍 useInventories - API response:", data);

  return {
    inventories: data?.inventories || [],
    error,
    isLoading,
    mutate,
  };
}
