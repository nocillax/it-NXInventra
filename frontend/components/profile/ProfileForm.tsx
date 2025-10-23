"use client";

import * as React from "react";
import { useUserStore } from "@/stores/useUserStore";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Edit, Save, X } from "lucide-react";
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

export function ProfileForm() {
  const t = useTranslations("Profile");
  const { user, setUser, logout } = useUserStore();
  const router = useRouter();
  const [name, setName] = React.useState(user?.name || "");
  const [originalName, setOriginalName] = React.useState(user?.name || "");
  const [isSaving, setIsSaving] = React.useState(false);
  const [isEditing, setIsEditing] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const getInitials = (name: string) => {
    if (!name) return "?";
    return name.charAt(0).toUpperCase();
  };

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    setIsEditing(false);

    // In a real app, you would make an API call here to update the user's name.
    // For now, we'll simulate an API call and update the Zustand store directly.
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate network delay
      setUser({ ...user, name });
      toast.success(t("success_message"));
      setOriginalName(name);
    } catch (error) {
      toast.error(t("failure_message"));
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setName(originalName);
    setIsEditing(false);
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    // In a real app, you would make an API call here to delete the user account.
    // For now, we'll simulate an API call and then log the user out.
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate network delay
      toast.success(t("delete_success_message"));
      logout();
      router.push("/"); // Redirect to home page
    } catch (error) {
      toast.error(t("delete_failure_message"));
      setIsDeleting(false);
    }
    // No finally block to reset isDeleting, as the user will be logged out and redirected.
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex justify-center">
          <Avatar className="h-20 w-20">
            <AvatarFallback className="text-3xl">
              {getInitials(name)}
            </AvatarFallback>
          </Avatar>
        </div>
        <div className="space-y-2">
          <Label htmlFor="name">{t("name_label")}</Label>
          <div className="flex items-center space-x-2">
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={!isEditing || isSaving}
            />
            {isEditing ? (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleSave}
                  disabled={isSaving}
                >
                  <Save className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleCancel}
                  disabled={isSaving}
                >
                  <X className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsEditing(true)}
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">{t("email_label")}</Label>
          <Input id="email" value={user?.email || ""} disabled />
          <p className="text-xs text-muted-foreground">{t("email_note")}</p>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end">
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
              >
                {isDeleting ? t("saving_message") : t("delete_dialog_confirm")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  );
}
