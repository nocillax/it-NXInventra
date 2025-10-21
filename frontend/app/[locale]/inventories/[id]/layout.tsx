"use client";

import { useParams } from "next/navigation";
import { Link, usePathname } from "@/navigation";
import { useInventory } from "@/hooks/useInventory";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslations } from "next-intl";

const TABS = [
  { key: "items", href: "" },
  { key: "discussion", href: "/discussion" },
  { key: "settings", href: "/settings" },
  { key: "custom_id", href: "/custom-id" },
  { key: "fields", href: "/fields" },
  { key: "access", href: "/access" },
  { key: "statistics", href: "/statistics" },
];

export default function InventoryDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const pathname = usePathname(); // now from next-intl
  const { inventory, isLoading } = useInventory(params.id as string);
  const t = useTranslations("InventoryTabs");
  const activeTab =
    TABS.find((tab) => `/inventories/${params.id}${tab.href}` === pathname)
      ?.key || "Items";

  return (
    <div className="container py-6">
      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-6 w-3/4" />
        </div>
      ) : (
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {inventory?.title}
          </h1>
          <p className="text-muted-foreground">{inventory?.description}</p>
        </div>
      )}

      <Tabs value={activeTab} className="mt-6">
        <TabsList className="grid w-full grid-cols-3 sm:w-auto sm:grid-cols-7">
          {TABS.map((tab) => (
            <Link
              key={tab.key}
              href={`/inventories/${params.id}${tab.href}`}
              passHref
            >
              <TabsTrigger value={tab.key} className="w-full">
                {t(tab.key)}
              </TabsTrigger>
            </Link>
          ))}
        </TabsList>
      </Tabs>

      <div className="mt-6">{children}</div>
    </div>
  );
}
