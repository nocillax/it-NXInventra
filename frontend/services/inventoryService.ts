// services/inventoryService.ts
import { apiFetch } from "@/lib/apiClient";
import { Inventory } from "@/types/shared";

export const inventoryService = {
  async getInventory(id: string): Promise<Inventory> {
    return apiFetch(`/inventories/${id}`);
  },

  async getInventories(): Promise<{
    inventories: Inventory[];
    pagination: any;
  }> {
    return apiFetch("/inventories");
  },

  async getMyInventories(): Promise<{
    inventories: Inventory[];
    pagination: any;
  }> {
    return apiFetch("/inventories/me");
  },

  async getSharedInventories(): Promise<{
    inventories: Inventory[];
    pagination: any;
  }> {
    return apiFetch("/inventories/shared-with-me");
  },

  async getIdFormat(inventoryId: string): Promise<{ format: string }> {
    return apiFetch(`/inventories/${inventoryId}/id-format`);
  },

  async generateApiToken(inventoryId: string): Promise<{ apiToken: string }> {
    return apiFetch(`/inventories/${inventoryId}/generate-token`, {
      method: "POST",
    });
  },
};
