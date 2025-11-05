// hooks/useAuth.ts
import { useEffect } from "react";
import { useUserStore } from "@/stores/useUserStore";
import { userService } from "@/services/userService";

export const useAuth = () => {
  const { user, setUser, setLoading, setError, clearUser } = useUserStore();

  useEffect(() => {
    const fetchCurrentUser = async () => {
      setLoading(true);
      try {
        const userData = await userService.getCurrentUser();
        setUser(userData);
      } catch (error: any) {
        if (
          error?.status === 401 ||
          error?.response?.status === 401 ||
          error?.message?.includes("401")
        ) {
          setUser(null); // Guest user
        } else {
          setError("Failed to load user data");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
  }, []);

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
