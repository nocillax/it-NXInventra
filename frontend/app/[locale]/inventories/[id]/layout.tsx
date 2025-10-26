import * as React from "react";
import { getInventory } from "@/lib/api/inventories";
import { notFound } from "next/navigation";
import { InventoryHeader } from "@/components/inventory/InventoryHeader";
import { InventoryToolbar } from "@/components/inventory/InventoryToolbar";
import { PageContainer } from "@/components/shared/PageContainer";

export default async function InventoryDetailLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { id: string };
}) {
  const inventory = await getInventory(params.id);

  if (!inventory) {
    notFound();
  }

  return (
    <div className="container mx-auto p-4">
      <div className="space-y-4">
        <InventoryHeader inventory={inventory} />
        <InventoryToolbar inventory={inventory} />
        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}
