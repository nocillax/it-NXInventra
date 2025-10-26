"use client";

import * as z from "zod";
import { mutate } from "swr";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
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
import { CustomField, Inventory } from "@/types/shared";
import { useInventories } from "@/hooks/useInventories";
import { apiFetch } from "@/lib/apiClient";
import { FieldList } from "./FieldList";
import { useModalStore } from "@/stores/useModalStore";
import { useTranslations } from "next-intl";

const fieldSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  type: z.enum(["text", "number", "boolean", "url", "longtext"]),
  showInTable: z.boolean().default(false),
});

interface CustomFieldsEditorProps {
  inventory: Inventory;
}

export function CustomFieldsEditor({ inventory }: CustomFieldsEditorProps) {
  const { onOpen } = useModalStore();
  const { inventories } = useInventories();
  const form = useForm<z.infer<typeof fieldSchema>>({
    resolver: zodResolver(fieldSchema),
    defaultValues: {
      name: "",
      type: "text",
      showInTable: false,
    },
  });
  const t = useTranslations("CustomFieldsEditor");

  const isSubmitting = form.formState.isSubmitting;

  async function onSubmit(values: z.infer<typeof fieldSchema>) {
    const newField: CustomField = {
      id: uuidv4(),
      ...values,
    };

    const updatedFields = [...inventory.customFields, newField];

    const newInventoryState = { ...inventory, customFields: updatedFields };

    // Optimistic UI Update
    mutate(`/inventories/${inventory.id}`, newInventoryState, {
      revalidate: false,
    });
    if (inventories) {
      const newInventories = inventories.map((inv) =>
        inv.id === inventory.id ? newInventoryState : inv
      );
      mutate("/inventories", newInventories, { revalidate: false });
    }

    try {
      await apiFetch(`/inventories/${inventory.id}`, {
        method: "PUT",
        body: JSON.stringify({ customFields: updatedFields }),
      });
      toast.success(t("add_field_success"));
      mutate(`/inventories/${inventory.id}`);
      mutate("/inventories");
      form.reset();
    } catch (error) {
      toast.error(t("add_field_error"));
    }
  }

  async function updateCustomFields(
    updatedFields: CustomField[],
    successMessage: string
  ) {
    const newInventoryState = { ...inventory, customFields: updatedFields };

    // Optimistic UI update
    mutate(`/inventories/${inventory.id}`, newInventoryState, {
      revalidate: false,
    });
    if (inventories) {
      const newInventories = inventories.map((inv) =>
        inv.id === inventory.id ? newInventoryState : inv
      );
      mutate("/inventories", newInventories, { revalidate: false });
    }

    try {
      await apiFetch(`/inventories/${inventory.id}`, {
        method: "PUT",
        body: JSON.stringify({ customFields: updatedFields }),
      });
      toast.success(successMessage);
      mutate(`/inventories/${inventory.id}`);
      mutate("/inventories");
    } catch (error) {
      toast.error("Failed to update fields.");
      // Revert on error
      mutate(`/inventories/${inventory.id}`, inventory, { revalidate: false });
      if (inventories) {
        mutate("/inventories", inventories, { revalidate: false });
      }
    }
  }

  return (
    <div className="grid gap-6 md:grid-cols-3">
      <div className="md:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>{t("title")}</CardTitle>
          </CardHeader>
          <CardContent>
            <FieldList
              inventory={inventory}
              onUpdateFields={updateCustomFields}
            />
          </CardContent>
        </Card>
      </div>

      <div className="md:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle>{t("add_field")}</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("field_name")}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t("field_name_placeholder")}
                          {...field}
                        />
                      </FormControl>
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
                          <SelectItem value="url">
                            {t("field_type_url")}
                          </SelectItem>
                          <SelectItem value="longtext">
                            {t("field_type_longtext")}
                          </SelectItem>
                        </SelectContent>
                      </Select>
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
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? t("saving_message") : t("add_field_button")}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
