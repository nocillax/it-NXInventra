"use client";

import * as React from "react";
import { Link, useRouter } from "@/navigation";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useSearch } from "@/hooks/useSearch";
import { FileText, Package } from "lucide-react";
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
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput
        placeholder="Search for inventories or items..."
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        {isLoading && (
          <div className="p-4 space-y-4">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-4 w-1/2" />
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
            {data.items.map((item) => (
              <CommandItem
                key={item.id}
                value={item.customId}
                onSelect={() => {
                  runCommand(() =>
                    router.push(`/inventories/${item.inventoryId}`)
                  );
                }}
              >
                <FileText className="mr-2 h-4 w-4" />
                {item.customId}
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
}
