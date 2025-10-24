"use client";

import * as React from "react";
import { mutate } from "swr";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
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
import { Button } from "@/components/ui/button";
import { Inventory, IdSegment } from "@/types/shared";
import { useInventories } from "@/hooks/useInventories";
import { apiFetch } from "@/lib/apiClient";
import { IDPreview } from "@/components/customId/IDPreview";
import { SortableIdSegmentRow } from "@/components/customId/SortableIdSegmentRow";
import { useTranslations } from "next-intl";

interface IDBuilderProps {
  inventory: Inventory;
}

export function IDBuilder({ inventory }: IDBuilderProps) {
  const [segments, setSegments] = React.useState<IdSegment[]>(
    inventory.idFormat || []
  );

  React.useEffect(() => {
    setSegments(inventory.idFormat || []);
  }, [inventory.idFormat]);

  const { inventories } = useInventories();
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = segments.findIndex((s) => s.id === active.id);
      const newIndex = segments.findIndex((s) => s.id === over.id);
      const reordered = arrayMove(segments, oldIndex, newIndex);
      setSegments(reordered);
    }
  };

  const handleAddSegment = () => {
    const newSegment: IdSegment = { id: uuidv4(), type: "fixed", value: "" };
    setSegments([...segments, newSegment]);
  };

  const handleUpdateSegment = (updatedSegment: IdSegment) => {
    setSegments(
      segments.map((s) => (s.id === updatedSegment.id ? updatedSegment : s))
    );
  };

  const handleDeleteSegment = (segmentId: string) => {
    setSegments(segments.filter((s) => s.id !== segmentId));
  };

  const handleSaveChanges = async () => {
    const newInventoryState = { ...inventory, idFormat: segments };

    // Optimistic UI Update
    // Update the cache for the single inventory
    mutate(`/inventories/${inventory.id}`, newInventoryState, {
      revalidate: false,
    });

    // Update the cache for the list of inventories
    if (inventories) {
      const newInventories = inventories.map((inv) =>
        inv.id === inventory.id ? newInventoryState : inv
      );
      mutate("/inventories", newInventories, { revalidate: false });
    }

    try {
      await apiFetch(`/inventories/${inventory.id}`, {
        method: "PUT",
        body: JSON.stringify({ idFormat: segments }),
      });

      toast.success(t("success_message"));
      // Revalidate both to get fresh data from the "server"
      mutate(`/inventories/${inventory.id}`);
      mutate("/inventories");
    } catch (error) {
      toast.error(t("failure_message"));
      // Revert on error
      mutate(`/inventories/${inventory.id}`, inventory, { revalidate: false });
      if (inventories) {
        mutate("/inventories", inventories, { revalidate: false });
      }
    }
  };

  const t = useTranslations("IDBuilder");

  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
      {/* Segment Editor: Appears second on mobile, first on desktop */}
      <div className="order-2 md:col-span-2 md:order-1">
        <div className="space-y-4">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={segments}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {segments.map((segment) => (
                  <SortableIdSegmentRow
                    key={segment.id}
                    segment={segment}
                    onDelete={() => handleDeleteSegment(segment.id)}
                    onUpdate={handleUpdateSegment}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
          <div className="flex justify-between items-center pt-4">
            <Button variant="outline" onClick={handleAddSegment}>
              {t("add_segment_button")}
            </Button>
            <Button onClick={handleSaveChanges}>
              {t("save_changes_button")}
            </Button>
          </div>
        </div>
      </div>
      {/* ID Preview: Appears first on mobile, second on desktop */}
      <div className="order-1 md:col-span-1 md:order-2">
        <IDPreview segments={segments} />
      </div>
    </div>
  );
}
