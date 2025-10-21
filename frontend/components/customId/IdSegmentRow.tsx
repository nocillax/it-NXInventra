"use client";

import * as React from "react";
import { DraggableAttributes } from "@dnd-kit/core";
import { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";
import { IdSegment, IdSegmentType } from "@/types/shared";
import { Button } from "@/components/ui/button";
import { GripVertical, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useTranslations } from "next-intl";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface IdSegmentRowProps extends React.HTMLAttributes<HTMLDivElement> {
  segment: IdSegment;
  onDelete: () => void;
  onUpdate: (updatedSegment: IdSegment) => void;
  dragAttributes: DraggableAttributes;
  dragListeners?: SyntheticListenerMap;
}

export const IdSegmentRow = React.forwardRef<HTMLDivElement, IdSegmentRowProps>(
  (
    { segment, onDelete, onUpdate, dragAttributes, dragListeners, ...props },
    ref
  ) => {
    const handleTypeChange = (type: IdSegmentType) => {
      onUpdate({ ...segment, type });
    };

    const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onUpdate({ ...segment, value: e.target.value });
    };

    const handleFormatChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onUpdate({ ...segment, format: e.target.value });
    };

    const t = useTranslations("IdSegmentRow");

    return (
      <div
        ref={ref}
        {...props}
        className="flex items-center gap-2 p-3 border bg-background rounded-md"
      >
        <div
          {...dragAttributes}
          {...dragListeners}
          className="cursor-grab touch-none p-2"
        >
          <GripVertical className="h-5 w-5 text-muted-foreground" />
        </div>
        <Select value={segment.type} onValueChange={handleTypeChange}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder={t("segment_type")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="fixed">{t("fixed_text")}</SelectItem>
            <SelectItem value="date">{t("date")}</SelectItem>
            <SelectItem value="sequence">{t("sequence")}</SelectItem>
          </SelectContent>
        </Select>
        {segment.type === "fixed" && (
          <Input
            placeholder={t("fixed_text_placeholder")}
            value={segment.value || ""}
            onChange={handleValueChange}
          />
        )}
        {segment.type === "date" && (
          <Input
            placeholder={t("date_placeholder")}
            value={segment.format || ""}
            onChange={handleFormatChange}
          />
        )}
        {segment.type === "sequence" && (
          <Input
            placeholder={t("sequence_placeholder")}
            value={segment.format || ""}
            onChange={handleFormatChange}
          />
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={onDelete}
          className="ml-auto"
        >
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </div>
    );
  }
);
IdSegmentRow.displayName = "IdSegmentRow";
