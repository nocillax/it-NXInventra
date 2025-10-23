import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User } from "@/types/shared";
import usersData from "@/mock/users.json";

interface UserState {
  user: User | null;
  login: (userId: string) => void;
  logout: () => void;
  setUser: (user: User | null) => void;
}

const mockUsers: User[] = usersData as User[];

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      // For development, we start with a default logged-in user.
      user: mockUsers.find((user) => user.id === "u_rahim") || null,
      login: (userId: string) => {
        const userToSet = mockUsers.find((user) => user.id === userId) || null;
        set({ user: userToSet });
      },
      logout: () => set({ user: null }),
      setUser: (user) => set({ user }),
    }),
    {
      name: "nxinventra-user-storage", // name of the item in the storage (must be unique)
    }
  )
);
