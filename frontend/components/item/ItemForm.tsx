// components/items/ItemForm.tsx
"use client";

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useTranslations } from "next-intl";
import { Inventory, Item, CustomField } from "@/types/shared";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";

interface ItemFormProps {
  inventory: Inventory;
  item?: Item; // For edit mode
  onSubmit: (values: Record<string, any>) => Promise<void>;
  isSubmitting: boolean;
}

export function ItemForm({
  inventory,
  item,
  onSubmit,
  isSubmitting,
}: ItemFormProps) {
  const t = useTranslations("ItemForm");

  // Build schema based on custom fields
  const formSchema = z.object(
    inventory.customFields.reduce((schema, field) => {
      switch (field.type) {
        case "number":
          schema[field.id.toString()] = z.coerce.number().optional();
          break;
        case "boolean":
          schema[field.id.toString()] = z.boolean().default(false);
          break;
        case "textarea":
          schema[field.id.toString()] = z.string().optional();
          break;
        case "link":
          schema[field.id.toString()] = z
            .string()
            .url()
            .optional()
            .or(z.literal(""));
          break;
        default: // text
          schema[field.id.toString()] = z.string().optional();
      }
      return schema;
    }, {} as Record<string, z.ZodTypeAny>)
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: item?.fields || {},
  });

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    await onSubmit(values);
  };

  const renderField = (field: CustomField, formField: any) => {
    switch (field.type) {
      case "boolean":
        return (
          <Checkbox
            checked={formField.value}
            onCheckedChange={formField.onChange}
          />
        );
      case "textarea":
        return (
          <Textarea
            placeholder={t("textarea_placeholder")}
            {...formField}
            value={formField.value ?? ""}
          />
        );
      case "link":
        return (
          <Input
            type="url"
            placeholder={t("link_placeholder")}
            {...formField}
            value={formField.value ?? ""}
          />
        );
      case "number":
        return (
          <Input
            type="number"
            placeholder={t("number_placeholder")}
            {...formField}
            value={formField.value ?? ""}
          />
        );
      default:
        return (
          <Input
            placeholder={t("text_placeholder")}
            {...formField}
            value={formField.value ?? ""}
          />
        );
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {inventory.customFields
          .sort((a, b) => a.orderIndex - b.orderIndex)
          .map((field) => (
            <FormField
              key={field.id}
              control={form.control}
              name={field.id.toString()}
              render={({ field: formField }) => (
                <FormItem>
                  <FormLabel>{field.title}</FormLabel>
                  <FormControl>{renderField(field, formField)}</FormControl>
                  {field.description && (
                    <p className="text-sm text-muted-foreground">
                      {field.description}
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting
            ? t("saving_message")
            : item
            ? t("update_button")
            : t("create_button")}
        </Button>
      </form>
    </Form>
  );
}
