// components/item/item-details/ItemFieldsSection.tsx
"use client";

import { Inventory } from "@/types/shared";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info } from "lucide-react";
import { TextareaField } from "./fields/TextareaField";
import { BooleanField } from "./fields/BooleanField";
import { NumberField } from "./fields/NumberField";
import { LinkField } from "./fields/LinkField";
import { TextField } from "./fields/TextField";

interface ItemFieldsSectionProps {
  inventory?: Inventory & { customIdFormat?: { format: string } };
  itemFields: Record<string, any>;
  isEditing: boolean;
  customId: string;
  onCustomIdChange: (value: string) => void;
  onFieldChange: (fieldTitle: string, value: any) => void;
  mode: "create" | "edit";
}

export function ItemFieldsSection({
  inventory,
  itemFields,
  isEditing,
  customId,
  onCustomIdChange,
  onFieldChange,
  mode,
}: ItemFieldsSectionProps) {
  return (
    <div className="grid gap-6">
      {/* Custom ID Field - Always show as input, just disabled when not editing */}
      {mode !== "create" && (
        <div className="space-y-2">
          <Label htmlFor="customId">
            Custom ID
            {inventory?.customIdFormat?.format && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="inline-flex items-center justify-center w-4 h-4 ml-2 rounded-full bg-blue-100 border border-blue-300 cursor-help">
                      <Info className="h-3 w-3 text-blue-600" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-sm p-3">
                    Use the format: {inventory.customIdFormat.format}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </Label>
          <Input
            id="customId"
            value={customId}
            onChange={(e) => onCustomIdChange(e.target.value)}
            disabled={!isEditing}
            placeholder="Enter custom ID"
          />
        </div>
      )}

      {/* Dynamic Fields */}
      {inventory?.customFields?.length ? (
        inventory.customFields
          .sort((a, b) => a.orderIndex - b.orderIndex)
          .map((field) => {
            const value = itemFields[field.title];
            const fieldProps = {
              field,
              value,
              onChange: (newValue: any) => onFieldChange(field.title, newValue),
              disabled: !isEditing, // Pass disabled prop to all fields
            };

            switch (field.type) {
              case "number":
                return <NumberField key={field.id} {...fieldProps} />;
              case "boolean":
                return <BooleanField key={field.id} {...fieldProps} />;
              case "textarea":
                return <TextareaField key={field.id} {...fieldProps} />;
              case "link":
                return <LinkField key={field.id} {...fieldProps} />;
              case "text":
              default:
                return <TextField key={field.id} {...fieldProps} />;
            }
          })
      ) : (
        <div className="p-8 text-center text-muted-foreground border rounded-lg">
          No custom fields defined for this inventory
        </div>
      )}
    </div>
  );
}
