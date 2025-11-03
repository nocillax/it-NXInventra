import useSWR from "swr";
import { User } from "@/types/shared";
import { apiFetch } from "@/lib/apiClient";

export function useUserSearch(query: string) {
  const { data, error, isLoading } = useSWR(
    query ? `/user/search?q=${encodeURIComponent(query)}` : null,
    () => apiFetch(`/user/search?q=${encodeURIComponent(query)}`),
    {
      dedupingInterval: 300, // Avoid duplicate requests
    }
  );

  return {
    users: data as User[] | undefined,
    isLoading,
    error,
  };
}
