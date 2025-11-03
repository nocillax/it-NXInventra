// services/userService.ts
import { apiFetch } from "@/lib/apiClient";

export const userService = {
  async getCurrentUser() {
    return apiFetch("/user/me");
  },

  async logout() {
    return apiFetch("/auth/logout", { method: "POST" });
  },
};
