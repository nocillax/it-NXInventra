// hooks/useItem.ts
"use client";

import useSWR from "swr";
import { Item } from "@/types/shared";
import { itemService } from "@/services/itemService";

export function useItem(
  itemId: string | undefined,
  options?: { isPaused?: boolean }
) {
  const { data, error, isLoading, mutate } = useSWR<Item>(
    itemId ? `/items/${itemId}` : null,
    () => itemService.getItem(itemId!),
    {
      refreshInterval: options?.isPaused ? 0 : 5000, // Only disable the interval
      revalidateOnFocus: true,
    }
  );

  return {
    item: data,
    error,
    isLoading,
    mutate,
  };
}
