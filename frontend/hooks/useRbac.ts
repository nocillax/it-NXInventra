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

  const effectiveRole: Role | "PublicViewer" | "None" | "Loading" | "Admin" =
    useMemo(() => {
      if (!inventory) return "None";
      if (isLoadingAccess) return "Loading";

      // If user is admin, they have full access to everything
      if (user?.isAdmin) {
        return "Admin";
      }

      // If user has explicit role, use it
      if (userAccess?.role) {
        return userAccess.role;
      }

      // If inventory is public, anyone can view
      if (inventory.public) {
        return "PublicViewer";
      }

      return "None";
    }, [inventory, userAccess, isLoadingAccess, user?.isAdmin]);

  const isOwner = effectiveRole === "Owner" || effectiveRole === "Admin";
  const isEditor = effectiveRole === "Editor" || effectiveRole === "Admin";
  const isViewer =
    effectiveRole === "Viewer" ||
    effectiveRole === "PublicViewer" ||
    effectiveRole === "Admin";
  const isAdmin = effectiveRole === "Admin";
  const isLoading = effectiveRole === "Loading";

  const canView = isOwner || isEditor || isViewer || isAdmin;
  const canEdit = isOwner || isEditor || isAdmin;

  return {
    effectiveRole,
    isOwner,
    isEditor,
    isViewer,
    isAdmin,
    canView,
    canEdit,
    isLoading,
    error,
  };
}
