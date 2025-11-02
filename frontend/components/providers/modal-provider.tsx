"use client";

import { AccessRemoveDialog } from "@/components/access/AccessRemoveDialog";
import { AccessInviteDialog } from "@/components/access/AccessInviteDialog";
import { FieldDeleteDialog } from "@/components/fields/FieldDeleteDialog";
import { ItemCreateDialog } from "@/components/item/ItemCreateDialog";
import { ItemDeleteDialog } from "@/components/item/ItemDeleteDialog";
import { ItemEditDialog } from "@/components/item/ItemEditDialog";
import { InventoryCreateDialog } from "@/components/inventory/forms/InventoryCreateDialog";
import { InventoryDeleteDialog } from "@/components/settings/InventoryDeleteDialog";
import { useEffect, useState } from "react";

export const ModalProvider = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    <>
      <InventoryCreateDialog />
      <ItemCreateDialog />
      <ItemEditDialog />
      <ItemDeleteDialog />
      <FieldDeleteDialog />
      <AccessRemoveDialog />
      <AccessInviteDialog />
      <InventoryDeleteDialog />
    </>
  );
};
