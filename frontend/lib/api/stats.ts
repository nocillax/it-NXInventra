// import { apiFetch } from "@/lib/apiClient";
// import { InventoryStats } from "@/types/shared";

// export async function getStats(
//   inventoryId: string
// ): Promise<InventoryStats | null> {
//   try {
//     const stats: InventoryStats = await apiFetch(
//       `/stats?inventoryId=${inventoryId}`
//     );
//     return stats;
//   } catch (error) {
//     console.error(`Failed to fetch stats for inventory ${inventoryId}:`, error);
//     return null;
//   }
// }
