"use client";

import { useParams } from "next/navigation";
import { useInventory } from "@/hooks/useInventory";
import { useAccess } from "@/hooks/useAccess";
import { useUsers } from "@/hooks/useUsers";
import { AccessList } from "@/components/access/AccessList";
import { AccessInvite } from "@/components/access/AccessInvite";
import { VisibilityToggle } from "@/components/access/VisibilityToggle";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslations } from "next-intl";

export default function InventoryAccessPage() {
  const params = useParams();
  const inventoryId = params.id as string;

  const {
    inventory,
    isLoading: isLoadingInventory,
    mutate: mutateInventory,
  } = useInventory(inventoryId);
  const { accessList, isLoading: isLoadingAccess } = useAccess(inventoryId);
  const { users, isLoading: isLoadingUsers } = useUsers();

  const isLoading = isLoadingInventory || isLoadingAccess || isLoadingUsers;
  const t = useTranslations("AccessPages");
  return (
    <div className="space-y-6">
      {inventory && (
        <VisibilityToggle inventory={inventory} onUpdate={mutateInventory} />
      )}
      <div className="space-y-2">
        <h3 className="text-lg font-medium">{t("title")}</h3>
        {inventory && <AccessInvite inventoryId={inventory.id} />}
      </div>
      {isLoading && (
        <div className="space-y-2">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      )}
      {!isLoading && accessList && users && inventory && (
        <AccessList
          accessList={accessList}
          users={users}
          inventoryId={inventory.id}
          createdBy={inventory.createdBy}
        />
      )}
    </div>
  );
}
