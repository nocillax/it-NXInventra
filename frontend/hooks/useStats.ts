// hooks/useStats.ts
import useSWR from "swr";
import { InventoryStats } from "@/types/shared";
import { statsService } from "@/services/statsService";

export function useStats(inventoryId: string) {
  const { data, error, isLoading } = useSWR(
    inventoryId ? `/inventories/${inventoryId}/stats` : null,
    () => statsService.getStats(inventoryId)
  );

  return {
    stats: data,
    isLoading,
    error,
  };
}
