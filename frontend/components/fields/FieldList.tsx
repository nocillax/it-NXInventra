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
import { useModalStore } from "@/stores/useModalStore";
import { SortableFieldEditorRow } from "./SortableFieldEditorRow";

interface FieldListProps {
  inventory: Inventory; // The whole inventory is needed to construct updated field arrays
  onUpdateFields: (
    updatedFields: CustomField[],
    successMessage: string
  ) => void;
}

export function FieldList({ inventory, onUpdateFields }: FieldListProps) {
  const { onOpen } = useModalStore();
  const { customFields } = inventory;

  if (customFields.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No custom fields yet. Add one to get started.
      </p>
    );
  }

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = customFields.findIndex((f) => f.id === active.id);
      const newIndex = customFields.findIndex((f) => f.id === over.id);
      const reorderedFields = arrayMove(customFields, oldIndex, newIndex);
      onUpdateFields(reorderedFields, "Field order updated.");
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={customFields}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-4">
          {customFields.map((field) => (
            <SortableFieldEditorRow
              key={field.id}
              field={field}
              inventory={inventory}
              onUpdateFields={onUpdateFields}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
