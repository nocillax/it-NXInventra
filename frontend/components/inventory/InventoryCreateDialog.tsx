"use client";

import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSWRConfig } from "swr";
import { toast } from "sonner";
import { CheckCircle, XCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/navigation";

import { useUserStore } from "@/stores/useUserStore";
import { useModalStore } from "@/stores/useModalStore";
import { Inventory } from "@/types/shared";
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const formSchema = z.object({
  title: z.string().min(3, {
    message: "Title must be at least 3 characters.",
  }),
});

export function InventoryCreateDialog() {
  const { isOpen, type, onClose } = useModalStore();
  const { user } = useUserStore();
  const { mutate } = useSWRConfig();
  const router = useRouter();
  const isModalOpen = isOpen && type === "createInventory";
  const t = useTranslations("InventoryCreateDialog");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
    },
  });

  const isSubmitting = form.formState.isSubmitting;

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      if (!user) throw new Error("User not authenticated");

      // 1. Create the new inventory object locally
      const newInventory: Inventory = {
        id: crypto.randomUUID(),
        title: values.title,
        description: "",
        category: "",
        tags: [],
        public: false,
        createdBy: user.id,
        idFormat: [
          { id: crypto.randomUUID(), type: "fixed", value: "ITEM-" },
          { id: crypto.randomUUID(), type: "sequence", format: "D3" },
        ],
        customFields: [],
      };

      // 2. Optimistically update the SWR cache
      mutate(
        "/api/inventories",
        (currentData: Inventory[] = []) => [newInventory, ...currentData],
        { revalidate: false }
      );

      // 3. Show success toast and close the dialog.
      toast.success(t("success_message"));
      onClose();
    } catch (error) {
      toast.error(t("failure_message"));
    }
  }

  return (
    <Dialog open={isModalOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <DialogHeader>
              <DialogTitle>{t("title")}</DialogTitle>
              <DialogDescription>{t("description")}</DialogDescription>
            </DialogHeader>
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
