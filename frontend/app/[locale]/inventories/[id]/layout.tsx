"use client";

import { usePathname, useParams } from "next/navigation";
import { Link } from "@/navigation";
import { useInventory } from "@/hooks/useInventory";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

const TABS = [
  { name: "Items", href: "" },
  { name: "Discussion", href: "/discussion" },
  { name: "Settings", href: "/settings" },
  { name: "Custom ID", href: "/custom-id" },
  { name: "Fields", href: "/fields" },
  { name: "Access", href: "/access" },
  { name: "Statistics", href: "/statistics" },
];

export default function InventoryDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const pathname = usePathname();
  const { inventory, isLoading } = useInventory(params.id as string);

  const activeTab =
    TABS.find((tab) => `/inventories/${params.id}${tab.href}` === pathname)
      ?.name || "Items";

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
              key={tab.name}
              href={`/inventories/${params.id}${tab.href}`}
              passHref
            >
              <TabsTrigger value={tab.name} className="w-full">
                {tab.name}
              </TabsTrigger>
            </Link>
          ))}
        </TabsList>
      </Tabs>

      <div className="mt-6">{children}</div>
    </div>
  );
}
