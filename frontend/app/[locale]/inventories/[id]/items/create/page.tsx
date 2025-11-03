// app/[locale]/inventories/[id]/items/create/page.tsx
"use client";

import { useParams, useRouter } from "next/navigation";
import { useInventory } from "@/hooks/useInventory";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import { itemService } from "@/services/itemService";
import { ItemForm } from "@/components/item/item-details/ItemForm";

export default function CreateItemPage() {
  const params = useParams();
  const router = useRouter();
  const inventoryId = params.id as string;
  const { inventory, isLoading: inventoryLoading } = useInventory(inventoryId);
  const t = useTranslations("ItemDetailPage");

  const [isSaving, setIsSaving] = useState(false);
  const [customId, setCustomId] = useState("");
  const [fields, setFields] = useState<Record<string, any>>({});

  const handleSave = async () => {
    if (!inventoryId) return;

    setIsSaving(true);

    try {
      // Prepare the create data
      const createData = {
        inventoryId,
        customId,
        fields: mapFieldTitlesToIds(fields, inventory),
      };

      await itemService.createItem(createData);

      toast.success("Item created successfully");
      router.push(`/inventories/${inventoryId}/items`);
    } catch (error: any) {
      toast.error("Failed to create item");
      console.error("Create error:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    router.push(`/inventories/${inventoryId}/items`);
  };

  const handleCustomIdChange = (value: string) => {
    setCustomId(value);
  };

  const handleFieldChange = (fieldTitle: string, value: any) => {
    setFields((prev) => ({
      ...prev,
      [fieldTitle]: value,
    }));
  };

  // Helper function to map field titles to field IDs
  const mapFieldTitlesToIds = (
    fields: Record<string, any>,
    inventory?: any
  ) => {
    const fieldUpdates: Record<string, any> = {};

    Object.keys(fields).forEach((fieldTitle) => {
      const fieldDefinition = inventory?.customFields?.find(
        (field: any) => field.title === fieldTitle
      );

      if (fieldDefinition) {
        fieldUpdates[fieldDefinition.id.toString()] = fields[fieldTitle];
      }
    });

    return fieldUpdates;
  };

  if (inventoryLoading) {
    return (
      <div className="container mx-auto p-6 space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <ItemForm
        mode="create"
        inventory={inventory}
        inventoryId={inventoryId}
        isEditing={true} // Always in editing mode for create
        editedCustomId={customId}
        editedFields={fields}
        isSaving={isSaving}
        onEdit={() => {}} // No-op for create mode
        onSave={handleSave}
        onCancel={handleCancel}
        onCustomIdChange={handleCustomIdChange}
        onFieldChange={handleFieldChange}
      />
    </div>
  );
}
