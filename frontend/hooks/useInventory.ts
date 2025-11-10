// hooks/useInventory.ts
"use client";

import useSWR from "swr";
import { Inventory } from "@/types/shared";
import { inventoryService } from "@/services/inventoryService";

interface InventoryWithCustomIdFormat extends Inventory {
  customIdFormat?: { format: string };
}

export function useInventory(
  inventoryId: string | undefined,
  options?: { isPaused?: boolean } // ← Add this parameter
) {
  const { data, error, isLoading, mutate } =
    useSWR<InventoryWithCustomIdFormat>(
      inventoryId ? `/inventories/${inventoryId}` : null,
      async () => {
        const inventory = await inventoryService.getInventory(inventoryId!);
        const idFormat = await inventoryService.getIdFormat(inventoryId!);
        return { ...inventory, customIdFormat: idFormat };
      },
      {
        refreshInterval: options?.isPaused ? 0 : 5000, // ← Now this will work
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
