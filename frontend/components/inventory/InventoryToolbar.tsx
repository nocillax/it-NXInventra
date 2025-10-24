"use client";

import { Link, usePathname } from "@/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
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

interface InventoryToolbarProps {
  inventoryId: string;
}

export function InventoryToolbar({ inventoryId }: InventoryToolbarProps) {
  const pathname = usePathname();
  const t = useTranslations("InventoryTabs");

  const activeTab =
    TABS.find((tab) => `/inventories/${inventoryId}${tab.href}` === pathname)
      ?.key || "items";

  return (
    <div className="relative mt-6">
      <ScrollArea className="w-full whitespace-nowrap">
        <Tabs value={activeTab}>
          <TabsList>
            {TABS.map((tab) => (
              <Link
                key={tab.key}
                href={`/inventories/${inventoryId}${tab.href}`}
                passHref
              >
                <TabsTrigger value={tab.key}>{t(tab.key)}</TabsTrigger>
              </Link>
            ))}
          </TabsList>
        </Tabs>
        <ScrollBar orientation="horizontal" className="invisible" />
      </ScrollArea>
    </div>
  );
}
