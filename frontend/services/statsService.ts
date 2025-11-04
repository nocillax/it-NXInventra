// services/statsService.ts
import { apiFetch } from "@/lib/apiClient";
import { InventoryStats } from "@/types/shared";

export const statsService = {
  async getStats(inventoryId: string): Promise<InventoryStats> {
    return apiFetch(`/inventories/${inventoryId}/stats`);
  },
};
