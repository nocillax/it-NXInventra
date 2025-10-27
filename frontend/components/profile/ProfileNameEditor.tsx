"use client";

import * as React from "react";
import { useUserStore } from "@/stores/useUserStore";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Edit, Save, X } from "lucide-react";

export function ProfileNameEditor() {
  const t = useTranslations("Profile");
  const { user, setUser } = useUserStore();
  const [name, setName] = React.useState(user?.name || "");
  const [originalName, setOriginalName] = React.useState(user?.name || "");
  const [isSaving, setIsSaving] = React.useState(false);
  const [isEditing, setIsEditing] = React.useState(false);

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    setIsEditing(false);

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

  return (
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
  );
}
