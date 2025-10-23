"use client";

import useSWR from "swr";
import { Access } from "@/types/shared";
import { useAccessList } from "./useAccessList";
import { useMemo } from "react";

export function useAccess(inventoryId: string | undefined) {
  const { accessList: allAccess, ...rest } = useAccessList();

  const filteredAccessList = useMemo(
    () =>
      inventoryId && allAccess
        ? allAccess.filter((a) => a.inventoryId === inventoryId)
        : undefined,
    [inventoryId, allAccess]
  );

  return { accessList: filteredAccessList, ...rest };
}
