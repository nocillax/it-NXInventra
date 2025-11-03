"use client";

import * as React from "react";
import { useRouter } from "@/navigation";
import {
  CommandDialog,
  CommandEmpty,
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useSearch } from "@/hooks/useSearch";
import { FileText, Package, AlertCircle } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslations } from "next-intl";

export function GlobalSearch({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
}) {
  const router = useRouter();
  const [query, setQuery] = React.useState("");
  const { data, isLoading, error } = useSearch(query);
  const t = useTranslations("GlobalSearch");

  // Close search when navigating away
  React.useEffect(() => {
    if (!open) {
      setQuery(""); // Reset query when closing
    }
  }, [open]);

  // Keyboard shortcut
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(!open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, setOpen]);

  const runCommand = React.useCallback(
    (command: () => unknown) => {
      setOpen(false);
      setQuery(""); // Clear search after selection
      command();
    },
    [setOpen]
  );

  const hasResults = data.inventories.length > 0 || data.items.length > 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="overflow-hidden p-0 shadow-lg top-20 translate-y-0 sm:top-1/2 sm:-translate-y-1/2">
        <Command className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5">
          <CommandInput
            placeholder={t("search_placeholder")}
            value={query}
            onValueChange={setQuery}
          />
          <CommandList>
            {error && (
              <div className="flex items-center gap-2 p-4 text-sm text-destructive">
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            )}

            {isLoading && (
              <div className="p-4 space-y-4">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            )}

            {!isLoading && !error && !hasResults && query && (
              <CommandEmpty>{t("no_results")}</CommandEmpty>
            )}

            {!isLoading && !error && data.inventories.length > 0 && (
              <CommandGroup heading={t("inventories")}>
                {data.inventories.map((inv) => (
                  <CommandItem
                    key={inv.id}
                    value={inv.title}
                    onSelect={() => {
                      runCommand(() => router.push(`/inventories/${inv.id}`));
                    }}
                  >
                    <Package className="mr-2 h-4 w-4" />
                    <span className="truncate">{inv.title}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {!isLoading && !error && data.items.length > 0 && (
              <CommandGroup heading={t("items")}>
                {data.items.map((item) => (
                  <CommandItem
                    key={item.id}
                    value={`${item.customId} || ''}`}
                    onSelect={() => {
                      runCommand(() =>
                        router.push(
                          `/inventories/${item.inventoryId}/items/${item.id}`
                        )
                      );
                    }}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    <div className="flex flex-col min-w-0">
                      <span className="truncate font-medium">
                        {item.customId}
                      </span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
