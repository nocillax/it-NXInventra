// hooks/useMyInventories.ts
"use client";

import useSWR from "swr";
import { Inventory } from "@/types/shared";
import { apiFetch } from "@/lib/apiClient";

export function useMyInventories() {
  const { data, error, isLoading, mutate } = useSWR<{
    inventories: Inventory[];
    pagination: any;
  }>("/inventories/me", apiFetch);

  return {
    inventories: data?.inventories || [],
    error,
    isLoading,
    mutate,
  };
}
