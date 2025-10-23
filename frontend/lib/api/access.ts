import { apiFetch } from "@/lib/apiClient";
import { Access } from "@/types/shared";

export async function getAccessList(inventoryId: string): Promise<Access[]> {
  try {
    const accessList: Access[] = await apiFetch(
      `/access?inventoryId=${inventoryId}`
    );
    return accessList;
  } catch (error) {
    console.error(
      `Failed to fetch access list for inventory ${inventoryId}:`,
      error
    );
    return [];
  }
}
