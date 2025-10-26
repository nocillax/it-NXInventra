"use client";

import { Bar, BarChart, XAxis, YAxis, ResponsiveContainer } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { MonthlyAddition } from "@/types/shared";
import { useTranslations } from "next-intl";

interface MonthlyAdditionsChartProps {
  data: MonthlyAddition[];
}

export function MonthlyAdditionsChart({ data }: MonthlyAdditionsChartProps) {
  const t = useTranslations("StatisticsPage");
  const chartConfig = {
    count: {
      label: t("items"),
      color: "hsl(var(--primary))",
    },
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ChartContainer config={chartConfig}>
        <BarChart accessibilityLayer data={data}>
          <XAxis
            dataKey="month"
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
          />
          <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
          <Bar dataKey="count" fill="var(--color-count)" radius={4} />
        </BarChart>
      </ChartContainer>
    </ResponsiveContainer>
  );
}
