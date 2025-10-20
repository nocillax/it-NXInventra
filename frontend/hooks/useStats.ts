"use client";

import useSWR from "swr";
import { apiFetch } from "@/lib/apiClient";
import { InventoryStats } from "@/types/shared";

async function statsFetcher(path: string) {
  // The real API will be `/api/inventories/:id/stats`
  const inventoryId = path.split("/")[2];
  const allStats: InventoryStats[] = await apiFetch("/stats");
  return allStats.find((s) => s.inventoryId === inventoryId);
}

export function useStats(inventoryId: string | undefined) {
  const { data, error, isLoading, mutate } = useSWR<InventoryStats | undefined>(
    inventoryId ? `/inventories/${inventoryId}/stats` : null,
    statsFetcher
  );

  return { stats: data, error, isLoading, mutate };
}
