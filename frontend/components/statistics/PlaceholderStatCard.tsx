"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PlaceholderStatCardProps {
  title: string;
  message: string;
}

export function PlaceholderStatCard({
  title,
  message,
}: PlaceholderStatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-muted-foreground">{message}</p>
      </CardContent>
    </Card>
  );
}
