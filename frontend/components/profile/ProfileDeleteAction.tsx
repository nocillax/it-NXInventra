"use client";

import * as React from "react";
import { useUserStore } from "@/stores/useUserStore";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useRouter } from "@/navigation";
import { useAuth } from "@/hooks/useAuth";
import { apiFetch } from "@/lib/apiClient";

export function ProfileDeleteAction() {
  const t = useTranslations("Profile");
  const { logout } = useAuth();
  const router = useRouter();
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      // Get current user ID first
      const currentUser = await apiFetch("/user/me");

      // Call delete API with user ID
      await apiFetch(`/user/${currentUser.id}`, {
        method: "DELETE",
      });

      toast.success(t("delete_success_message"));
      logout();
      router.push("/");
    } catch (error) {
      toast.error(t("delete_failure_message"));
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" disabled={isDeleting}>
          {t("delete_account_button")}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("delete_dialog_title")}</AlertDialogTitle>
          <AlertDialogDescription>
            {t("delete_dialog_description")}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>
            {t("delete_dialog_cancel")}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDeleteAccount}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? t("saving_message") : t("delete_dialog_confirm")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
