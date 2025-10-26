"use client";

import * as React from "react";
import { Link, usePathname } from "@/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useTranslations } from "next-intl";
import { useRbac } from "@/hooks/useRbac";
import { Inventory } from "@/types/shared";
import { Skeleton } from "../ui/skeleton";

const TABS = [
  { key: "items", href: "", ownerOnly: false, viewer: true },
  { key: "discussion", href: "/discussion", ownerOnly: false, viewer: true },
  { key: "statistics", href: "/statistics", ownerOnly: false, viewer: true },
  { key: "settings", href: "/settings", ownerOnly: true, viewer: false },
  { key: "custom_id", href: "/custom-id", ownerOnly: true, viewer: false },
  { key: "fields", href: "/fields", ownerOnly: true, viewer: false },
  { key: "access", href: "/access", ownerOnly: true, viewer: false },
];

interface InventoryToolbarProps {
  inventory: Inventory;
}

export function InventoryToolbar({ inventory }: InventoryToolbarProps) {
  const pathname = usePathname();
  const t = useTranslations("InventoryTabs");
  const { isOwner, canView, isLoading } = useRbac(inventory);

  const visibleTabs = React.useMemo(() => {
    if (!canView) return [];
    return TABS.filter((tab) => {
      if (tab.ownerOnly) {
        return isOwner;
      }
      return tab.viewer;
    });
  }, [isOwner, canView]);

  const activeTab =
    TABS.find((tab) => `/inventories/${inventory.id}${tab.href}` === pathname)
      ?.key || "items";

  return (
    <div className="relative mt-6">
      {isLoading && (
        <div className="flex space-x-2">
          <Skeleton className="h-10 w-20" />
          <Skeleton className="h-10 w-20" />
          <Skeleton className="h-10 w-20" />
        </div>
      )}
      {!isLoading && canView && (
        <ScrollArea className="w-full whitespace-nowrap">
          <Tabs value={activeTab}>
            <TabsList>
              {visibleTabs.map((tab) => (
                <Link
                  key={tab.key}
                  href={`/inventories/${inventory.id}${tab.href}`}
                  passHref
                >
                  <TabsTrigger value={tab.key}>{t(tab.key)}</TabsTrigger>
                </Link>
              ))}
            </TabsList>
          </Tabs>
          <ScrollBar orientation="horizontal" className="invisible" />
        </ScrollArea>
      )}
    </div>
  );
}
