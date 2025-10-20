"use client";

import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Inventory } from "@/types/shared";
import { apiFetch } from "@/lib/apiClient";

interface VisibilityToggleProps {
  inventory: Inventory;
  onUpdate: (data?: any, options?: any) => Promise<any>;
}

export function VisibilityToggle({
  inventory,
  onUpdate,
}: VisibilityToggleProps) {
  const handleVisibilityChange = async (isPublic: boolean) => {
    const optimisticData = { ...inventory, public: isPublic };
    onUpdate(optimisticData, { revalidate: false });

    try {
      await apiFetch(`/inventories/${inventory.id}`, {
        method: "PUT",
        body: JSON.stringify({ public: isPublic }),
      });
      toast.success(`Inventory is now ${isPublic ? "Public" : "Private"}.`);
    } catch (error) {
      toast.error("Failed to update visibility.");
      onUpdate(inventory, { revalidate: false });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Visibility</CardTitle>
        <CardDescription>
          {inventory.public
            ? "This inventory is public and can be viewed by anyone."
            : "This inventory is private and only accessible to collaborators."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-2">
          <Switch
            id="visibility-toggle"
            checked={inventory.public}
            onCheckedChange={handleVisibilityChange}
          />
          <Label htmlFor="visibility-toggle">
            {inventory.public ? "Public" : "Private"}
          </Label>
        </div>
      </CardContent>
    </Card>
  );
}
