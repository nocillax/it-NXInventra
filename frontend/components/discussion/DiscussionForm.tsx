"use client";

import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { MarkdownEditor } from "@/components/discussion/forms/inputs/markdown-editor";
import { discussionService } from "@/services/discussionService";
import { useTranslations } from "next-intl";

const formSchema = z.object({
  message: z.string().min(1, "Message cannot be empty."),
});

interface DiscussionFormProps {
  inventoryId: string;
  onDiscussionPosted: () => void;
}

export function DiscussionForm({
  inventoryId,
  onDiscussionPosted,
}: DiscussionFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      message: "",
    },
  });

  const isSubmitting = form.formState.isSubmitting;
  const t = useTranslations("DiscussionForm");

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      await discussionService.postComment(inventoryId, values.message);
      toast.success(t("discussion_posted_success"));
      form.reset();
      onDiscussionPosted();
    } catch (error) {
      toast.error(t("discussion_posted_error"));
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
      >
        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <MarkdownEditor
                  value={field.value}
                  onChange={field.onChange}
                  placeholder={t("discussion_placeholder")}
                  className="min-h-[100px]"
                />
              </FormControl>
            </FormItem>
          )}
        />
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto"
          >
            {isSubmitting ? t("posting_message") : t("post")}
          </Button>
        </div>
      </form>
    </Form>
  );
}
