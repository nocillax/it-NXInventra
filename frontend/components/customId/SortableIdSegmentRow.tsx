"use client";

import * as React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, X, Info } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { IdSegment } from "@/types/shared";
import { EmojiPicker } from "@/components/ui/emoji-picker";
import { useTranslations } from "next-intl";

interface SortableIdSegmentRowProps {
  segment: IdSegment;
  onUpdate: (segment: IdSegment) => void;
  onDelete: () => void;
}

export function SortableIdSegmentRow({
  segment,
  onUpdate,
  onDelete,
}: SortableIdSegmentRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: segment.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const t = useTranslations("CustomIdInput");

  const handleTypeChange = (type: IdSegment["type"]) => {
    // Clear existing data and set appropriate default
    const newSegment = { ...segment, type };

    if (type === "fixed") {
      newSegment.value = "";
      delete newSegment.format;
    } else {
      newSegment.format = getDefaultFormatForType(type);
      delete newSegment.value;
    }

    onUpdate(newSegment);
  };

  const handleFixedValueChange = (value: string) => {
    onUpdate({ ...segment, value, type: "fixed" });
  };

  const handleFormatChange = (format: string) => {
    onUpdate({ ...segment, format, type: segment.type });
  };

  const getDefaultFormatForType = (type: IdSegment["type"]): string => {
    switch (type) {
      case "date":
        return "yyyy";
      case "sequence":
        return "D1";
      case "random_20bit":
        return "X5";
      case "random_32bit":
        return "X8";
      case "random_6digit":
      case "random_9digit":
      case "guid":
        return "";
      default:
        return "";
    }
  };

  const getInputValue = (): string => {
    return segment.type === "fixed"
      ? segment.value || ""
      : segment.format || "";
  };

  const handleInputChange = (newValue: string) => {
    if (segment.type === "fixed") {
      handleFixedValueChange(newValue);
    } else {
      handleFormatChange(newValue);
    }
  };

  const validateInput = (type: string, value: string): boolean => {
    switch (type) {
      case "fixed":
        return value.length > 0;
      case "date":
        return /^(yyyy|mm|dd|ddd)(.*)?$/.test(value);
      case "sequence":
        return /^D([1-9]|10)(.*)?$/.test(value);
      case "random_20bit":
        return /^(X5|D6)(.*)?$/.test(value);
      case "random_32bit":
        return /^(X8|D10)(.*)?$/.test(value);
      case "random_6digit":
      case "random_9digit":
      case "guid":
        return true;
      default:
        return false;
    }
  };

  const getInputInfo = (type: string): string => {
    const t = useTranslations("CustomIdInput");

    switch (type) {
      case "fixed":
        return t("fixed_info");
      case "date":
        return t("date_info");
      case "sequence":
        return t("sequence_info");
      case "random_6digit":
        return t("random_6digit_info");
      case "random_9digit":
        return t("random_9digit_info");
      case "random_20bit":
        return t("random_20bit_info");
      case "random_32bit":
        return t("random_32bit_info");
      case "guid":
        return t("guid_info");
      default:
        return "";
    }
  };

  const isValid = validateInput(segment.type, getInputValue());

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 rounded-lg border p-3 bg-background ${
        isDragging ? "opacity-50" : ""
      } ${!isValid ? "border-destructive" : "border-border"}`}
    >
      {/* Drag handle */}
      <div
        {...attributes}
        {...listeners}
        className="flex-shrink-0 cursor-grab touch-none p-1 text-muted-foreground hover:text-foreground"
      >
        <GripVertical className="h-4 w-4" />
      </div>

      {/* Segment type dropdown */}
      <div className="flex-1 space-y-2">
        <div className="flex gap-2">
          <Select value={segment.type} onValueChange={handleTypeChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fixed">Fixed Text</SelectItem>
              <SelectItem value="date">Date</SelectItem>
              <SelectItem value="sequence">Sequence</SelectItem>
              <SelectItem value="random_6digit">Random 6-digit</SelectItem>
              <SelectItem value="random_9digit">Random 9-digit</SelectItem>
              <SelectItem value="random_20bit">Random 20-bit</SelectItem>
              <SelectItem value="random_32bit">Random 32-bit</SelectItem>
              <SelectItem value="guid">GUID</SelectItem>
            </SelectContent>
          </Select>

          {/* Conditional input based on type */}
          <div className="flex-1 flex gap-2">
            {segment.type === "fixed" ? (
              <div className="flex gap-2 flex-1">
                <Input
                  value={getInputValue()}
                  onChange={(e) => handleInputChange(e.target.value)}
                  placeholder="Enter fixed text..."
                  className={!isValid ? "border-destructive" : ""}
                />
                <EmojiPicker
                  onEmojiSelect={(emoji) =>
                    handleInputChange(getInputValue() + emoji)
                  }
                />
              </div>
            ) : (
              <Input
                value={getInputValue()}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder={getDefaultFormatForType(segment.type)}
                className={!isValid ? "border-destructive" : ""}
              />
            )}
          </div>

          {/* Delete button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onDelete}
            className="flex-shrink-0 text-muted-foreground hover:text-destructive"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Info text */}
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Info className="h-3 w-3" />
          <span>{getInputInfo(segment.type)}</span>
        </div>

        {/* Validation error */}
        {!isValid && (
          <div className="text-xs text-destructive">
            Invalid format for {segment.type} segment
          </div>
        )}
      </div>
    </div>
  );
}
