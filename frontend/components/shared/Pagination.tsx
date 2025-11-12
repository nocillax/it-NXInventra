"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  const t = useTranslations("Pagination");

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const locale = useLocale();

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat(locale).format(num);
  };

  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex items-center justify-end space-x-2 py-4">
      <Button
        variant="outline"
        size="sm"
        onClick={handlePrevious}
        disabled={currentPage === 1}
      >
        <ChevronLeft className="h-4 w-4" />
        <span className="hidden sm:inline-block sm:ml-2">{t("previous")}</span>
      </Button>
      <span className="text-sm text-muted-foreground">
        {t("page_info", {
          current: formatNumber(currentPage),
          total: formatNumber(totalPages),
        })}
      </span>
      <Button
        variant="outline"
        size="sm"
        onClick={handleNext}
        disabled={currentPage === totalPages}
      >
        <span className="hidden sm:inline-block sm:mr-2">{t("next")}</span>
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
