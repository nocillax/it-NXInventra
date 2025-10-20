"use client";

import { Bar, BarChart, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { MonthlyAddition } from "@/types/shared";

interface MonthlyAdditionsChartProps {
  data: MonthlyAddition[];
}

export function MonthlyAdditionsChart({ data }: MonthlyAdditionsChartProps) {
  const chartConfig = {
    count: {
      label: "Items",
      color: "hsl(var(--primary))",
    },
  };

  return (
    <ChartContainer config={chartConfig} className="min-h-[350px] w-full">
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
  );
}
