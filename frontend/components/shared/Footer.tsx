"use client";

import * as React from "react";
import { Link } from "@/navigation";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import Image from "next/image";

export function Footer() {
  const t = useTranslations("Footer");
  const { theme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  return (
    <footer className="border-t">
      <div className="container flex h-24 items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          {mounted ? (
            <Image
              src={
                theme === "dark"
                  ? "/logos/nocillax-logo-light.png"
                  : "/logos/nocillax-logo-dark.png"
              }
              alt="NXInventra Logo"
              width={42}
              height={42}
            />
          ) : (
            <div className="h-6 w-6" />
          )}
          <span className="font-bold">NXInventra</span>
        </Link>
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
    </footer>
  );
}
