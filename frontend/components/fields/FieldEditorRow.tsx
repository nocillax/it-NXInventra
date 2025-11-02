// components/fields/FieldEditorRow.tsx - SIMPLIFIED
"use client";

import * as React from "react";
import { DraggableAttributes } from "@dnd-kit/core";
import { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";
import { CustomField } from "@/types/shared";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { GripVertical, Eye, EyeOff, Info } from "lucide-react";
import { useTranslations } from "next-intl";
import ReactMarkdown from "react-markdown";

interface FieldEditorRowProps extends React.HTMLAttributes<HTMLDivElement> {
  field: CustomField;
  isSelected: boolean;
  onCheckboxChange: (checked: boolean) => void;
  dragAttributes: DraggableAttributes;
  dragListeners?: SyntheticListenerMap;
}

export const FieldEditorRow = React.forwardRef<
  HTMLDivElement,
  FieldEditorRowProps
>(
  (
    {
      field,
      isSelected,
      onCheckboxChange,
      dragAttributes,
      dragListeners,
      ...props
    },
    ref
  ) => {
    const t = useTranslations("FieldList");
    return (
      <div
        ref={ref}
        {...props}
        className={`flex items-center gap-3 rounded-md border bg-background p-3 ${
          isSelected ? "ring-2 ring-primary" : ""
        }`}
      >
        {/* Checkbox for selection */}
        <Checkbox checked={isSelected} onCheckedChange={onCheckboxChange} />

        {/* Grip Handle */}
        <div
          {...dragAttributes}
          {...dragListeners}
          className="cursor-grab touch-none"
        >
          <GripVertical className="h-5 w-5 text-muted-foreground" />
        </div>

        {/* Main Content Block */}
        <div className="flex flex-grow items-center justify-between gap-4">
          {/* Left Side: Title, Type & Description */}
          <div className="flex flex-col items-start">
            <div className="flex items-center gap-2">
              <span className="font-medium">{field.title}</span>
              {field.description && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 border border-blue-300 cursor-help">
                        <Info className="h-3 w-3 text-blue-600" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-sm p-3">
                      <ReactMarkdown>{field.description}</ReactMarkdown>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
            <span className="text-sm text-muted-foreground">
              {t("field_type")} {t(field.type)}
            </span>
          </div>

          {/* Right Side: Visual indicator only */}
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="p-2">
                    {field.showInTable ? (
                      <Eye className="h-4 w-4 text-green-600" />
                    ) : (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    {field.showInTable
                      ? t("visible_in_table")
                      : t("hidden_from_table")}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>
    );
  }
);
FieldEditorRow.displayName = "FieldEditorRow";
