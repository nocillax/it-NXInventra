"use client";

import * as z from "zod";
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
import { apiFetch } from "@/lib/apiClient";
import { FieldList } from "./FieldList";
import { useModalStore } from "@/stores/useModalStore";

const fieldSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  type: z.enum(["text", "number", "boolean", "url", "longtext"]),
  showInTable: z.boolean().default(false),
});

interface CustomFieldsEditorProps {
  inventory: Inventory;
  onUpdate: (data?: any, options?: any) => Promise<any>;
}

export function CustomFieldsEditor({
  inventory,
  onUpdate,
}: CustomFieldsEditorProps) {
  const { onOpen } = useModalStore();
  const form = useForm<z.infer<typeof fieldSchema>>({
    resolver: zodResolver(fieldSchema),
    defaultValues: {
      name: "",
      type: "text",
      showInTable: false,
    },
  });

  const isSubmitting = form.formState.isSubmitting;

  async function onSubmit(values: z.infer<typeof fieldSchema>) {
    const newField: CustomField = {
      id: uuidv4(),
      ...values,
    };

    const updatedFields = [...inventory.customFields, newField];

    try {
      await apiFetch(`/inventories/${inventory.id}`, {
        method: "PUT",
        body: JSON.stringify({ customFields: updatedFields }),
      });
      toast.success(`Field "${newField.name}" added.`);
      onUpdate(); // Re-fetch inventory data to update the UI
      form.reset();
    } catch (error) {
      toast.error("Failed to add field.");
    }
  }

  async function updateCustomFields(
    updatedFields: CustomField[],
    successMessage: string
  ) {
    const newInventoryState = { ...inventory, customFields: updatedFields };

    // Optimistic UI update
    onUpdate(newInventoryState, { revalidate: false });

    try {
      await apiFetch(`/inventories/${inventory.id}`, {
        method: "PUT",
        body: JSON.stringify({ customFields: updatedFields }),
      });
      toast.success(successMessage);
    } catch (error) {
      toast.error("Failed to update fields.");
      // Revert on error
      onUpdate(inventory, { revalidate: false });
    }
  }

  return (
    <div className="grid gap-6 md:grid-cols-3">
      <div className="md:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Existing Fields</CardTitle>
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
            <CardTitle>Add New Field</CardTitle>
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
                      <FormLabel>Field Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Serial Number" {...field} />
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
                      <FormLabel>Field Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="text">Text</SelectItem>
                          <SelectItem value="number">Number</SelectItem>
                          <SelectItem value="boolean">
                            Boolean (Yes/No)
                          </SelectItem>
                          <SelectItem value="url">URL</SelectItem>
                          <SelectItem value="longtext">Long Text</SelectItem>
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
                        <FormLabel>Show in Table</FormLabel>
                        <FormDescription>
                          Display this field as a column in the items table.
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
                  {isSubmitting ? "Adding..." : "Add Field"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
