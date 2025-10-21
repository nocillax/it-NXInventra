"use client";

import { useParams } from "next/navigation";
import { useInventory } from "@/hooks/useInventory";
import { IDBuilder } from "@/components/customId/IDBuilder";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslations } from "use-intl";

export default function InventoryCustomIdPage() {
  const params = useParams();
  const inventoryId = params.id as string;
  const { inventory, isLoading, mutate } = useInventory(inventoryId);
  const t = useTranslations("CustomIdPage");

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  if (!inventory) return <p>{t("inventory_not_found")}</p>;

  return <IDBuilder inventory={inventory} />;
}
