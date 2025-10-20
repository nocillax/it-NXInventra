"use client";

import useSWR from "swr";
import { apiFetch } from "@/lib/apiClient";
import { Inventory } from "@/types/shared";

export function useInventories() {
  const { data, error, isLoading, mutate } = useSWR<Inventory[]>(
    "/inventories",
    apiFetch
  );

  return { inventories: data, error, isLoading, mutate };
}
