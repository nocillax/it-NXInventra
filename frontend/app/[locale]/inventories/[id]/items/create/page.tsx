// app/[locale]/inventories/[id]/items/create/page.tsx
"use client";

import { useParams } from "next/navigation";
import { useInventory } from "@/hooks/useInventory";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { itemService } from "@/services/itemService";
import { ItemForm } from "@/components/item/item-details/ItemForm";
import { CreateItemData, NewItem } from "@/types/shared";
import { useRouter } from "@/navigation";

export default function CreateItemPage() {
  const params = useParams();
  const router = useRouter();
  const inventoryId = params.id as string;
  const {
    inventory,
    isLoading: inventoryLoading,
    mutate,
  } = useInventory(inventoryId);
  const t = useTranslations("CreateItemPage");
  const [editedFields, setEditedFields] = useState<Record<string, any>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
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

      await itemService.createItem(inventoryId, createData);

      toast.success(t("create_success"));
      router.push(`/inventories/${inventoryId}`);
    } catch (error: any) {
      toast.error(t("create_error"));
      console.error("Create error:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    router.push(`/inventories/${inventoryId}`);
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

  useEffect(() => {
    if (inventory?.customFields) {
      setFields((prevFields) => {
        const updatedFields = { ...prevFields };
        inventory.customFields.forEach((field) => {
          if (field.type === "boolean" && !(field.title in updatedFields)) {
            updatedFields[field.title] = false; // Only set if not already set
          }
        });
        return updatedFields;
      });
    }
  }, [inventory]);

  const handleCreate = async () => {
    // Validate that all required fields have values - use FIELDS not editedFields
    const missingFields: string[] = [];

    inventory?.customFields?.forEach((field) => {
      const fieldValue = fields[field.title]; // Use fields, not editedFields
      if (
        fieldValue === undefined ||
        fieldValue === null ||
        fieldValue === ""
      ) {
        missingFields.push(field.title);
      }
    });

    if (missingFields.length > 0) {
      toast.error(
        t("required_fields_error", { fields: missingFields.join(", ") })
      );
      return;
    }

    setIsSaving(true);

    try {
      // Map ALL field titles to field IDs for creation - use FIELDS
      const fieldValues: Record<string, any> = {};

      inventory?.customFields?.forEach((field) => {
        const fieldValue = fields[field.title]; // Use fields, not editedFields
        fieldValues[field.id.toString()] = fieldValue;
      });

      // Prepare create data
      const createData: NewItem = {
        fields: fieldValues,
      } as NewItem;

      // Use the create service
      await itemService.createItem(inventoryId, createData);

      toast.success(t("create_success"));

      // Reset form and navigate back
      setFields({});
      router.push(`/inventories/${inventoryId}`);
    } catch (error: any) {
      console.error("Create item error:", error);
      toast.error(t("create_error"));
    } finally {
      setIsSaving(false);
    }
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
        isEditing={true}
        editedCustomId={customId}
        editedFields={fields} // Pass fields, not editedFields
        isSaving={isSaving}
        onEdit={() => {}}
        onSave={handleSave}
        onCancel={handleCancel}
        onCreate={handleCreate} // Make sure this is handleCreate
        onCustomIdChange={handleCustomIdChange}
        onFieldChange={handleFieldChange}
      />
    </div>
  );
}
