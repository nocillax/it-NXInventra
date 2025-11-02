// components/dashboard/DashboardTabs.tsx
"use client";

import * as React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslations } from "next-intl";
import { MyInventoriesTab } from "./MyInventoriesTab";
import { SharedInventoriesTab } from "./SharedInventoriesTab";

export function DashboardTabs() {
  const t = useTranslations("Dashboard");

  return (
    <div className="mt-6">
      <Tabs defaultValue="my" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="my">{t("my_inventories")}</TabsTrigger>
          <TabsTrigger value="shared">{t("shared_with_me")}</TabsTrigger>
        </TabsList>

        <TabsContent value="my">
          <MyInventoriesTab />
        </TabsContent>

        <TabsContent value="shared">
          <SharedInventoriesTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
