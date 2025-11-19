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
import { useRbac } from "@/hooks/useRbac";
import { inventoryService } from "@/services/inventoryService";
import { Key, RefreshCw } from "lucide-react";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { useModalStore } from "@/stores/useModalStore";
import { CategorySelect } from "../inventory/forms/inputs/category-select";
import { TagInput } from "../inventory/forms/inputs/tag-input";
import { VisibilityToggle } from "../inventory/forms/inputs/visibility-toggle";

const formSchema = z.object({
  title: z.string().min(3, {
    message: "Title must be at least 3 characters.",
  }),
  description: z.string().optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).default([]),
  public: z.boolean().default(false),
});

type FormValues = z.infer<typeof formSchema>;

interface InventorySettingsFormProps {
  inventory: Inventory;
  onUpdate: () => void;
}

export function InventorySettingsForm({
  inventory,
  onUpdate,
}: InventorySettingsFormProps) {
  const [isSyncing, setIsSyncing] = useState(false);
  const { isOwner } = useRbac(inventory);
  // Helper function to extract tag names safely
  const getTagNames = (tags: Inventory["tags"]): string[] => {
    if (!tags) return [];

    return tags.map((tag) => {
      if (typeof tag === "string") {
        return tag;
      } else {
        return tag.name;
      }
    });
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: inventory.title,
      description: inventory.description || "",
      category: inventory.category || "",
      tags: getTagNames(inventory.tags),
      public: inventory.public || false,
    },
  });

  const t = useTranslations("InventorySettingsForm");
  const { onOpen } = useModalStore();

  const isSubmitting = form.formState.isSubmitting;

  const handleSyncToOdoo = async () => {
    setIsSyncing(true);
    try {
      await inventoryService.syncToOdoo(inventory.id);
      toast.success(t("sync_success"));
      // Refresh the inventory data to get the updated token if it was auto-generated
      onUpdate();
    } catch (error) {
      toast.error(t("sync_failed"));
    } finally {
      setIsSyncing(false);
    }
  };

  async function onSubmit(values: FormValues) {
    try {
      await apiFetch(`/inventories/${inventory.id}`, {
        method: "PATCH",
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
        {/* Title */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("title_label")}</FormLabel>
              <FormControl>
                <Input placeholder={t("title_placeholder")} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("description_label")}</FormLabel>
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

        {/* Category */}
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <CategorySelect
              label={t("category_label")}
              placeholder={t("category_placeholder")}
              {...field}
            />
          )}
        />

        {/* Tags */}
        <FormField
          control={form.control}
          name="tags"
          render={({ field }) => (
            <TagInput
              label={t("tags_label")}
              placeholder={t("tags_placeholder")}
              addTagText={t("add_tag")}
              {...field}
            />
          )}
        />

        {/* Visibility - Add FormField wrapper */}
        <FormField
          control={form.control}
          name="public"
          render={({ field }) => (
            <VisibilityToggle
              label={t("visibility_label")}
              description={t("visibility_description")}
              {...field}
            />
          )}
        />

        {/* Odoo Integration - Only for owners/admins */}
        {isOwner && (
          <div className="space-y-4 rounded-lg border border-border bg-card p-4">
            <div className="space-y-2">
              <h3 className="text-base font-medium flex items-center gap-2">
                {t("odoo_integration_title")}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t("odoo_integration_description")}
              </p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSyncToOdoo}
                  disabled={isSyncing}
                  className="flex items-center gap-2"
                >
                  <RefreshCw
                    className={`h-4 w-4 ${isSyncing ? "animate-spin" : ""}`}
                  />
                  {isSyncing ? t("syncing_message") : t("sync_to_odoo_button")}
                </Button>
              </div>
            </div>
          </div>
        )}

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
