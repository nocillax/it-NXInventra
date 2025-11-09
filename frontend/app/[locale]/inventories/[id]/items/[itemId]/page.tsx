"use client";

import { useParams } from "next/navigation";
import { useItem } from "@/hooks/useItem";
import { useInventory } from "@/hooks/useInventory";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslations } from "next-intl";
import { ItemDetailView } from "@/components/item/item-details/ItemDetailView";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { itemService } from "@/services/itemService";
import { UpdateItemData } from "@/types/shared";
import { CreateItemData } from "@/types/shared";
import { useRouter } from "@/navigation";

export default function ItemDetailPage() {
  const params = useParams();
  const inventoryId = params.id as string;
  const itemId = params.itemId as string;
  const router = useRouter();

  const t = useTranslations("ItemDetailPage");

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editedCustomId, setEditedCustomId] = useState("");
  const [editedFields, setEditedFields] = useState<Record<string, any>>({});
  const [editStartVersion, setEditStartVersion] = useState<number>(0);

  // Pause SWR when editing
  const { item, isLoading, mutate } = useItem(itemId, {
    isPaused: isEditing,
  });

  const { inventory, isLoading: inventoryLoading } = useInventory(inventoryId);

  // Initialize form state when item loads
  useEffect(() => {
    if (item) {
      setEditedCustomId(item.customId);
      setEditedFields({ ...item.fields });
    }
  }, [item]);

  const handleEdit = () => {
    console.log("Version on edit:", item?.version);
    setEditStartVersion(item?.version || 0); // Store the version when editing starts
    setIsEditing(true);
  };

  const handleSave = async () => {
    console.log("Version on start of save:", item?.version);
    if (!item) return;

    // Check if there are any changes
    const hasFieldChanges = Object.keys(editedFields).some((fieldTitle) => {
      const originalValue = item.fields?.[fieldTitle];
      const newValue = editedFields[fieldTitle];
      return newValue !== originalValue;
    });

    const hasCustomIdChange = editedCustomId !== item.customId;

    // If no changes, just exit edit mode
    if (!hasFieldChanges && !hasCustomIdChange) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);

    try {
      // Map field titles to field IDs
      const fieldUpdates: Record<string, any> = {};

      if (hasFieldChanges) {
        Object.keys(editedFields).forEach((fieldTitle) => {
          const originalValue = item.fields?.[fieldTitle];
          const newValue = editedFields[fieldTitle];

          if (newValue !== originalValue) {
            const fieldDefinition = inventory?.customFields?.find(
              (field) => field.title === fieldTitle
            );

            if (fieldDefinition) {
              fieldUpdates[fieldDefinition.id.toString()] = newValue;
            }
          }
        });
      }

      // Prepare update data with correct type
      const updateData: UpdateItemData = {
        version: editStartVersion,
      };

      // Only include fields if there are field changes
      if (Object.keys(fieldUpdates).length > 0) {
        updateData.fields = fieldUpdates;
      }

      // Only include customId if it changed
      if (hasCustomIdChange) {
        updateData.customId = editedCustomId;
      }

      // Use the fixed service
      await itemService.updateItem(itemId, updateData);

      toast.success("Item updated successfully");
      setIsEditing(false);
      // Force SWR to refresh the data
      mutate();
    } catch (error: any) {
      console.error("Update item error:", error);

      // Just show whatever error message comes from the backend
      const errorMessage = error.message || "Failed to update item";
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditedCustomId(item?.customId || "");
    setEditedFields({ ...item?.fields });
    setIsEditing(false);
  };

  const handleCustomIdChange = (value: string) => {
    setEditedCustomId(value);
  };

  const handleFieldChange = (fieldTitle: string, value: any) => {
    setEditedFields((prev) => ({
      ...prev,
      [fieldTitle]: value,
    }));
  };

  if (isLoading || inventoryLoading) {
    return (
      <div className="container mx-auto p-6 space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="container mx-auto p-6">
        <p>{t("not_found")}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <ItemDetailView
        item={item}
        inventory={inventory}
        inventoryId={inventoryId}
        isEditing={isEditing}
        editedCustomId={editedCustomId}
        editedFields={editedFields}
        isSaving={isSaving}
        onEdit={handleEdit}
        onSave={handleSave}
        onCancel={handleCancel}
        onCustomIdChange={handleCustomIdChange}
        onFieldChange={handleFieldChange}
      />
    </div>
  );
}
