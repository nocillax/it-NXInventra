"use client";

import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import TextareaAutosize from "react-textarea-autosize";
import { apiFetch } from "@/lib/apiClient";
import { useTranslations } from "next-intl";

const formSchema = z.object({
  message: z.string().min(1, "Message cannot be empty."),
});

interface CommentFormProps {
  inventoryId: string;
  onCommentPosted: () => void;
}

export function CommentForm({
  inventoryId,
  onCommentPosted,
}: CommentFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      message: "",
    },
  });

  const isSubmitting = form.formState.isSubmitting;
  const t = useTranslations("CommentForm");

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      await apiFetch("/comments", {
        method: "POST",
        body: JSON.stringify({ ...values, inventoryId }),
      });
      toast.success("Comment posted.");
      form.reset();
      onCommentPosted();
    } catch (error) {
      toast.error("Failed to post comment.");
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-2 sm:flex-row sm:items-end"
      >
        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem className="flex-1 self-stretch">
              <FormControl>
                <div className="flex items-center w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background">
                  <TextareaAutosize
                    placeholder={t("cmt_placeholder")}
                    className="w-full resize-none appearance-none bg-transparent focus:outline-none"
                    maxRows={4}
                    {...field}
                  />
                </div>
              </FormControl>
            </FormItem>
          )}
        />
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full sm:w-auto"
        >
          {isSubmitting ? t("posting_message") : t("post")}
        </Button>
      </form>
    </Form>
  );
}
