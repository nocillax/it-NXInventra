"use client";

import * as React from "react";
import { Pie, Cell, PieChart } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

interface FieldDistributionChartProps {
  data: { name: string; value: number }[];
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

export function FieldDistributionChart({ data }: FieldDistributionChartProps) {
  const chartData = React.useMemo(() => {
    return data;
  }, [data]);

  const total = React.useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.value, 0);
  }, [chartData]);

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
                      Qty: {value} ({percentage}%)
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
