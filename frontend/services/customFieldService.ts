// services/customFieldService.ts - CLEANED UP
import { apiFetch } from "@/lib/apiClient";
import { CustomField } from "@/types/shared";

export const customFieldService = {
  // Get all custom fields for an inventory
  async getCustomFields(inventoryId: string): Promise<CustomField[]> {
    return apiFetch(`/inventories/${inventoryId}/custom-fields`);
  },

  // Add custom fields (can add single or multiple)
  async addCustomFields(
    inventoryId: string,
    fields: Array<{
      title: string;
      description: string | null;
      type: "text" | "number" | "boolean" | "url" | "longtext";
      showInTable: boolean;
      orderIndex: number;
    }>
  ): Promise<CustomField[]> {
    return apiFetch(`/inventories/${inventoryId}/custom-fields`, {
      method: "POST",
      body: JSON.stringify({ fields }),
    });
  },

  // Update a custom field
  async updateCustomField(
    inventoryId: string,
    fieldId: number,
    updates: {
      title?: string;
      description?: string | null;
      showInTable?: boolean;
      orderIndex?: number;
    }
  ): Promise<CustomField> {
    return apiFetch(`/inventories/${inventoryId}/custom-fields/${fieldId}`, {
      method: "PATCH",
      body: JSON.stringify(updates),
    });
  },

  // Delete a custom field
  async deleteCustomField(inventoryId: string, fieldId: number): Promise<void> {
    return apiFetch(`/inventories/${inventoryId}/custom-fields/${fieldId}`, {
      method: "DELETE",
    });
  },

  // Get next available orderIndex for a new field
  async getNextOrderIndex(inventoryId: string): Promise<number> {
    const fields = await this.getCustomFields(inventoryId);

    if (fields.length === 0) return 0;

    // Get all existing orderIndexes
    const existingOrderIndexes = fields.map((field) => field.orderIndex);

    // Find the maximum orderIndex
    const maxOrderIndex = Math.max(...existingOrderIndexes);

    let nextOrderIndex = maxOrderIndex + 1;

    // Ensure no duplicates
    while (existingOrderIndexes.includes(nextOrderIndex)) {
      nextOrderIndex++;
    }

    return nextOrderIndex;
  },
};
