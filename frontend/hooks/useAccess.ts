import useSWR from "swr";
import { Access } from "@/types/shared";
import { accessService } from "@/services/accessService";
import { apiFetch } from "@/lib/apiClient";

export function useAccess(inventoryId: string) {
  const { data, error, isLoading, mutate } = useSWR(
    inventoryId ? `/inventories/${inventoryId}/access` : null,
    () => accessService.getAccessList(inventoryId),
    {
      refreshInterval: 5000, // Auto-refresh every 5 seconds
      revalidateOnFocus: true,
    }
  );

  return {
    accessList: data,
    isLoading,
    error,
    mutate,
  };
}
