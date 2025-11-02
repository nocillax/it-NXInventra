// services/itemService.ts
import { apiFetch } from "@/lib/apiClient";
import { Item } from "@/types/shared";

export const itemService = {
  async getItems(
    inventoryId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{ items: Item[]; pagination: any }> {
    return apiFetch(
      `/inventories/${inventoryId}/items?page=${page}&limit=${limit}`
    );
  },
};
