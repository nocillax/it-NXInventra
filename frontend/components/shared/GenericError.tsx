"use client";

import { StatusPage } from "@/components/shared/StatusPage";
import { ServerCrash } from "lucide-react";
import { useTranslations } from "next-intl";

interface GenericErrorProps {
  showGoHome?: boolean;
}

export function GenericError({ showGoHome = false }: GenericErrorProps) {
  const t = useTranslations("Errors");

  return (
    <StatusPage
      icon={<ServerCrash className="h-16 w-16 text-muted-foreground" />}
      title={t("server_error_title")}
      description={t("server_error_description")}
      showGoHome={showGoHome}
    />
  );
}
