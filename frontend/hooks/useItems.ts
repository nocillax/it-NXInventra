// hooks/useItems.ts - WITH PAGINATION
"use client";

import useSWR from "swr";
import { Item } from "@/types/shared";
import { itemService } from "@/services/itemService";

interface ItemsResponse {
  items: Item[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface UseItemsOptions {
  page?: number;
  limit?: number;
}

export function useItems(
  inventoryId: string | undefined,
  options: UseItemsOptions = {}
) {
  const { page = 1, limit = 10 } = options;

  const { data, error, isLoading, mutate } = useSWR<ItemsResponse>(
    inventoryId
      ? `/inventories/${inventoryId}/items?page=${page}&limit=${limit}`
      : null,
    () => itemService.getItems(inventoryId!, page, limit),
    {
      refreshInterval: 5000,
      revalidateOnFocus: true,
    }
  );

  return {
    items: data?.items || [],
    pagination: data?.pagination,
    error,
    isLoading,
    mutate,
  };
}
