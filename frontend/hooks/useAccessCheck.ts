import useSWR from "swr";
import { apiFetch } from "@/lib/apiClient";

interface AccessResponse {
  role: "Owner" | "Editor" | "Viewer";
}

export function useAccessCheck(inventoryId: string) {
  const { data, error, isLoading } = useSWR(
    inventoryId ? `/inventories/${inventoryId}/access/me` : null,
    () =>
      apiFetch(
        `/inventories/${inventoryId}/access/me`
      ) as Promise<AccessResponse>
  );

  return {
    role: data?.role,
    isLoading,
    error,
  };
}
