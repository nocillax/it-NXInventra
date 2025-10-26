"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { useStats } from "@/hooks/useStats";
import { useInventory } from "@/hooks/useInventory";
import { useItems } from "@/hooks/useItems";
import { useUsers } from "@/hooks/useUsers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/statistics/StatCard";
import { MonthlyAdditionsChart } from "@/components/statistics/MonthlyAdditionsChart";
import { PlaceholderStatCard } from "@/components/statistics/PlaceholderStatCard";
import { TopContributorsCard } from "@/components/statistics/TopContributorsCard";
import { FieldDistributionChart } from "@/components/statistics/FieldDistributionChart";
import { Skeleton } from "@/components/ui/skeleton";
import { GenericError } from "@/components/shared/GenericError";
import { useTranslations, useLocale } from "next-intl";

export default function InventoryStatisticsPage() {
  const params = useParams();
  const inventoryId = params.id as string;

  const {
    stats,
    isLoading: isLoadingStats,
    error: statsError,
  } = useStats(inventoryId);
  const {
    inventory,
    isLoading: isLoadingInventory,
    error: inventoryError,
  } = useInventory(inventoryId);
  const {
    items,
    isLoading: isLoadingItems,
    error: itemsError,
  } = useItems(inventoryId);
  const { users, isLoading: isLoadingUsers, error: usersError } = useUsers();

  const t = useTranslations("StatisticsPage");
  const locale = useLocale();
  const error = statsError || inventoryError || itemsError || usersError;

  // Prepare data for the 12-month bar chart
  const monthlyAdditionsData = React.useMemo(() => {
    if (!stats) return []; // Guard against null/undefined stats
    const last12Months = Array.from({ length: 12 })
      .map((_, i) => {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        return d.toLocaleString(locale, { month: "short" });
      })
      .reverse();

    return last12Months.map((month) => {
      const existing = stats.monthlyAdditions.find((m) => m.month === month);
      return { month, count: existing ? existing.count : 0 };
    });
  }, [stats, locale]);

  const quantityChartData = React.useMemo(
    () =>
      stats?.quantityDistribution?.map((item) => ({
        name: item.label,
        value: item.quantity,
      })),
    [stats]
  );

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat(locale).format(num);
  };
  const formatDecimal = (num: number) => {
    return new Intl.NumberFormat(locale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  };

  const isLoading =
    isLoadingStats || isLoadingInventory || isLoadingUsers || isLoadingItems;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Skeleton className="h-[422px] lg:col-span-4" />
          <Skeleton className="h-[422px] lg:col-span-3" />
        </div>
      </div>
    );
  }

  if (error) {
    return <GenericError />;
  }

  if (!stats || !inventory || !users || !items) {
    return <p>{t("no_data_message")}</p>;
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          title={t("total_items")}
          value={formatNumber(stats.totalItems)}
        />

        {stats.totalQuantity !== null ? (
          <StatCard
            title={t("total_quantity")}
            value={formatNumber(stats.totalQuantity)}
          />
        ) : (
          <PlaceholderStatCard
            title={t("total_quantity")}
            message={t("total_quantity_placeholder")}
          />
        )}

        {stats.avgPrice !== null ? (
          <StatCard
            title={t("avg_price")}
            value={`$${formatDecimal(stats.avgPrice)}`}
          />
        ) : (
          <PlaceholderStatCard
            title={t("avg_price")}
            message={t("avg_price_placeholder")}
          />
        )}

        {stats.avgQuantity !== null ? (
          <StatCard
            title={t("avg_quantity")}
            value={formatDecimal(stats.avgQuantity)}
          />
        ) : (
          <PlaceholderStatCard
            title={t("avg_quantity")}
            message={t("avg_quantity_placeholder")}
          />
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4 overflow-hidden min-w-0 flex flex-col">
          <CardHeader>
            <CardTitle>{t("monthly_additions")}</CardTitle>
          </CardHeader>
          <CardContent className="pl-2 flex-grow min-h-[350px]">
            <MonthlyAdditionsChart data={monthlyAdditionsData} />
          </CardContent>
        </Card>
        <div className="lg:col-span-3 space-y-4 min-w-0">
          <TopContributorsCard
            contributors={stats.topContributors}
            users={users}
          />
          {quantityChartData ? (
            <Card className="overflow-hidden">
              <CardHeader>
                <CardTitle>{t("qty_distribution")}</CardTitle>
              </CardHeader>
              <CardContent>
                <FieldDistributionChart data={quantityChartData} />
              </CardContent>
            </Card>
          ) : (
            <Card className="flex flex-col items-center justify-center text-center p-6">
              <CardHeader>
                <CardTitle>{t("visualize_more_data_message")}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {t("visualize_more_data_description")}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
