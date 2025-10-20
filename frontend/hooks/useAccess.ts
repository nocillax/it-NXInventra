"use client";

import useSWR from "swr";
import { apiFetch } from "@/lib/apiClient";
import { Access } from "@/types/shared";

async function accessFetcher(path: string) {
  // The real API will be `/api/inventories/:id/access`
  const inventoryId = path.split("/")[2];
  const allAccess: Access[] = await apiFetch("/access");
  return allAccess.filter((a) => a.inventoryId === inventoryId);
}

export function useAccess(inventoryId: string | undefined) {
  const { data, error, isLoading, mutate } = useSWR<Access[]>(
    inventoryId ? `/inventories/${inventoryId}/access` : null,
    accessFetcher
  );

  return { accessList: data, error, isLoading, mutate };
}
