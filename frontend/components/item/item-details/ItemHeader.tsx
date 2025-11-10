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
  canEdit?: boolean;
  mode?: "create" | "edit";
}

export function ItemHeader({
  customId,
  inventoryId,
  isEditing,
  onEdit,
  onSave,
  onCancel,
  onCreate,
  isSaving = false,
  mode,
  canEdit = false, // Default to false
}: ItemHeaderProps) {
  const router = useRouter();

  return (
    <div className="relative flex items-center justify-between w-full">
      {/* Back Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => router.push(`/inventories/${inventoryId}`)}
      >
        <ArrowLeft className="h-4 w-4" />
      </Button>

      {/* Centered Title */}
      <div className="absolute left-1/2 transform -translate-x-1/2 text-center">
        <h1 className="text-2xl font-bold">{customId}</h1>
      </div>

      {/* Action Buttons - Only show if user can edit OR in create mode */}
      <div className="flex items-center space-x-2">
        {mode === "create" ? (
          <>
            <Button onClick={onCreate} disabled={isSaving}>
              <Save className="h-4 w-4" />
            </Button>
            <Button variant="outline" onClick={onCancel} disabled={isSaving}>
              <X className="h-4 w-4" />
            </Button>
          </>
        ) : (
          canEdit &&
          (isEditing ? (
            <>
              <Button onClick={onSave} disabled={isSaving}>
                <Save className="h-4 w-4" />
              </Button>
              <Button variant="outline" onClick={onCancel} disabled={isSaving}>
                <X className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <Button onClick={onEdit}>
              <Pencil className="h-4 w-4" />
            </Button>
          ))
        )}
      </div>
    </div>
  );
}
