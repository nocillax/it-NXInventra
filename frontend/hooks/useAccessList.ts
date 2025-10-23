import useSWR from "swr";
import { apiFetch } from "@/lib/apiClient";
import { Access } from "@/types/shared";

export function useAccessList() {
  const { data, error, isLoading, mutate } = useSWR<Access[]>(
    "/access", // This path will be handled by fetchMock
    apiFetch,
    { revalidateOnFocus: false }
  );

  return { accessList: data, error, isLoading, mutate };
}
