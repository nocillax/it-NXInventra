// components/statistics/TopContributorsCard.tsx
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Contributor } from "@/types/shared";
import { useTranslations, useLocale } from "next-intl";

interface TopContributorsCardProps {
  contributors: Contributor[];
}

export function TopContributorsCard({
  contributors,
}: TopContributorsCardProps) {
  const t = useTranslations("StatisticsPage");
  const locale = useLocale();

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat(locale).format(num);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("top_contributors")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {contributors.map((contributor) => (
          <div
            key={contributor.userId}
            className="flex items-center justify-between"
          >
            <div className="flex items-center">
              <Avatar className="h-9 w-9">
                <AvatarFallback>
                  {contributor.name?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="ml-4 space-y-1">
                <p className="text-sm font-medium leading-none">
                  {contributor.name}
                </p>
              </div>
            </div>
            <div className="font-medium">
              {formatNumber(contributor.itemCount)} {t("items")}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
