import { apiFetch } from "@/lib/apiClient";
import { Discussion } from "@/types/shared";

interface DiscussionResponse {
  comments: Discussion[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export const discussionService = {
  getComments: (
    inventoryId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<DiscussionResponse> =>
    apiFetch(
      `/inventories/${inventoryId}/comments?page=${page}&limit=${limit}`
    ),

  // Post a new comment
  postComment: (inventoryId: string, message: string): Promise<any> =>
    apiFetch(`/inventories/${inventoryId}/comments`, {
      method: "POST",
      body: JSON.stringify({ message }),
    }),

  // Delete a comment
  deleteComment: (commentId: string): Promise<any> =>
    apiFetch(`/comments/${commentId}`, {
      method: "DELETE",
    }),
};
