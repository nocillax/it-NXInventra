// hooks/useInventory.ts
"use client";

import useSWR from "swr";
import { Inventory } from "@/types/shared";
import { inventoryService } from "@/services/inventoryService";

export function useInventory(inventoryId: string | undefined) {
  const { data, error, isLoading, mutate } = useSWR<Inventory>(
    inventoryId ? `/inventories/${inventoryId}` : null,
    () => inventoryService.getInventory(inventoryId!),
    {
      refreshInterval: 5000, // Refresh every 5 seconds
      revalidateOnFocus: true,
    }
  );

  return {
    inventory: data,
    isLoading,
    error,
    mutate,
  };
}
