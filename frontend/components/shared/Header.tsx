"use client";

import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { UserNav } from "@/components/shared/UserNav";
import { Package2 } from "lucide-react";
import { Link } from "@/navigation";
import LanguageToggle from "@/components/shared/LanguageToggle";
import { useTranslations } from "next-intl";

export function Header() {
  const t = useTranslations("Header");

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
            <Input
              type="search"
              placeholder={t("search_placeholder")}
              className="md:w-28 lg:w-64"
            />
          </div>
          <nav className="flex items-center space-x-2">
            <LanguageToggle />
            <ThemeToggle />
            <UserNav />
          </nav>
        </div>
      </div>
    </header>
  );
}
