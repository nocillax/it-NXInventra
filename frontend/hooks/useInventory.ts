"use client";

import useSWR from "swr";
import { getInventory } from "@/lib/api/inventories";
import { Inventory } from "@/types/shared";

export function useInventory(inventoryId: string | undefined) {
  const { data, error, isLoading, mutate } = useSWR<Inventory | null>(
    inventoryId ? `/inventories/${inventoryId}` : null,
    () => getInventory(inventoryId!)
  );

  return {
    inventory: data,
    isLoading,
    error,
    mutate,
  };
}
