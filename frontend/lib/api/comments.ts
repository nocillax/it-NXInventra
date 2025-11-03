// import { apiFetch } from "@/lib/apiClient";
// import { Comment } from "@/types/shared";

// export async function getComments(
//   inventoryId: string,
//   page: number,
//   limit: number
// ): Promise<Comment[]> {
//   try {
//     const comments: Comment[] = await apiFetch(
//       `/comments?inventoryId=${inventoryId}&page=${page}&limit=${limit}`
//     );
//     return comments;
//   } catch (error) {
//     console.error(
//       `Failed to fetch comments for inventory ${inventoryId}:`,
//       error
//     );
//     return [];
//   }
// }
