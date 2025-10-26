"use client";

import { useMemo } from "react";
import { Inventory, Role } from "@/types/shared";
import { useUserStore } from "@/stores/useUserStore";
import { useAccessList } from "./useAccessList";

export function useRbac(inventory: Inventory | null | undefined) {
  const { user } = useUserStore();
  const { accessList, isLoading: isLoadingAccess } = useAccessList();

  const effectiveRole: Role | "PublicViewer" | "None" = useMemo(() => {
    if (!inventory) return "None";

    // Find the user's explicit role for this inventory
    const userAccess = accessList?.find(
      (a) => a.inventoryId === inventory.id && a.userId === user?.id
    );

    if (userAccess) {
      return userAccess.role;
    }

    // If no explicit role, check if the inventory is public
    if (inventory.public) {
      return "PublicViewer";
    }

    // If private and no role, no access
    return "None";
  }, [inventory, accessList, user]);

  const isOwner = effectiveRole === "Owner";
  const isEditor = effectiveRole === "Editor";
  const isViewer =
    effectiveRole === "Viewer" || effectiveRole === "PublicViewer";

  const canView = isOwner || isEditor || isViewer;
  const canEdit = isOwner || isEditor;

  return {
    effectiveRole,
    isOwner,
    isEditor,
    isViewer,
    canView,
    canEdit,
    isLoading: isLoadingAccess,
  };
}
