// services/itemService.ts
import { apiFetch } from "@/lib/apiClient";
import { Item, NewItem, UpdateItemData } from "@/types/shared";

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
  async getItem(itemId: string): Promise<Item> {
    return apiFetch(`/items/${itemId}`);
  },

  async createItem(itemData: NewItem): Promise<Item> {
    return apiFetch("/items", {
      method: "POST",
      body: JSON.stringify(itemData),
    });
  },

  async updateItem(itemId: string, itemData: UpdateItemData): Promise<Item> {
    return apiFetch(`/items/${itemId}`, {
      method: "PATCH", // Changed from PUT to PATCH
      body: JSON.stringify(itemData),
    });
  },

  async deleteItem(itemId: string): Promise<void> {
    return apiFetch(`/items/${itemId}`, {
      method: "DELETE",
    });
  },
};
