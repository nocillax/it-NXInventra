"use client";

import useSWR from "swr";
import { getItems } from "@/lib/api/items";
import { Item } from "@/types/shared";

export function useItems(inventoryId: string) {
  const { data, error, isLoading, mutate } = useSWR<Item[] | null>(
    inventoryId ? `/items?inventoryId=${inventoryId}` : null,
    () => getItems(inventoryId)
  );

  return { items: data, error, isLoading, mutate };
}
