"use client";

import useSWR from "swr";

import { Inventory } from "@/types/shared";
import { getInventories } from "@/lib/api/inventories";

export function useInventories() {
  const { data, error, isLoading, mutate } = useSWR<Inventory[]>(
    "/inventories",
    getInventories
  );

  return { inventories: data, error, isLoading, mutate };
}
