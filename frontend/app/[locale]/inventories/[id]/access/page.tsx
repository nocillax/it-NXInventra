"use client";

import { useParams } from "next/navigation";
import { useInventory } from "@/hooks/useInventory";
import { useAccess } from "@/hooks/useAccess";
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

  const isLoading = isLoadingInventory || isLoadingAccess;
  const t = useTranslations("AccessPages");

  return (
    <>
      {isLoading || !inventory || !accessList ? (
        <div className="space-y-2">
          {/* Skeleton for VisibilityToggle */}
          <Skeleton className="h-24 w-full" />
          {/* Skeleton for AccessInvite */}
          <Skeleton className="h-20 w-full" />
          {/* Skeleton for AccessList */}
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : (
        <div className="space-y-6">
          <div className="space-y-2">
            <AccessInvite inventoryId={inventory.id} />
          </div>
          <AccessList accessList={accessList} inventoryId={inventory.id} />
        </div>
      )}
    </>
  );
}
