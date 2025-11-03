// components/item/item-details/ItemHeader.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Pencil, Save, X, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Inventory } from "@/types/shared";

interface ItemHeaderProps {
  customId: string;
  inventory?: Inventory;
  inventoryId: string;
  isEditing: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  isSaving?: boolean;
}

export function ItemHeader({
  customId,
  inventory,
  inventoryId,
  isEditing,
  onEdit,
  onSave,
  onCancel,
  isSaving = false,
}: ItemHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <Link href={`/inventories/${inventoryId}`}>
        <Button variant="ghost" size="icon">
          <ArrowLeft className="h-4 w-4" />
        </Button>
      </Link>

      {/* Centered title - always visible and stable */}
      <div className="text-center">
        <h1 className="text-3xl font-bold">{customId}</h1>
      </div>

      {/* Edit/Save buttons - always on the right */}
      <div className="flex items-center space-x-2">
        {isEditing ? (
          <>
            <Button onClick={onSave} disabled={isSaving}>
              <Save className="h-4 w-4" />
              {isSaving ? "Saving..." : "Save"}
            </Button>
            <Button variant="outline" onClick={onCancel} disabled={isSaving}>
              <X className="h-4 w-4" />
              Cancel
            </Button>
          </>
        ) : (
          <Button onClick={onEdit}>
            <Pencil className="h-4 w-4" />
            Edit
          </Button>
        )}
      </div>
    </div>
  );
}
