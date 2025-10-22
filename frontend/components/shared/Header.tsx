"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { UserNav } from "@/components/shared/UserNav";
import { Package2 } from "lucide-react";
import { Link } from "@/navigation";
import LanguageToggle from "@/components/shared/LanguageToggle";
import { useTranslations } from "next-intl";
import { GlobalSearch } from "./GlobalSearch";

export function Header() {
  const t = useTranslations("Header");
  const [searchOpen, setSearchOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Package2 className="h-6 w-6" />
            <span className="hidden font-bold sm:inline-block">NXInventra</span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            <Button
              variant="outline"
              className="relative h-8 w-full justify-start rounded-[0.5rem] bg-background text-sm font-normal text-muted-foreground shadow-none sm:pr-12 md:w-40 lg:w-64"
              onClick={() => setSearchOpen(true)}
            >
              <span className="hidden lg:inline-flex">
                {t("search_placeholder")}
              </span>
              <span className="inline-flex lg:hidden">Search...</span>
              <kbd className="pointer-events-none absolute right-[0.3rem] top-[0.3rem] hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
                <span className="text-xs">⌘</span>K
              </kbd>
            </Button>
          </div>
          <nav className="flex items-center space-x-2">
            <LanguageToggle />
            <ThemeToggle />
            <UserNav />
          </nav>
        </div>
        <GlobalSearch open={searchOpen} setOpen={setSearchOpen} />
      </div>
    </header>
  );
}
