"use client";

import { useTranslations } from "next-intl";
import { Lock } from "lucide-react";
import { StatusPage } from "@/components/shared/StatusPage";

export default function NoAccessPage() {
  const t = useTranslations("NoAccess");

  return (
    <StatusPage
      icon={<Lock className="h-16 w-16 text-muted-foreground" />}
      title={t("title")}
      description={t("description")}
    />
  );
}
