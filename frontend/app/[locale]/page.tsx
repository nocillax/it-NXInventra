"use client";

import { useRouter } from "@/navigation";
import * as React from "react";
import { useModalStore } from "@/stores/useModalStore";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

import { PageContainer } from "@/components/shared/PageContainer";
import { DashboardTabs } from "@/components/dashboard/DashboardTabs";

export default function HomePage() {
  const t = useTranslations("Dashboard");
  const { onOpen } = useModalStore();

  return (
    <PageContainer>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{t("dashboard")}</h1>
        <Button onClick={() => onOpen("createInventory")}>
          {t("create_inventory")}
        </Button>
      </div>

      <DashboardTabs />
    </PageContainer>
  );
}
