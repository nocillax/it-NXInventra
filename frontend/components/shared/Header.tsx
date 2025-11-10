"use client";

import * as React from "react";
import { Menu, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./ThemeToggle";
import { UserNav } from "@/components/shared/UserNav";
import { Link } from "@/navigation";
import LanguageToggle from "@/components/shared/LanguageToggle";
import { useTranslations } from "next-intl";
import { GlobalSearch } from "./GlobalSearch";
import { useTheme } from "next-themes";

import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Image from "next/image";
import { useAuth } from "@/hooks/useAuth";

export function Header() {
  const t = useTranslations("Header");
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const { theme } = useTheme();
  const { user, isLoading, logout } = useAuth();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* ======================================================================= */}
      {/* Desktop Header                                                          */}
      {/* ======================================================================= */}
      <div className="container hidden h-14 items-center md:flex">
        <div className="mr-4 flex items-center">
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
          <nav className="hidden items-center space-x-6 text-sm font-medium md:flex">
            {user && (
              <Link
                href="/"
                className="transition-colors hover:text-foreground/80 text-foreground/60"
              >
                {t("home_link")}
              </Link>
            )}

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
              <span className="inline-flex lg:hidden">
                {t("search_placeholder")}
              </span>
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
      </div>

      {/* ======================================================================= */}
      {/* Mobile Header                                                           */}
      {/* ======================================================================= */}
      <div className="container grid h-14 grid-cols-3 items-center px-2 md:hidden">
        {/* Left Side: Burger Menu */}
        <div className="justify-self-start">
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Open mobile menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex w-[280px] flex-col p-0">
              <SheetHeader className=" p-4">
                <Link
                  href="/"
                  className="flex items-center justify-center w-full relative space-x-2  pb-4 border-b"
                >
                  {mounted ? (
                    <Image
                      src={
                        theme === "dark"
                          ? "/logos/nocillax-logo-light.png"
                          : "/logos/nocillax-logo-dark.png"
                      }
                      alt="NXInventra Logo"
                      width={32}
                      height={32}
                    />
                  ) : (
                    <div className="h-8 w-8" />
                  )}
                  <span className="font-bold">NXInventra</span>
                </Link>
              </SheetHeader>
              <nav className="flex-1 space-y-2 p-4">
                {user && (
                  <Button
                    variant="ghost"
                    className="w-full justify-start border-b h-12"
                    asChild
                    onClick={() => setSheetOpen(false)}
                  >
                    <Link href="/">{t("home_link")}</Link>
                  </Button>
                )}
                <Button
                  variant="ghost"
                  className="w-full justify-start border-b h-12"
                  asChild
                  onClick={() => setSheetOpen(false)}
                >
                  <Link href="/explore">{t("explore_link")}</Link>
                </Button>
                {user && (
                  <Button
                    variant="ghost"
                    className="w-full justify-start border-b h-12"
                    asChild
                    onClick={() => setSheetOpen(false)}
                  >
                    <Link href="/profile">{t("profile_link")}</Link>
                  </Button>
                )}
              </nav>
              <SheetFooter className="mt-auto flex-col items-stretch gap-2 border-t p-4">
                <div className="flex w-full items-center justify-between gap-2">
                  <Button variant="ghost" className="w-full justify-start px-2">
                    <span className="text-sm text-muted-foreground">
                      {t("theme_toggle")}
                    </span>
                  </Button>
                  <ThemeToggle />
                </div>
                <div className="flex w-full items-center justify-between gap-2">
                  <Button variant="ghost" className="w-full justify-start px-2">
                    <span className="text-sm text-muted-foreground">
                      {t("language_toggle")}
                    </span>
                  </Button>
                  <LanguageToggle />
                </div>
                {user && (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      logout(); // Use the logout from useAuth
                      setSheetOpen(false);
                    }}
                  >
                    {t("log_out")}
                  </Button>
                )}
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </div>

        {/* Center: Logo */}
        <div className="justify-self-center">
          <Link href="/" className="flex items-center">
            <Image
              src={
                theme === "dark"
                  ? "/logos/nocillax-logo-light.png"
                  : "/logos/nocillax-logo-dark.png"
              }
              alt="Logo"
              width={32}
              height={32}
            />
          </Link>
        </div>

        {/* Right Side: Search and UserNav */}
        <div className="flex items-center justify-self-end gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSearchOpen(true)}
          >
            <Search className="h-6 w-6" />
            <span className="sr-only">Search</span>
          </Button>
          <UserNav />
        </div>
      </div>
      {/* GlobalSearch is now a single instance outside the responsive divs */}
      <GlobalSearch open={searchOpen} setOpen={setSearchOpen} />
    </header>
  );
}
