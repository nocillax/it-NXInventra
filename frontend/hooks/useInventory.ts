"use client";

import useSWR from "swr";
import { apiFetch } from "@/lib/apiClient";
import { Inventory } from "@/types/shared";

export function useInventory(inventoryId: string | undefined) {
  const { data, error, isLoading, mutate } = useSWR<Inventory>(
    inventoryId ? `/inventories/${inventoryId}` : null,
    apiFetch
  );

  return {
    inventory: data,
    isLoading,
    error,
    mutate,
  };
}
