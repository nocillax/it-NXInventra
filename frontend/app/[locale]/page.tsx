"use client";

import { useRouter } from "@/navigation";
import { useModalStore } from "@/stores/useModalStore";
import { useInventories } from "@/hooks/useInventories";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useTranslations } from "next-intl";

export default function HomePage() {
  const t = useTranslations("Dashboard");
  const { inventories, isLoading } = useInventories();
  const { onOpen } = useModalStore();
  const router = useRouter();

  return (
    <main className="container py-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{t("dashboard")}</h1>
        <Button onClick={() => onOpen("createInventory")}>
          {t("create_inventory")}
        </Button>
      </div>

      <div className="mt-6">
        <h2 className="text-xl font-semibold">{t("inventories")}</h2>

        <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {isLoading &&
            Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full mt-2" />
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-6 w-24" />
                  </div>
                </CardContent>
              </Card>
            ))}
          {inventories?.map((inventory) => (
            <Card
              key={inventory.id}
              className="cursor-pointer hover:bg-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              onClick={() => router.push(`/inventories/${inventory.id}`)}
              onKeyDown={(e) =>
                e.key === "Enter" && router.push(`/inventories/${inventory.id}`)
              }
              tabIndex={0}
            >
              <CardHeader>
                <CardTitle>{inventory.title}</CardTitle>
                <CardDescription>{inventory.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {inventory.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </main>
  );
}
