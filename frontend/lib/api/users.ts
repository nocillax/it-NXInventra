import { apiFetch } from "@/lib/apiClient";
import { User } from "@/types/shared";

export async function getUsers(): Promise<User[]> {
  try {
    const users: User[] = await apiFetch("/users");
    return users;
  } catch (error) {
    console.error("Failed to fetch users:", error);
    return [];
  }
}
