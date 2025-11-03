"use client";

import { IdSegment } from "@/types/shared";
import { useTranslations } from "next-intl";

function generateIdPreview(segments: IdSegment[] | undefined): string {
  if (!segments || segments.length === 0) {
    return "No segments defined";
  }

  return segments
    .map((segment) => {
      switch (segment.type) {
        case "fixed":
          return segment.value || "[fixed]";

        case "date":
          const now = new Date();
          const format = segment.format || "yyyy";

          let baseFormat = "";
          let suffix = "";

          // Check for the longest formats first to avoid conflicts
          if (format.startsWith("yyyy")) {
            baseFormat = "yyyy";
            suffix = format.substring(4);
          } else if (format.startsWith("ddd")) {
            baseFormat = "ddd";
            suffix = format.substring(3);
          } else if (format.startsWith("dd")) {
            baseFormat = "dd";
            suffix = format.substring(2);
          } else if (format.startsWith("mm")) {
            baseFormat = "mm";
            suffix = format.substring(2);
          } else {
            // Exact match or unknown format
            baseFormat = format;
            suffix = "";
          }

          // Generate the base value
          let baseValue = "";
          switch (baseFormat) {
            case "yyyy":
              baseValue = now.getFullYear().toString();
              break;
            case "mm":
              baseValue = String(now.getMonth() + 1).padStart(2, "0");
              break;
            case "dd":
              baseValue = String(now.getDate()).padStart(2, "0");
              break;
            case "ddd":
              baseValue = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][
                now.getDay()
              ];
              break;
            default:
              baseValue = "[date]";
          }

          return baseValue + suffix;

        case "sequence":
          // Show sample sequence number
          const seqMatch = (segment.format || "D1").match(/^D(\d+)/);
          const seqLength = seqMatch ? parseInt(seqMatch[1]) : 1;
          const sampleSeq = "1".padStart(seqLength, "0");
          const seqSuffix = (segment.format || "").substring(
            seqMatch?.[0]?.length || 0
          );
          return sampleSeq + seqSuffix;

        case "random_6digit":
          const suffix6 = segment.format || "";
          return "123456" + suffix6;

        case "random_9digit":
          const suffix9 = segment.format || "";
          return "123456789" + suffix9;

        case "random_20bit":
          if ((segment.format || "X5").startsWith("X")) {
            const suffix20 = (segment.format || "X5").substring(2);
            return "A1B2C" + suffix20;
          } else {
            const suffix20 = (segment.format || "D6").substring(2);
            return "123456" + suffix20;
          }

        case "random_32bit":
          if ((segment.format || "X8").startsWith("X")) {
            const suffix32 = (segment.format || "X8").substring(2);
            return "A1B2C3D4" + suffix32;
          } else {
            const suffix32 = (segment.format || "D10").substring(3);
            return "1234567890" + suffix32;
          }

        case "guid":
          const suffixGuid = segment.format || "";
          return "a1b2c3d4-e5f6-7890-abcd-ef1234567890" + suffixGuid;

        default:
          return `[${segment.type}]`;
      }
    })
    .join("");
}

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
      <div className="mt-4 rounded-md border bg-accent p-4 font-mono text-center text-lg break-all">
        {previewId || "No preview available"}
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        This is a sample preview. Actual values will vary.
      </p>
    </div>
  );
}
