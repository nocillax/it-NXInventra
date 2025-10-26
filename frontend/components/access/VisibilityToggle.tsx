"use client";

import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Lock, Unlock } from "lucide-react";
import { Inventory } from "@/types/shared";
import { apiFetch } from "@/lib/apiClient";
import { useTranslations } from "next-intl";

interface VisibilityToggleProps {
  inventory: Inventory;
  onUpdate: (data?: any, options?: any) => Promise<any>;
}

export function VisibilityToggle({
  inventory,
  onUpdate,
}: VisibilityToggleProps) {
  const handleVisibilityChange = async (isPublic: boolean) => {
    const optimisticData = { ...inventory, public: isPublic };
    onUpdate(optimisticData, { revalidate: false });

    try {
      await apiFetch(`/inventories/${inventory.id}`, {
        method: "PUT",
        body: JSON.stringify({ public: isPublic }),
      });
      toast.success(`Inventory is now ${isPublic ? "Public" : "Private"}.`);
    } catch (error) {
      toast.error("Failed to update visibility.");
      onUpdate(inventory, { revalidate: false });
    }
  };
  const t = useTranslations("AccessPages");

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("visibility")}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2 sm:pt-6">
        <p className="text-sm text-muted-foreground pr-4">
          {inventory.public
            ? t("visibility_public_desc")
            : t("visibility_private_desc")}
        </p>
        <div className="flex items-center gap-3">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleVisibilityChange(!inventory.public)}
                >
                  {inventory.public ? (
                    <Unlock className="h-5 w-5" />
                  ) : (
                    <Lock className="h-5 w-5" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{inventory.public ? "Make Private" : "Make Public"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <span className="w-16 text-sm font-medium">
            {inventory.public ? t("public") : t("private")}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
