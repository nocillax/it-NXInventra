"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { IdSegment } from "@/types/shared";
import { IdSegmentRow } from "./IdSegmentRow";

interface SortableIdSegmentRowProps {
  segment: IdSegment;
  onDelete: () => void;
  onUpdate: (updatedSegment: IdSegment) => void;
}

export function SortableIdSegmentRow({
  segment,
  onDelete,
  onUpdate,
}: SortableIdSegmentRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: segment.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <IdSegmentRow
      ref={setNodeRef}
      style={style}
      segment={segment}
      onDelete={onDelete}
      onUpdate={onUpdate}
      dragAttributes={attributes}
      dragListeners={listeners}
    />
  );
}
