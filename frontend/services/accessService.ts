import { apiFetch } from "@/lib/apiClient";
import { Access, Role } from "@/types/shared";

export const accessService = {
  // Get access list for an inventory
  getAccessList: (inventoryId: string): Promise<Access[]> =>
    apiFetch(`/inventories/${inventoryId}/access`),

  // Add user access
  addAccess: (inventoryId: string, userId: string, role: Role): Promise<any> =>
    apiFetch(`/inventories/${inventoryId}/access`, {
      method: "POST",
      body: JSON.stringify({ userId, role }),
    }),

  // Update user role
  updateRole: (inventoryId: string, userId: string, role: Role): Promise<any> =>
    apiFetch(`/inventories/${inventoryId}/access/${userId}`, {
      method: "PATCH",
      body: JSON.stringify({ role }),
    }),

  // Remove user access
  removeAccess: (inventoryId: string, userId: string): Promise<any> =>
    apiFetch(`/inventories/${inventoryId}/access/${userId}`, {
      method: "DELETE",
    }),
};
