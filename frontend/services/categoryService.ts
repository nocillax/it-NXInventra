// services/categoryService.ts
import { apiFetch } from "@/lib/apiClient";

export const categoryService = {
  async getCategories() {
    return apiFetch("/categories");
  },

  async searchCategories(query: string) {
    return apiFetch(`/categories/search?q=${encodeURIComponent(query)}`);
  },
};
