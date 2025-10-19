"use client";

import useSWR from "swr";
import { apiFetch } from "@/lib/apiClient";
import { Item } from "@/types/shared";

async function itemsFetcher(path: string) {
  // path is like "/inventories/inv_computers/items"
  const inventoryId = path.split("/")[2];
  const allItems: Item[] = await apiFetch("/items");
  return allItems.filter((item) => item.inventoryId === inventoryId);
}

export function useItems(inventoryId: string) {
  const { data, error, isLoading, mutate } = useSWR<Item[]>(
    inventoryId ? `/inventories/${inventoryId}/items` : null,
    itemsFetcher
  );

  return { items: data, error, isLoading, mutate };
}
