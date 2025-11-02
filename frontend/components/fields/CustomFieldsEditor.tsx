// components/fields/CustomFieldsEditor.tsx - UPDATED
"use client";

import * as z from "zod";
import { mutate } from "swr";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useState } from "react";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { CustomField, Inventory } from "@/types/shared";
import { useInventories } from "@/hooks/useInventories";
import { customFieldService } from "@/services/customFieldService";
import { FieldList } from "./FieldList";
import { useTranslations } from "next-intl";
import { MarkdownEditor } from "./forms/inputs/markdown-editor";

const fieldSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters."),
  description: z.string().optional(),
  type: z.enum(["text", "number", "boolean", "link", "textarea"]),
  showInTable: z.boolean().default(false),
});

interface CustomFieldsEditorProps {
  inventory: Inventory;
}

export function CustomFieldsEditor({ inventory }: CustomFieldsEditorProps) {
  const { inventories } = useInventories();
  const [editingField, setEditingField] = useState<CustomField | null>(null);
  const [selectedFields, setSelectedFields] = useState<number[]>([]);

  const form = useForm<z.infer<typeof fieldSchema>>({
    resolver: zodResolver(fieldSchema),
    defaultValues: {
      title: "",
      description: "",
      type: "text",
      showInTable: false,
    },
  });
  const t = useTranslations("CustomFieldsEditor");

  const isSubmitting = form.formState.isSubmitting;
  const isEditing = !!editingField;

  // Reset form when switching between add/edit modes
  const resetForm = () => {
    setEditingField(null);
    setSelectedFields([]);
    form.reset({
      title: "",
      description: "",
      type: "text",
      showInTable: false,
    });
  };

  // Handle field selection for editing
  const handleFieldSelect = (field: CustomField) => {
    setEditingField(field);
    setSelectedFields([field.id]);
    form.reset({
      title: field.title,
      description: field.description || "",
      type: field.type,
      showInTable: field.showInTable,
    });
  };

  // Handle field selection for bulk operations (if needed later)
  const handleCheckboxChange = (fieldId: number, checked: boolean) => {
    if (checked) {
      setSelectedFields((prev) => [...prev, fieldId]);
    } else {
      setSelectedFields((prev) => prev.filter((id) => id !== fieldId));
      // If we're unchecking the currently edited field, reset form
      if (editingField?.id === fieldId) {
        resetForm();
      }
    }
  };

  // In CustomFieldsEditor.tsx - Add debug logs
  async function onSubmit(values: z.infer<typeof fieldSchema>) {
    try {
      if (isEditing && editingField) {
        // Update existing field
        await customFieldService.updateCustomField(
          inventory.id,
          editingField.id,
          {
            title: values.title,
            description: values.description || null,
            showInTable: values.showInTable,
            orderIndex: editingField.orderIndex,
          }
        );
        toast.success(t("update_field_success"));
      } else {
        // Create new field
        const orderIndex = await customFieldService.getNextOrderIndex(
          inventory.id
        );

        const newFieldData = {
          title: values.title,
          description: values.description || null,
          type: values.type,
          showInTable: values.showInTable,
          orderIndex,
        };

        await customFieldService.addCustomFields(inventory.id, [newFieldData]);
        toast.success(t("add_field_success"));
      }

      // Refresh data and reset form
      mutate(`/inventories/${inventory.id}`, undefined, { revalidate: true });
      mutate("/inventories", undefined, { revalidate: true });
      resetForm();
    } catch (error) {
      toast.error(isEditing ? t("update_field_error") : t("add_field_error"));
    }
  }

  // In CustomFieldsEditor.tsx - update the updateCustomFields function
  async function updateCustomFields(
    updatedFields: CustomField[],
    successMessage: string
  ) {
    try {
      // Ensure fields have correct orderIndex before sending to API
      const fieldsWithUpdatedOrder = updatedFields.map((field, index) => ({
        ...field,
        orderIndex: index,
      }));

      const updatePromises = fieldsWithUpdatedOrder.map((field) =>
        customFieldService.updateCustomField(inventory.id, field.id, {
          orderIndex: field.orderIndex,
          title: field.title,
          description: field.description,
          showInTable: field.showInTable,
        })
      );

      await Promise.all(updatePromises);
      toast.success(successMessage);

      // Force immediate refresh instead of waiting for auto-refresh
      mutate(`/inventories/${inventory.id}`, undefined, { revalidate: true });
      mutate("/inventories", undefined, { revalidate: true });
    } catch (error) {
      toast.error("Failed to update fields.");
      // Revert optimistic update on error
      mutate(`/inventories/${inventory.id}`);
      mutate("/inventories");
    }
  }

  // Handle bulk delete
  const handleBulkDelete = async () => {
    if (selectedFields.length === 0) return;

    try {
      const deletePromises = selectedFields.map((fieldId) =>
        customFieldService.deleteCustomField(inventory.id, fieldId)
      );

      await Promise.all(deletePromises);
      toast.success(
        t("delete_fields_success", { count: selectedFields.length })
      );

      mutate(`/inventories/${inventory.id}`);
      mutate("/inventories");
      resetForm();
    } catch (error) {
      toast.error(t("delete_fields_error"));
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-5">
      <div className="md:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>{t("title")}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <FieldList
              inventory={inventory}
              onUpdateFields={updateCustomFields}
              selectedFields={selectedFields}
              onFieldSelect={handleFieldSelect}
              onCheckboxChange={handleCheckboxChange}
            />
          </CardContent>
        </Card>
      </div>

      <div className="md:col-span-3">
        <Card>
          <CardHeader>
            <CardTitle>
              {isEditing ? t("edit_field") : t("add_field")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("field_title")}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t("field_title_placeholder")}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("field_description")}</FormLabel>
                      <FormControl>
                        <MarkdownEditor
                          value={field.value || ""}
                          onChange={field.onChange}
                          placeholder={t("field_description_placeholder")}
                          className="min-h-[100px]"
                        />
                      </FormControl>
                      <FormDescription>
                        {t("field_description_help")}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("field_type")}</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={isEditing} // Disable type editing for existing fields
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue
                              placeholder={t("field_type_placeholder")}
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="text">
                            {t("field_type_text")}
                          </SelectItem>
                          <SelectItem value="number">
                            {t("field_type_number")}
                          </SelectItem>
                          <SelectItem value="boolean">
                            {t("field_type_boolean")}
                          </SelectItem>
                          <SelectItem value="link">
                            {t("field_type_link")}
                          </SelectItem>
                          <SelectItem value="textarea">
                            {t("field_type_textarea")}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      {isEditing && (
                        <FormDescription>
                          {t("field_type_edit_disabled")}
                        </FormDescription>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="showInTable"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>{t("show_in_table")}</FormLabel>
                        <FormDescription>
                          {t("show_in_table_description")}
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                  <div className="flex gap-2">
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="text-sm sm:text-sm"
                    >
                      {isSubmitting
                        ? t("saving_message")
                        : isEditing
                        ? t("update_field_button")
                        : t("add_field_button")}
                    </Button>

                    {isEditing && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={resetForm}
                        disabled={isSubmitting}
                        className="text-sm sm:text-sm"
                      >
                        {t("cancel_edit")}
                      </Button>
                    )}
                  </div>

                  {/* DELETE BUTTON on the right - only when editing */}
                  {isEditing && (
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={() => {
                        handleBulkDelete();
                      }}
                      disabled={isSubmitting}
                      className="text-sm sm:text-sm"
                    >
                      {t("delete_selected")}
                    </Button>
                  )}
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
