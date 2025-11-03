// import { apiFetch } from "@/lib/apiClient";
// import { Inventory } from "@/types/shared";

// export async function getInventories(): Promise<Inventory[]> {
//   try {
//     const inventories: Inventory[] = await apiFetch("/inventories");
//     return inventories;
//   } catch (error) {
//     console.error("Failed to fetch inventories:", error);
//     return [];
//   }
// }

// export async function getInventory(id: string): Promise<Inventory | null> {
//   try {
//     const inventory: Inventory = await apiFetch(`/inventories/${id}`);
//     return inventory;
//   } catch (error) {
//     // In a real app, you might want to log this error.
//     console.error(`Failed to fetch inventory ${id}:`, error);
//     return null;
//   }
// }
