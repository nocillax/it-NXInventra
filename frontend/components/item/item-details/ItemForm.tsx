// components/item/item-details/ItemForm.tsx
"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Inventory } from "@/types/shared";
import { ItemHeader } from "./ItemHeader";
import { ItemFieldsSection } from "./ItemFieldsSection";

interface ItemFormProps {
  mode: "create" | "edit";
  item?: {
    id: string;
    customId: string;
    fields: Record<string, any>;
  };
  inventory?: Inventory & { customIdFormat?: { format: string } };
  inventoryId: string;
  isEditing: boolean;
  editedCustomId: string;
  editedFields: Record<string, any>;
  isSaving: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onCustomIdChange: (value: string) => void;
  onFieldChange: (fieldTitle: string, value: any) => void;
}

export function ItemForm({
  mode,
  item,
  inventory,
  inventoryId,
  isEditing,
  editedCustomId,
  editedFields,
  isSaving,
  onEdit,
  onSave,
  onCancel,
  onCustomIdChange,
  onFieldChange,
}: ItemFormProps) {
  const displayCustomId =
    mode === "edit" && !isEditing ? item?.customId : editedCustomId;
  const displayFields =
    mode === "edit" && !isEditing ? item?.fields : editedFields;

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <ItemHeader
          customId={displayCustomId || ""}
          inventory={inventory}
          inventoryId={inventoryId}
          isEditing={isEditing}
          isSaving={isSaving}
          onEdit={onEdit}
          onSave={onSave}
          onCancel={onCancel}
        />
      </CardHeader>
      <CardContent className="space-y-6">
        <ItemFieldsSection
          inventory={inventory}
          itemFields={displayFields || {}}
          isEditing={isEditing || mode === "create"} // Always editing in create mode
          customId={editedCustomId}
          onCustomIdChange={onCustomIdChange}
          onFieldChange={onFieldChange}
        />
      </CardContent>
    </Card>
  );
}
