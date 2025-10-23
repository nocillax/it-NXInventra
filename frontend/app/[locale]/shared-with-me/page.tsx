"use client";

import * as React from "react";
import { useInventories } from "@/hooks/useInventories";
import { useTranslations } from "next-intl";
import { SharedInventories } from "@/components/shared-with-me/SharedInventories";
import { PageContainer } from "@/components/shared/PageContainer";

export default function SharedPage() {
  const t = useTranslations("Shared");

  return (
    <PageContainer>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">{t("title")}</h1>
        <p className="text-muted-foreground text-sm mt-1">{t("description")}</p>
      </div>
      <SharedInventories />
    </PageContainer>
  );
}
