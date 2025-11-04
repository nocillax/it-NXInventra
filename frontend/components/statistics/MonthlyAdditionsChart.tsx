// components/statistics/MonthlyAdditionsChart.tsx
"use client";

import {
  Bar,
  BarChart,
  XAxis,
  YAxis,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useTranslations, useLocale } from "next-intl";
import { useMemo } from "react";

interface MonthlyAdditionsChartProps {
  data: { month: string; count: number }[];
}

export function MonthlyAdditionsChart({ data }: MonthlyAdditionsChartProps) {
  const t = useTranslations("StatisticsPage");
  const locale = useLocale();

  const chartConfig = {
    count: {
      label: t("items"),
      color: "hsl(var(--primary))",
    },
  };

  // Generate full 12-month data with zeros for missing months
  const fullYearData = useMemo(() => {
    const currentDate = new Date();
    const months = [];

    // Get last 12 months
    for (let i = 11; i >= 0; i--) {
      const date = new Date();
      date.setMonth(currentDate.getMonth() - i);
      const monthName = date.toLocaleString(locale, { month: "short" });

      // Find if we have data for this month
      const existingData = data.find((item) => item.month === monthName);
      months.push({
        month: monthName,
        count: existingData ? existingData.count : 0,
      });
    }

    return months;
  }, [data, locale]);

  console.log("Full year chart data:", fullYearData);

  return (
    <ResponsiveContainer width="100%" height={350}>
      <ChartContainer config={chartConfig}>
        <BarChart
          data={fullYearData}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="hsl(var(--border))"
            vertical={false}
          />
          <XAxis
            dataKey="month"
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
          />
          <ChartTooltip
            cursor={{ fill: "hsl(var(--muted))", opacity: 0.3 }}
            content={<ChartTooltipContent />}
          />
          <Bar
            dataKey="count"
            fill="var(--color-count)"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ChartContainer>
    </ResponsiveContainer>
  );
}
