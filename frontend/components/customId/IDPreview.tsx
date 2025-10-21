"use client";

import { generateIdPreview } from "@/lib/formatters";
import { IdSegment } from "@/types/shared";
import { useTranslations } from "next-intl";

interface IDPreviewProps {
  segments: IdSegment[] | undefined;
}

export function IDPreview({ segments }: IDPreviewProps) {
  const previewId = generateIdPreview(segments);
  const t = useTranslations("IDPreview");
  return (
    <div>
      <h3 className="text-lg font-medium">{t("preview_title")}</h3>
      <p className="text-sm text-muted-foreground">
        {t("preview_description")}
      </p>
      <div className="mt-4 rounded-md border bg-accent p-4 font-mono text-center text-lg">
        {previewId}
      </div>
    </div>
  );
}
