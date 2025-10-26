"use client";

import { Link } from "@/navigation";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

interface StatusPageProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  showGoHome?: boolean;
}

export function StatusPage({
  icon,
  title,
  description,
  showGoHome = true,
}: StatusPageProps) {
  const t = useTranslations(); // Using root to get common keys like 'go_home'

  return (
    <div className="container flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] text-center py-10">
      {icon}
      <h1 className="mt-6 text-2xl font-bold tracking-tight sm:text-3xl">
        {title}
      </h1>
      <p className="mt-2 text-md text-muted-foreground sm:text-lg">
        {description}
      </p>
      {showGoHome && (
        <Button asChild className="mt-8">
          <Link href="/">{t("NotFound.go_home")}</Link>
        </Button>
      )}
    </div>
  );
}
