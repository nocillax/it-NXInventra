import * as React from "react";
import { getInventory } from "@/lib/api/inventories";
import { notFound } from "next/navigation";
import { PageContainer } from "@/components/shared/PageContainer";
import { InventoryHeader } from "@/components/inventory/InventoryHeader";
import { InventoryToolbar } from "@/components/inventory/InventoryToolbar";

export default async function InventoryDetailLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { id: string };
}) {
  const inventoryId = params.id;
  const inventory = await getInventory(inventoryId);

  if (!inventory) {
    notFound();
  }

  return (
    <PageContainer>
      <InventoryHeader inventory={inventory} />
      <InventoryToolbar inventoryId={inventory.id} />
      <div className="mt-6">{children}</div>
    </PageContainer>
  );
}
