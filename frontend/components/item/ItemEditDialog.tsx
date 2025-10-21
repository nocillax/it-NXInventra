"use client";

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useEffect } from "react";
import { mutate as globalMutate } from "swr";
import { useTranslations } from "next-intl";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useModalStore } from "@/stores/useModalStore";
import { useInventory } from "@/hooks/useInventory";
import { apiFetch } from "@/lib/apiClient";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Checkbox } from "../ui/checkbox";

export function ItemEditDialog() {
  const { isOpen, type, data, onClose } = useModalStore();
  const { inventoryId, item } = data;
  const { inventory } = useInventory(inventoryId);
  const t = useTranslations("ItemEditDialog");

  const isModalOpen = isOpen && type === "editItem";

  // Dynamically build the Zod schema from custom fields
  const formSchema = z.object(
    inventory?.customFields.reduce((schema, field) => {
      switch (field.type) {
        case "number":
          schema[field.name] = z.coerce.number().optional();
          break;
        case "boolean":
          schema[field.name] = z.boolean().default(false);
          break;
        default:
          schema[field.name] = z.string().optional();
      }
      return schema;
    }, {} as Record<string, z.ZodTypeAny>) ?? {}
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: item?.fields || {},
  });

  useEffect(() => {
    if (item) {
      form.reset(item.fields);
    }
  }, [item, form]);

  const isSubmitting = form.formState.isSubmitting;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!item || !inventoryId) return;

    try {
      await apiFetch(`/items/${item.id}`, {
        method: "PUT",
        body: JSON.stringify({ fields: values }),
      });
      toast.success(t("success_message"));
      globalMutate(`/inventories/${inventoryId}/items`); // Re-fetch the items list
      data.onSuccess?.();
      onClose();
    } catch (error) {
      toast.error(t("failure_message"));
    }
  };

  if (!inventory || !item) {
    return null;
  }

  return (
    <Dialog open={isModalOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {t("title")} - {item.customId}
          </DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 py-4"
          >
            {inventory.customFields.map((field) => (
              <FormField
                key={field.name}
                control={form.control}
                name={field.name}
                render={({ field: formField }) => (
                  <FormItem className="grid grid-cols-4 items-center gap-4">
                    <FormLabel className="text-right">{field.name}</FormLabel>
                    <FormControl className="col-span-3">
                      {field.type === "boolean" ? (
                        <Checkbox
                          checked={formField.value}
                          onCheckedChange={formField.onChange}
                        />
                      ) : (
                        <Input
                          placeholder={t("input_placeholder")}
                          {...formField}
                          value={formField.value ?? ""}
                        />
                      )}
                    </FormControl>
                    <FormMessage className="col-span-4" />
                  </FormItem>
                )}
              />
            ))}
            <DialogFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? t("saving_message") : t("save_button")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
