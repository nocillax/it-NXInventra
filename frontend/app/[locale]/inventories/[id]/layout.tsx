import * as React from "react";
import { InventoryLayoutContent } from "@/components/inventory/InventoryLayoutContent";

export default function InventoryDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="container mx-auto p-4">
      <InventoryLayoutContent>{children}</InventoryLayoutContent>
    </div>
  );
}
