"use client";

import { useParams } from "next/navigation";
import { useInventory } from "@/hooks/useInventory";
import { InventorySettingsForm } from "@/components/settings/InventorySettingsForm";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslations } from "next-intl";

export default function InventorySettingsPage() {
  const params = useParams();
  const inventoryId = params.id as string;
  const { inventory, isLoading, mutate } = useInventory(inventoryId);
  const t = useTranslations("NotFound");

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-10 w-24" />
      </div>
    );
  }

  if (!inventory) return <p>{t("inventory_not_found")}</p>;

  return <InventorySettingsForm inventory={inventory} onUpdate={mutate} />;
}
