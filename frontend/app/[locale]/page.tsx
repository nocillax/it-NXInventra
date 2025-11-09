"use client";

import { useRouter } from "@/navigation";
import * as React from "react";
import { useModalStore } from "@/stores/useModalStore";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

import { PageContainer } from "@/components/shared/PageContainer";
import { DashboardTabs } from "@/components/dashboard/DashboardTabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";

export default function HomePage() {
  const t = useTranslations("Dashboard");
  const { onOpen } = useModalStore();
  const { user, isLoading } = useAuth();
  const router = useRouter();

  // Redirect to explore page if not logged in
  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/explore");
    }
  }, [user, isLoading, router]);

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="mt-6 space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </PageContainer>
    );
  }

  // Show nothing while redirecting or if not logged in
  if (!user) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center h-40">
          <p className="text-muted-foreground">Redirecting...</p>
        </div>
      </PageContainer>
    );
  }

  // Show dashboard only for logged in users
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
