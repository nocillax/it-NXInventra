"use client";

import { Link, usePathname } from "@/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
    <Tabs value={activeTab} className="mt-6">
      <TabsList className="grid w-full grid-cols-3 sm:w-auto sm:grid-cols-7">
        {TABS.map((tab) => (
          <Link
            key={tab.key}
            href={`/inventories/${inventoryId}${tab.href}`}
            passHref
          >
            <TabsTrigger value={tab.key} className="w-full">
              {t(tab.key)}
            </TabsTrigger>
          </Link>
        ))}
      </TabsList>
    </Tabs>
  );
}
