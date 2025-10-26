"use client";

import { Separator } from "@/components/ui/separator";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Inventory } from "@/types/shared";
import { apiFetch } from "@/lib/apiClient";
import { useTranslations } from "next-intl";
import { useModalStore } from "@/stores/useModalStore";

const formSchema = z.object({
  title: z.string().min(3, {
    message: "Title must be at least 3 characters.",
  }),
  description: z.string().optional(),
});

interface InventorySettingsFormProps {
  inventory: Inventory;
  onUpdate: () => void;
}

export function InventorySettingsForm({
  inventory,
  onUpdate,
}: InventorySettingsFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: inventory.title,
      description: inventory.description || "",
    },
  });
  const t = useTranslations("InventorySettingsForm");
  const { onOpen } = useModalStore();

  const isSubmitting = form.formState.isSubmitting;

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      await apiFetch(`/inventories/${inventory.id}`, {
        method: "PUT",
        body: JSON.stringify(values),
      });
      toast.success(t("success_message"));
      onUpdate(); // This will trigger the SWR re-fetch
    } catch (error) {
      toast.error(t("failure_message"));
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6 sm:space-y-8 max-w-2xl"
      >
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("title")}</FormLabel>
              <FormControl>
                <Input placeholder={t("title_placeholder")} {...field} />
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
              <FormLabel>{t("description")}</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={t("description_placeholder")}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full sm:w-auto"
        >
          {isSubmitting ? t("saving_message") : t("save_button")}
        </Button>

        <Separator className="my-8" />

        <div className="space-y-4 rounded-lg border border-destructive p-4">
          <div className="space-y-1">
            <h3 className="text-lg font-semibold text-destructive">
              {t("danger_zone_title")}
            </h3>
            <p className="text-sm text-muted-foreground">
              {t("danger_zone_description")}
            </p>
          </div>
          <Button
            variant="destructive"
            type="button"
            onClick={() =>
              onOpen("deleteInventory", { inventoryId: inventory.id })
            }
          >
            {t("delete_inventory_button")}
          </Button>
        </div>
      </form>
    </Form>
  );
}
