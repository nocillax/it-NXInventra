// components/item/item-details/ItemFieldsSection.tsx
"use client";

import { Inventory } from "@/types/shared";
import {
  TextField,
  NumberField,
  BooleanField,
  TextareaField,
  LinkField,
} from "./FieldComponents";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info } from "lucide-react";

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
      {mode !== "create" && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <Label>Custom ID</Label>
                {inventory?.customIdFormat?.format && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 border border-blue-300 cursor-help">
                          <Info className="h-3 w-3 text-blue-600" />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-sm p-3">
                        Use the format: {inventory.customIdFormat.format}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </>
            ) : (
              <>
                <h3 className="font-semibold">Custom ID</h3>
                {inventory?.customIdFormat?.format && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 border border-blue-300 cursor-help">
                          <Info className="h-3 w-3 text-blue-600" />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-sm p-3">
                        Use the format: {inventory.customIdFormat.format}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </>
            )}
          </div>

          {isEditing ? (
            <Input
              id="customId"
              value={customId}
              onChange={(e) => onCustomIdChange(e.target.value)}
              placeholder="Enter custom ID"
            />
          ) : (
            <div className="p-4 bg-muted rounded-lg">
              <span>{customId}</span>
            </div>
          )}
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
              isEditing,
              onChange: (newValue: any) => onFieldChange(field.title, newValue),
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
