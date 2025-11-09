// components/item/item-details/ItemHeader.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Pencil, Save, X, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Inventory } from "@/types/shared";
import { useRouter } from "@/navigation";

interface ItemHeaderProps {
  customId: string;
  inventory?: Inventory;
  inventoryId: string;
  isEditing: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onCreate?: () => void;
  isSaving?: boolean;
  mode?: "create" | "edit";
}

export function ItemHeader({
  customId,
  inventory,
  inventoryId,
  isEditing,
  onEdit,
  onSave,
  onCancel,
  onCreate,
  isSaving = false,
  mode,
}: ItemHeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    router.push(`/inventories/${inventoryId}`);
  };

  return (
    <div className="relative flex items-center justify-between w-full">
      {/* Left (Back Button) */}
      <div className="flex-shrink-0">
        <Button variant="ghost" size="icon" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
      </div>

      {/* Center (Title - absolutely centered, independent of sides) */}
      <div className="absolute left-1/2 transform -translate-x-1/2 text-center">
        <h1 className="text-2xl font-bold">{customId}</h1>
      </div>

      {/* Right (Edit / Save buttons) */}
      <div className="flex items-center justify-end space-x-2 flex-shrink-0">
        {isEditing ? (
          <>
            {mode === "create" && (
              <Button onClick={onCreate} disabled={isSaving}>
                <Save className="h-4 w-4" />
                {isSaving ? "Creating..." : "Create"}
              </Button>
            )}
            {mode !== "create" && (
              <Button onClick={onSave} disabled={isSaving}>
                <Save className="h-4 w-4" />
              </Button>
            )}
            {mode !== "create" && (
              <Button variant="outline" onClick={onCancel} disabled={isSaving}>
                <X className="h-4 w-4" />
              </Button>
            )}
            {/* <Button variant="outline" onClick={onCancel} disabled={isSaving}>
              <X className="h-4 w-4" />
              Cancel
            </Button> */}
          </>
        ) : (
          <Button onClick={onEdit}>
            <Pencil className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
