"use client";

import * as React from "react";
import { Link } from "@/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import Image from "next/image";
import { SupportTicketDialog } from "./SupportTicketDialog";

export function Footer() {
  const t = useTranslations("Footer");
  const { theme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  return (
    <footer className="border-t">
      <div className="container flex flex-col items-center justify-between gap-4 py-10 sm:h-24 sm:flex-row sm:py-0">
        <Link href="/" className="flex items-center space-x-2">
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
                <div className="flex items-center gap-6">
          <div className="flex flex-col items-end gap-2">
            <SupportTicketDialog />
            <p className="text-sm text-muted-foreground">
              {t.rich("copyright", {
                year: new Date().getFullYear(),
                link: (chunks) => (
                  <a
                    href="https://nocillax-portfolio.vercel.app/"
                    target="_blank"
                    rel="noreferrer"
                    className="font-medium underline underline-offset-4"
                  >
                    {chunks}
                  </a>
                ),
              })}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
