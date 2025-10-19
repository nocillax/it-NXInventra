"use client";

import useSWR from "swr";
import { Inventory } from "@/types/shared";
import { apiFetch } from "@/lib/apiClient";

async function inventoryFetcher(path: string) {
  const inventories: Inventory[] = await apiFetch("/inventories");
  const inventoryId = path.split("/").pop();
  return inventories.find((inv) => inv.id === inventoryId) ?? null;
}

export function useInventory(id: string | undefined) {
  // The key includes the ID to ensure SWR fetches uniquely per inventory
  const { data, error, isLoading, mutate } = useSWR<Inventory | null>(
    id ? `/inventories/${id}` : null,
    inventoryFetcher
  );

  return { inventory: data, error, isLoading, mutate };
}
