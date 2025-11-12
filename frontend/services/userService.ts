// services/userService.ts - UPDATED DELETE METHODS
import { apiFetch } from "@/lib/apiClient";
import { User } from "@/types/shared";

export const userService = {
  async getCurrentUser() {
    return apiFetch("/user/me");
  },

  async logout() {
    return apiFetch("/auth/logout", { method: "POST" });
  },

  async getAllUsers(page: number = 1, limit: number = 50) {
    return apiFetch(`/user/all?page=${page}&limit=${limit}`);
  },

  async promoteToAdmin(userId: string) {
    return apiFetch(`/user/${userId}/promote`, { method: "PATCH" });
  },

  async demoteFromAdmin(userId: string) {
    return apiFetch(`/user/${userId}/demote`, { method: "PATCH" });
  },

  async deleteUser(userId: string) {
    return apiFetch(`/user/${userId}`, { method: "DELETE" });
  },

  async bulkToggleAdmin(userIds: string[], makeAdmin: boolean) {
    const promises = userIds.map((userId) =>
      makeAdmin ? this.promoteToAdmin(userId) : this.demoteFromAdmin(userId)
    );
    return Promise.all(promises);
  },
};
