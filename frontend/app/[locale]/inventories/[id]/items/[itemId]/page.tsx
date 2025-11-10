"use client";

import { useParams } from "next/navigation";
import { useItem } from "@/hooks/useItem";
import { useInventory } from "@/hooks/useInventory";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslations } from "next-intl";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { itemService } from "@/services/itemService";
import { UpdateItemData } from "@/types/shared";
import { useRouter } from "@/navigation";
import { useRbac } from "@/hooks/useRbac";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ItemFieldsSection } from "@/components/item/item-details/ItemFieldsSection";
import { ItemHeader } from "@/components/item/item-details/ItemHeader";

export default function ItemDetailPage() {
  const params = useParams();
  const inventoryId = params.id as string;
  const itemId = params.itemId as string;
  const router = useRouter();
  const t = useTranslations("ItemDetailPage");

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    customId: "",
    fields: {} as Record<string, any>,
  });
  const [editStartVersion, setEditStartVersion] = useState<number>(0);

  const { item, isLoading, mutate } = useItem(itemId, { isPaused: isEditing });
  const { inventory, isLoading: inventoryLoading } = useInventory(inventoryId, {
    isPaused: isEditing,
  });
  const { canEdit } = useRbac(inventory);

  // Initialize form data
  useEffect(() => {
    if (item) {
      setFormData({
        customId: item.customId,
        fields: { ...item.fields },
      });
    }
  }, [item]);

  const handleEdit = () => {
    setEditStartVersion(item?.version || 0);
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!item) return;

    // Check for changes
    const hasFieldChanges = Object.keys(formData.fields).some(
      (fieldTitle) => formData.fields[fieldTitle] !== item.fields?.[fieldTitle]
    );
    const hasCustomIdChange = formData.customId !== item.customId;

    if (!hasFieldChanges && !hasCustomIdChange) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);

    try {
      const fieldUpdates: Record<string, any> = {};

      if (hasFieldChanges) {
        Object.keys(formData.fields).forEach((fieldTitle) => {
          if (formData.fields[fieldTitle] !== item.fields?.[fieldTitle]) {
            const fieldDef = inventory?.customFields?.find(
              (f) => f.title === fieldTitle
            );
            if (fieldDef)
              fieldUpdates[fieldDef.id.toString()] =
                formData.fields[fieldTitle];
          }
        });
      }

      const updateData: UpdateItemData = { version: editStartVersion };
      if (Object.keys(fieldUpdates).length > 0)
        updateData.fields = fieldUpdates;
      if (hasCustomIdChange) updateData.customId = formData.customId;

      await itemService.updateItem(itemId, updateData);
      toast.success("Item updated successfully");
      setIsEditing(false);
      mutate();
    } catch (error: any) {
      toast.error(error.message || "Failed to update item");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      customId: item?.customId || "",
      fields: { ...item?.fields },
    });
    setIsEditing(false);
  };

  const handleCustomIdChange = (value: string) => {
    setFormData((prev) => ({ ...prev, customId: value }));
  };

  const handleFieldChange = (fieldTitle: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      fields: { ...prev.fields, [fieldTitle]: value },
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

  if (!item || !inventory) {
    return (
      <div className="container mx-auto p-6">
        <p>{t("not_found")}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <ItemHeader
            customId={isEditing ? formData.customId : item.customId}
            inventory={inventory}
            inventoryId={inventoryId}
            isEditing={isEditing}
            isSaving={isSaving}
            canEdit={canEdit}
            onEdit={handleEdit}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        </CardHeader>
        <CardContent className="space-y-6">
          <ItemFieldsSection
            inventory={inventory}
            itemFields={isEditing ? formData.fields : item.fields}
            isEditing={isEditing}
            customId={isEditing ? formData.customId : item.customId}
            onCustomIdChange={handleCustomIdChange}
            onFieldChange={handleFieldChange}
            mode="edit"
          />
        </CardContent>
      </Card>
    </div>
  );
}
