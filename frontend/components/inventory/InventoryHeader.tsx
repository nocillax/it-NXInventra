import { Inventory } from "@/types/shared";

interface InventoryHeaderProps {
  inventory: Inventory;
}

export function InventoryHeader({ inventory }: InventoryHeaderProps) {
  return (
    <div className="space-y-1">
      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
        {inventory.title}
      </h1>
      {inventory.description && (
        <p className="text-md sm:text-lg text-muted-foreground">
          {inventory.description}
        </p>
      )}
    </div>
  );
}
