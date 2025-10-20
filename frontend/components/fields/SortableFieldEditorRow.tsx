"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { FieldEditorRow } from "./FieldEditorRow";
import { CustomField, Inventory } from "@/types/shared";
import { useModalStore } from "@/stores/useModalStore";

interface SortableFieldEditorRowProps {
  field: CustomField;
  inventory: Inventory;
  onUpdateFields: (
    updatedFields: CustomField[],
    successMessage: string
  ) => void;
}

export function SortableFieldEditorRow({
  field,
  inventory,
  onUpdateFields,
}: SortableFieldEditorRowProps) {
  const { onOpen } = useModalStore();
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: field.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <FieldEditorRow
      ref={setNodeRef}
      style={style}
      field={field}
      onDelete={() =>
        onOpen("deleteCustomField", { inventoryId: inventory.id, field })
      }
      onToggleShowInTable={(checked) => {
        const updatedFields = inventory.customFields.map((f) =>
          f.id === field.id ? { ...f, showInTable: checked } : f
        );
        onUpdateFields(
          updatedFields,
          `Field "${field.name}" visibility updated.`
        );
      }}
      dragAttributes={attributes}
      dragListeners={listeners}
    />
  );
}
