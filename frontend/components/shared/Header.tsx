"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./ThemeToggle";
import { UserNav } from "@/components/shared/UserNav";
import { Link } from "@/navigation";
import LanguageToggle from "@/components/shared/LanguageToggle";
import { useTranslations } from "next-intl";
import { GlobalSearch } from "./GlobalSearch";
import { useTheme } from "next-themes";
import { useUserStore } from "@/stores/useUserStore";
import Image from "next/image";

export function Header() {
  const t = useTranslations("Header");
  const [searchOpen, setSearchOpen] = React.useState(false);
  const { theme } = useTheme();
  const { user } = useUserStore();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-10 flex items-center space-x-2">
            {mounted ? (
              <Image
                src={
                  theme === "dark"
                    ? "/logos/nocillax-logo-light.png"
                    : "/logos/nocillax-logo-dark.png"
                }
                alt="NXInventra Logo"
                width={40}
                height={40}
              />
            ) : (
              <div className="h-6 w-6" />
            )}
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <Link
              href="/"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              {t("home_link")}
            </Link>
            <Link
              href="/shared-with-me"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              {t("shared_link")}
            </Link>
            <Link
              href="/explore"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              {t("explore_link")}
            </Link>
          </nav>
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

            {user && (
              <p className="text-sm font-medium text-muted-foreground hidden sm:block">
                {t("greeting", { name: user.name.split(" ")[0] })}
              </p>
            )}
            <UserNav />
          </nav>
        </div>
        <GlobalSearch open={searchOpen} setOpen={setSearchOpen} />
      </div>
    </header>
  );
}
