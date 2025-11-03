// hooks/useAccessList.ts - TEMPORARY FIX
import useSWR from "swr";
import { apiFetch } from "@/lib/apiClient";
import { Access } from "@/types/shared";

export function useAccessList() {
  // For explore page, we don't need access list - return empty array
  const { data, error, isLoading, mutate } = useSWR<Access[]>(
    null, // Don't call any endpoint for now
    () => [] // Return empty array
  );

  return { accessList: data, error, isLoading, mutate };
}
