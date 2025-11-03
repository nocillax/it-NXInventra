// components/fields/SortableFieldEditorRow.tsx - UPDATED
"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { FieldEditorRow } from "@/components/fields/FieldEditorRow";
import { CustomField, Inventory } from "@/types/shared";

interface SortableFieldEditorRowProps {
  field: CustomField;
  inventory: Inventory;
  onUpdateFields: (
    updatedFields: CustomField[],
    successMessage: string
  ) => void;
  isSelected: boolean;
  onFieldSelect: (field: CustomField) => void;
  onCheckboxChange: (fieldId: number, checked: boolean) => void;
}

export function SortableFieldEditorRow({
  field,
  inventory,
  onUpdateFields,
  isSelected,
  onFieldSelect,
  onCheckboxChange,
}: SortableFieldEditorRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: field.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleCheckboxChange = (checked: boolean) => {
    onCheckboxChange(field.id, checked);
    if (checked) {
      onFieldSelect(field);
    }
  };

  return (
    <FieldEditorRow
      ref={setNodeRef}
      style={style}
      field={field}
      isSelected={isSelected}
      onCheckboxChange={handleCheckboxChange}
      dragAttributes={attributes}
      dragListeners={listeners}
    />
  );
}
