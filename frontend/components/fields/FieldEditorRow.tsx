"use client";

import * as React from "react";
import { DraggableAttributes } from "@dnd-kit/core";
import { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";
import { CustomField } from "@/types/shared";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { GripVertical, Trash2, Eye, EyeOff } from "lucide-react";
import { useTranslations } from "next-intl";

interface FieldEditorRowProps extends React.HTMLAttributes<HTMLDivElement> {
  field: CustomField;
  onDelete: () => void;
  onToggleShowInTable: (checked: boolean) => void;
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
      onDelete,
      onToggleShowInTable,
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
        className="flex items-center gap-3 rounded-md border bg-background p-3"
      >
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
          {/* Left Side: Name & Type */}
          <div className="flex flex-col items-start">
            <span className="font-medium">{field.name}</span>
            <span className="text-sm text-muted-foreground">
              {t("field_type")} {t(field.type)}
            </span>
          </div>

          {/* Right Side: Controls */}
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onToggleShowInTable(!field.showInTable)}
                  >
                    {field.showInTable ? (
                      <Eye className="h-4 w-4" />
                    ) : (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{t("showInTable")}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <Button variant="ghost" size="icon" onClick={onDelete}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </div>
      </div>
    );
  }
);
FieldEditorRow.displayName = "FieldEditorRow";
