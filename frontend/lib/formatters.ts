import { IdSegment } from "@/types/shared";

/**
 * Generates a preview of an item ID based on an array of segments.
 * @param segments The array of IdSegment objects.
 * @returns A formatted ID string for preview purposes.
 */
export function generateIdPreview(segments: IdSegment[] | undefined): string {
  if (!segments || segments.length === 0) {
    return "N/A";
  }

  const year = new Date().getFullYear().toString();

  return segments
    .map((segment) => {
      switch (segment.type) {
        case "fixed":
          return segment.value || "";
        case "date":
          // For now, just handle 'yyyy' as per PRD
          if (segment.format === "yyyy") {
            return year;
          }
          return `[${segment.format || "date"}]`;
        case "sequence":
          const format = segment.format || "D1";
          const match = format.match(/^(.*?)D(\d+)(.*?)$/);
          if (match) {
            const prefix = match[1] || "";
            const padLength = parseInt(match[2], 10);
            const suffix = match[3] || "";
            return `${prefix}${"1".padStart(padLength, "0")}${suffix}`;
          }
          return "1".padStart(1, "0");
        // Other types can be added here later
        default:
          return "";
      }
    })
    .join("");
}

/**
 * Generates a final item ID based on an array of segments and the item's sequence number.
 * @param segments The array of IdSegment objects.
 * @param sequence The sequence number of the item in the inventory.
 * @returns A formatted ID string.
 */
export function generateItemId(
  segments: IdSegment[] | undefined,
  sequence: number
): string {
  if (!segments || segments.length === 0) {
    return `item-${sequence}`;
  }

  const year = new Date().getFullYear().toString();

  return segments
    .map((segment) => {
      switch (segment.type) {
        case "fixed":
          return segment.value || "";
        case "date":
          if (segment.format === "yyyy") {
            return year;
          }
          return `[${segment.format || "date"}]`;
        case "sequence":
          const format = segment.format || "D1";
          const padLength = parseInt(format.replace("D", ""), 10);
          return sequence.toString().padStart(padLength, "0");
        // Other types can be added here later
        default:
          return "";
      }
    })
    .join("");
}
