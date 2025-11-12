"use client";

import * as React from "react";
import { useTranslations } from "next-intl";

import { PageContainer } from "@/components/shared/PageContainer";
import { AllInventories } from "@/components/all-inventories/AllInventories";

export default function AllInventoriesPage() {
  const t = useTranslations("AllInventories");

  return (
    <PageContainer>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">{t("title")}</h1>
        <p className="text-muted-foreground text-sm mt-1">{t("description")}</p>
      </div>
      <AllInventories />
    </PageContainer>
  );
}
