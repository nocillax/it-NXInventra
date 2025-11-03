// services/tagService.ts - FIXED
import { apiFetch } from "@/lib/apiClient";

export const tagService = {
  async getTags(): Promise<string[]> {
    const response = await apiFetch("/tags?page=1&limit=20");
    // Extract tag names from the response
    return response.tags?.map((tag: any) => tag.name) || [];
  },

  async searchTags(query: string): Promise<string[]> {
    return apiFetch(`/tags/autocomplete?q=${encodeURIComponent(query)}`);
  },
};
