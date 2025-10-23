import { Inventory } from "@/types/shared";

interface InventoryHeaderProps {
  inventory: Inventory;
}

export function InventoryHeader({ inventory }: InventoryHeaderProps) {
  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">{inventory.title}</h1>
      <p className="text-muted-foreground">{inventory.description}</p>
    </div>
  );
}
