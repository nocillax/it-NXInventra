"use client";

import * as React from "react";
import { useSWRConfig } from "swr";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { DndContext, closestCenter, DragEndEvent } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  useSensor,
  useSensors,
  PointerSensor,
  KeyboardSensor,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { arrayMove } from "@dnd-kit/sortable";
import { v4 as uuidv4 } from "uuid";

import { IdSegment } from "@/types/shared";
import { useInventories } from "@/hooks/useInventories";
import { apiFetch } from "@/lib/apiClient";
import { Button } from "@/components/ui/button";
import { SortableIdSegmentRow } from "./SortableIdSegmentRow";
import { IDPreview } from "./IDPreview";

interface IDBuilderProps {
  inventory: any;
}

export function IDBuilder({ inventory }: IDBuilderProps) {
  const [segments, setSegments] = React.useState<IdSegment[]>(
    inventory.idFormat || []
  );
  const { mutate } = useSWRConfig();
  const { inventories } = useInventories();
  const t = useTranslations("IDBuilder");

  // Sync segments when inventory data changes
  React.useEffect(() => {
    setSegments(inventory.idFormat || []);
  }, [inventory.idFormat]);

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
    const apiSegments = segments.map((segment) => ({
      id: segment.id,
      type: segment.type,
      ...(segment.type === "fixed"
        ? { value: segment.value }
        : { format: segment.format }),
    }));

    const newInventoryState = { ...inventory, idFormat: apiSegments };

    // Optimistic UI Update
    mutate(`/inventories/${inventory.id}`, newInventoryState, {
      revalidate: false,
    });

    if (inventories) {
      const newInventories = inventories.map((inv) =>
        inv.id === inventory.id ? newInventoryState : inv
      );
      mutate("/inventories/me", newInventories, { revalidate: false });
    }

    try {
      await apiFetch(`/inventories/${inventory.id}`, {
        method: "PATCH",
        body: JSON.stringify({ idFormat: apiSegments }),
      });

      toast.success(t("success_message"));
      // Revalidate to get fresh data
      mutate(`/inventories/${inventory.id}`);
      mutate("/inventories/me");
    } catch (error) {
      toast.error(t("failure_message"));
      // Revert on error
      mutate(`/inventories/${inventory.id}`, inventory, { revalidate: false });
      if (inventories) {
        mutate("/inventories/me", inventories, { revalidate: false });
      }
    }
  };

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
