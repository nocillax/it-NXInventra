// hooks/useAuth.ts
import { useEffect } from "react";
import { useUserStore } from "@/stores/useUserStore";
import { userService } from "@/services/userService";

export const useAuth = () => {
  const { user, setUser, setLoading, setError, clearUser } = useUserStore();

  useEffect(() => {
    const fetchCurrentUser = async () => {
      // Only fetch if we don't have user data
      if (!user) {
        setLoading(true);
        try {
          const userData = await userService.getCurrentUser();
          setUser(userData);
        } catch (error) {
          console.error("Failed to fetch user:", error);
          setError("Failed to load user data");
          // Don't clear user here - might be temporary network issue
        } finally {
          setLoading(false);
        }
      }
    };

    fetchCurrentUser();
  }, [user, setUser, setLoading, setError]);

  const logout = async () => {
    try {
      await userService.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Always clear user from store regardless of API call success
      clearUser();
      // Optional: redirect to home page
      window.location.href = "/";
    }
  };

  const refreshUser = async () => {
    setLoading(true);
    try {
      const userData = await userService.getCurrentUser();
      setUser(userData);
    } catch (error) {
      console.error("Failed to refresh user:", error);
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    logout,
    refreshUser, // Add this
    isLoading: useUserStore((state) => state.loading),
  };
};
