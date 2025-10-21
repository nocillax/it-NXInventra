"use client";

import * as React from "react";
import { Pie, Cell, PieChart } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useTranslations, useLocale } from "next-intl";

interface FieldDistributionChartProps {
  data: { name: string; value: number }[];
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

export function FieldDistributionChart({ data }: FieldDistributionChartProps) {
  const chartData = React.useMemo(() => {
    // Sort by value descending and take top 10
    const top10Data = data.sort((a, b) => b.value - a.value).slice(0, 10);

    // Calculate sum of remaining items
    const othersSum = data.slice(10).reduce((sum, item) => sum + item.value, 0);

    // Add "Others" category if there are remaining items
    return othersSum > 0
      ? [...top10Data, { name: t("others"), value: othersSum }]
      : top10Data;
  }, [data]);

  const total = React.useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.value, 0);
  }, [chartData]);

  const t = useTranslations("StatisticsPage");
  const locale = useLocale();

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat(locale).format(num);
  };

  return (
    <ChartContainer config={{}} className="min-h-[350px] w-full">
      <PieChart>
        <ChartTooltip
          cursor={false}
          content={
            <ChartTooltipContent
              formatter={(value, name, props) => {
                const percentage =
                  total > 0 ? ((Number(value) / total) * 100).toFixed(0) : 0;
                return (
                  <div>
                    <p className="font-mono">{props.payload.name}</p>
                    <p>
                      {t("qty_short")} {formatNumber(Number(value))} (
                      {formatNumber(Number(percentage))}%)
                    </p>
                  </div>
                );
              }}
            />
          }
        />
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={140}
          fill="#8884d8"
          dataKey="value"
          nameKey="name"
        >
          {chartData.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={COLORS[index % COLORS.length]}
              stroke="hsl(var(--background))"
              strokeWidth={2}
            />
          ))}
        </Pie>
      </PieChart>
    </ChartContainer>
  );
}
