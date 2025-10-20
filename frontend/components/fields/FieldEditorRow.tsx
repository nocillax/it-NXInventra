"use client";

import * as React from "react";
import { DraggableAttributes } from "@dnd-kit/core";
import { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";
import { CustomField } from "@/types/shared";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { GripVertical, Trash2 } from "lucide-react";

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
    return (
      <div
        ref={ref}
        {...props}
        className="flex items-center justify-between p-3 border bg-background rounded-md"
      >
        <div className="flex items-center gap-2">
          <div
            {...dragAttributes}
            {...dragListeners}
            className="cursor-grab touch-none"
          >
            <GripVertical className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="font-medium">{field.name}</span>
            <span className="text-sm text-muted-foreground">
              Type: {field.type}
            </span>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-muted-foreground">Show in table</span>
          <Switch
            checked={field.showInTable}
            onCheckedChange={onToggleShowInTable} // This was missing its prop
          />
          <Button variant="ghost" size="icon" onClick={onDelete}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </div>
    );
  }
);
FieldEditorRow.displayName = "FieldEditorRow";
