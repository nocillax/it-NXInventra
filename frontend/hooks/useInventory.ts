// hooks/useInventory.ts
"use client";

import useSWR from "swr";
import { Inventory } from "@/types/shared";
import { inventoryService } from "@/services/inventoryService";

interface InventoryWithCustomIdFormat extends Inventory {
  customIdFormat?: { format: string };
}

export function useInventory(inventoryId: string | undefined) {
  const { data, error, isLoading, mutate } =
    useSWR<InventoryWithCustomIdFormat>(
      inventoryId ? `/inventories/${inventoryId}` : null,
      async () => {
        const inventory = await inventoryService.getInventory(inventoryId!);
        const idFormat = await inventoryService.getIdFormat(inventoryId!);
        return { ...inventory, customIdFormat: idFormat };
      },
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
