"use client";

import * as React from "react";
import { useUserStore } from "@/stores/useUserStore";
import { useTranslations } from "next-intl";
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
import { ProfileNameEditor } from "./ProfileNameEditor";
import { ProfileDeleteAction } from "./ProfileDeleteAction";
import { useAuth } from "@/hooks/useAuth";

export function ProfileForm() {
  const t = useTranslations("Profile");
  const { user } = useAuth();

  const getInitials = (name: string) => {
    if (!name) return "?";
    return name.charAt(0).toUpperCase();
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
              {getInitials(user?.name || "")}
            </AvatarFallback>
          </Avatar>
        </div>
        <ProfileNameEditor />
        <div className="space-y-2">
          <Label htmlFor="email">{t("email_label")}</Label>
          <Input id="email" value={user?.email || ""} disabled />
          <p className="text-xs text-muted-foreground">{t("email_note")}</p>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end">
        <ProfileDeleteAction />
      </CardFooter>
    </Card>
  );
}
