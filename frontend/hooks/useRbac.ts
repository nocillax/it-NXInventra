// hooks/useRbac.ts - WITH BETTER LOADING STATES
"use client";

import { useMemo } from "react";
import useSWR from "swr";
import { Inventory, Role } from "@/types/shared";
import { useAuth } from "./useAuth";
import { apiFetch } from "@/lib/apiClient";

interface AccessResponse {
  role: Role;
}

export function useRbac(inventory: Inventory | null | undefined) {
  const { user } = useAuth();

  const {
    data: userAccess,
    isLoading: isLoadingAccess,
    error,
  } = useSWR<AccessResponse>(
    inventory && user ? `/inventories/${inventory.id}/access/me` : null,
    () => apiFetch(`/inventories/${inventory!.id}/access/me`),
    {
      revalidateOnFocus: true,
      dedupingInterval: 30000,
      shouldRetryOnError: false,
    }
  );

  const effectiveRole: Role | "PublicViewer" | "None" | "Loading" =
    useMemo(() => {
      if (!inventory) return "None";
      if (isLoadingAccess) return "Loading";

      // If user has explicit role, use it
      if (userAccess?.role) {
        return userAccess.role;
      }

      // If inventory is public, anyone can view
      if (inventory.public) {
        return "PublicViewer";
      }

      return "None";
    }, [inventory, userAccess, isLoadingAccess]);

  const isOwner = effectiveRole === "Owner";
  const isEditor = effectiveRole === "Editor";
  const isViewer =
    effectiveRole === "Viewer" || effectiveRole === "PublicViewer";
  const isLoading = effectiveRole === "Loading";

  const canView = isOwner || isEditor || isViewer;
  const canEdit = isOwner || isEditor;

  return {
    effectiveRole,
    isOwner,
    isEditor,
    isViewer,
    canView,
    canEdit,
    isLoading,
    error,
  };
}
