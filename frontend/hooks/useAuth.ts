// hooks/useAuth.ts - SIMPLIFIED
import useSWR from "swr";
import { User } from "@/types/shared";
import { userService } from "@/services/userService";

export const useAuth = () => {
  const { data, error, isLoading, mutate } = useSWR<User>(
    "/user/me",
    () => userService.getCurrentUser(),
    {
      refreshInterval: 0,
      revalidateOnFocus: false,
      shouldRetryOnError: false, // Don't retry on auth errors
    }
  );

  const logout = async () => {
    try {
      await userService.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      mutate(undefined, false); // Clear SWR cache
      window.location.href = "/";
    }
  };

  return {
    user: data,
    logout,
    refreshUser: mutate,
    isLoading,
    isAuthenticated: !!data,
  };
};
