"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Edit, Save, X } from "lucide-react";
import { apiFetch } from "@/lib/apiClient";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";

export function ProfileNameEditor() {
  const t = useTranslations("Profile");
  const { user, refreshUser } = useAuth();
  const [name, setName] = React.useState(user?.name || "");
  const [originalName, setOriginalName] = React.useState(user?.name || "");
  const [isSaving, setIsSaving] = React.useState(false);
  const [isEditing, setIsEditing] = React.useState(false);

  useEffect(() => {
    if (user?.name) {
      setName(user.name);
      setOriginalName(user.name);
    }
  }, [user?.name]);

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);

    try {
      // Real API call instead of mock delay
      const updatedUser = await apiFetch("/user/me", {
        method: "PATCH",
        body: JSON.stringify({ name }),
      });

      refreshUser();
      toast.success(t("success_message"));
      setOriginalName(name);
      setIsEditing(false);
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
