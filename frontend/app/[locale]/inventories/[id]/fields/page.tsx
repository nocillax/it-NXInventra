"use client";

import { useParams } from "next/navigation";
import { useInventory } from "@/hooks/useInventory";
import { CustomFieldsEditor } from "@/components/fields/CustomFieldsEditor";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslations } from "next-intl";

export default function InventoryFieldsPage() {
  const params = useParams();
  const inventoryId = params.id as string;
  const { inventory, isLoading, mutate } = useInventory(inventoryId);
  const t = useTranslations("NotFoundPage");

  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-3">
        {/* Skeleton for the FieldList card */}
        <div className="md:col-span-2 space-y-4">
          <Skeleton className="h-10 w-1/3" />
          <div className="space-y-3">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        </div>
        {/* Skeleton for the Add Field card */}
        <div className="md:col-span-1 space-y-4">
          <Skeleton className="h-10 w-1/2" />
          <div className="space-y-6">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>
      </div>
    );
  }

  if (!inventory) return <p>{t("inventory_not_found")}</p>;

  return <CustomFieldsEditor inventory={inventory} />;
}
