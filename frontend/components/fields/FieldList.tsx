// components/fields/FieldList.tsx - UPDATED
"use client";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CustomField, Inventory } from "@/types/shared";
import { SortableFieldEditorRow } from "./SortableFieldEditorRow";
import { useTranslations } from "next-intl";
import { useMemo } from "react";

interface FieldListProps {
  inventory: Inventory;
  onUpdateFields: (
    updatedFields: CustomField[],
    successMessage: string
  ) => void;
  selectedFields: number[];
  onFieldSelect: (field: CustomField) => void;
  onCheckboxChange: (fieldId: number, checked: boolean) => void;
}

export function FieldList({
  inventory,
  onUpdateFields,
  selectedFields,
  onFieldSelect,
  onCheckboxChange,
}: FieldListProps) {
  const t = useTranslations("FieldList");

  // Sort fields by orderIndex to ensure consistent display
  const sortedFields = useMemo(() => {
    return [...inventory.customFields].sort(
      (a, b) => a.orderIndex - b.orderIndex
    );
  }, [inventory.customFields]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      // Optional: Add some delay to distinguish from clicks
      activationConstraint: {
        distance: 10,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = sortedFields.findIndex((f) => f.id === active.id);
      const newIndex = sortedFields.findIndex((f) => f.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        const reorderedFields = arrayMove(sortedFields, oldIndex, newIndex);

        // Update orderIndex for all reordered fields
        const updatedFieldsWithOrder = reorderedFields.map((field, index) => ({
          ...field,
          orderIndex: index,
        }));

        onUpdateFields(updatedFieldsWithOrder, t("orderUpdateSuccessMessage"));
      }
    }
  }

  if (sortedFields.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">{t("noFieldsMessage")}</p>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={sortedFields}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-4">
          {sortedFields.map((field) => (
            <SortableFieldEditorRow
              key={field.id}
              field={field}
              inventory={inventory}
              onUpdateFields={onUpdateFields}
              isSelected={selectedFields.includes(field.id)}
              onFieldSelect={onFieldSelect}
              onCheckboxChange={onCheckboxChange}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
