"use client";

import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSWRConfig } from "swr";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { useRouter } from "@/navigation";

import { useAuth } from "@/hooks/useAuth";
import { useModalStore } from "@/stores/useModalStore";
import { apiFetch } from "@/lib/apiClient";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form, FormField } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { TextInput } from "./inputs/text-inputs";
import { CategorySelect } from "./inputs/category-select";
import { TagInput } from "./inputs/tag-input";
import { VisibilityToggle } from "./inputs/visibility-toggle";

// Form schema with all fields
const formSchema = z.object({
  title: z.string().min(3, {
    message: "Title must be at least 3 characters.",
  }),
  description: z.string().optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).default([]),
  public: z.boolean().default(false),
});

export function InventoryCreateDialog() {
  const { isOpen, type, onClose } = useModalStore();
  const { user } = useAuth();
  const { mutate } = useSWRConfig();
  const router = useRouter();
  const isModalOpen = isOpen && type === "createInventory";
  const t = useTranslations("InventoryCreateDialog");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      tags: [],
      public: false,
    },
  });

  const isSubmitting = form.formState.isSubmitting;

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      if (!user) throw new Error("User not authenticated");

      const newInventory = await apiFetch("/inventories", {
        method: "POST",
        body: JSON.stringify({
          title: values.title,
          description: values.description,
          category: values.category,
          tags: values.tags,
          public: values.public,
        }),
      });

      mutate("/inventories/me", (currentData: any = { inventories: [] }) => ({
        ...currentData,
        inventories: [newInventory, ...currentData.inventories],
      }));

      toast.success(t("success_message"));
      onClose();
      form.reset();
    } catch (error) {
      console.error("Create inventory error:", error);
      toast.error(t("failure_message"));
    }
  }

  return (
    <Dialog open={isModalOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <DialogHeader>
              <DialogTitle>{t("title")}</DialogTitle>
              <DialogDescription>{t("description")}</DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Title - Already has FormField */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <TextInput
                    label={t("title_label")}
                    placeholder={t("title_placeholder")}
                    {...field}
                  />
                )}
              />

              {/* Description - Already has FormField */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <TextInput
                    label={t("description_label")}
                    placeholder={t("description_placeholder")}
                    type="textarea"
                    {...field}
                  />
                )}
              />

              {/* Category - Add FormField wrapper */}
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

              {/* Tags - Add FormField wrapper */}
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
            </div>

            <DialogFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? t("creating_button") : t("create_button")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default InventoryCreateDialog;
