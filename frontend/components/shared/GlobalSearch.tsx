"use client";

import * as React from "react";
import { Link, useRouter } from "@/navigation";
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
import { FileText, Package } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";

export function GlobalSearch({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
}) {
  const router = useRouter();
  const [query, setQuery] = React.useState("");
  const { data, isLoading } = useSearch(query);

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
      command();
    },
    [setOpen]
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="overflow-hidden p-0 shadow-lg top-20 translate-y-0 sm:top-1/2 sm:-translate-y-1/2">
        <Command className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5">
          <CommandInput
            placeholder="Search for inventories or items..."
            value={query}
            onValueChange={setQuery}
          />
          <CommandList>
            {isLoading && (
              <div className="p-4 space-y-4">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            )}
            {!isLoading && !data?.inventories.length && !data?.items.length && (
              <CommandEmpty>No results found.</CommandEmpty>
            )}
            {data?.inventories && data.inventories.length > 0 && (
              <CommandGroup heading="Inventories">
                {data.inventories.map((inv) => (
                  <CommandItem
                    key={inv.id}
                    value={inv.title}
                    onSelect={() => {
                      runCommand(() => router.push(`/inventories/${inv.id}`));
                    }}
                  >
                    <Package className="mr-2 h-4 w-4" />
                    {inv.title}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
            {data?.items && data.items.length > 0 && (
              <CommandGroup heading="Items">
                {data.items.map((item) => {
                  const inventory = data.inventories.find(
                    (inv) => inv.id === item.inventoryId
                  );
                  const inventoryTitle =
                    inventory?.title || "Unknown Inventory";
                  return (
                    <CommandItem
                      key={item.id}
                      value={`${item.customId} ${inventoryTitle}`}
                      onSelect={() => {
                        runCommand(() =>
                          router.push(`/inventories/${item.inventoryId}`)
                        );
                      }}
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      <div className="flex flex-col">
                        <span>{item.customId}</span>
                        <span className="text-xs text-muted-foreground">
                          in {inventoryTitle}
                        </span>
                      </div>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
