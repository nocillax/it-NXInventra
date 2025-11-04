"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { useStats } from "@/hooks/useStats";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/statistics/StatCard";
import { MonthlyAdditionsChart } from "@/components/statistics/MonthlyAdditionsChart";
import { PlaceholderStatCard } from "@/components/statistics/PlaceholderStatCard";
import { TopContributorsCard } from "@/components/statistics/TopContributorsCard";
import { Skeleton } from "@/components/ui/skeleton";
import { GenericError } from "@/components/shared/GenericError";
import { useTranslations, useLocale } from "next-intl";

export default function InventoryStatisticsPage() {
  const params = useParams();
  const inventoryId = params.id as string;

  const { stats, isLoading, error } = useStats(inventoryId);

  const t = useTranslations("StatisticsPage");
  const locale = useLocale();

  // Transform monthlyGrowth data for the chart
  const monthlyAdditionsData = React.useMemo(() => {
    if (!stats?.monthlyGrowth) return [];

    return stats.monthlyGrowth.map((item) => {
      // Parse the month string "2025-11" properly
      const [year, month] = item.month.split("-").map(Number);
      return {
        month: new Date(year, month - 1).toLocaleString(locale, {
          month: "short",
        }),
        count: item.count,
      };
    });
  }, [stats?.monthlyGrowth, locale]);

  console.log("Monthly Growth Data:", stats?.monthlyGrowth);
  console.log("Transformed Chart Data:", monthlyAdditionsData);

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat(locale).format(num);
  };

  const formatDecimal = (num: number) => {
    return new Intl.NumberFormat(locale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
        </div>
      </div>
    );
  }

  if (error) {
    return <GenericError />;
  }

  if (!stats) {
    return <p>{t("no_data_message")}</p>;
  }

  // Check if price and quantity fields exist
  const hasPriceField = !!stats.priceStats;
  const hasQuantityField = !!stats.quantityStats;

  return (
    <div className="space-y-4">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          title={t("total_items")}
          value={formatNumber(stats.totalItems)}
        />

        {hasQuantityField ? (
          <StatCard
            title={t("total_quantity")}
            value={formatNumber(stats.quantityStats!.total)}
          />
        ) : (
          <PlaceholderStatCard
            title={t("total_quantity")}
            message={t("total_quantity_placeholder")}
          />
        )}

        {hasPriceField ? (
          <StatCard
            title={t("avg_price")}
            value={`$${formatDecimal(stats.priceStats!.avg)}`}
          />
        ) : (
          <PlaceholderStatCard
            title={t("avg_price")}
            message={t("avg_price_placeholder")}
          />
        )}

        {hasQuantityField ? (
          <StatCard
            title={t("avg_quantity")}
            value={formatDecimal(stats.quantityStats!.avg)}
          />
        ) : (
          <PlaceholderStatCard
            title={t("avg_quantity")}
            message={t("avg_quantity_placeholder")}
          />
        )}
      </div>

      {/* Charts Section - Full width layout */}
      <div className="space-y-4">
        {/* Top Contributors - Full width */}
        <Card className="w-full">
          <CardHeader>
            <CardTitle>{t("top_contributors")}</CardTitle>
          </CardHeader>
          <CardContent>
            <TopContributorsCard contributors={stats.topContributors} />
          </CardContent>
        </Card>

        {/* Monthly Additions Chart - Full width */}
        <Card className="w-full overflow-hidden">
          <CardHeader>
            <CardTitle>{t("monthly_additions")}</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <MonthlyAdditionsChart data={monthlyAdditionsData} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
