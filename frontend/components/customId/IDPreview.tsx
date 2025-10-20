"use client";

import { generateIdPreview } from "@/lib/formatters";
import { IdSegment } from "@/types/shared";

interface IDPreviewProps {
  segments: IdSegment[] | undefined;
}

export function IDPreview({ segments }: IDPreviewProps) {
  const previewId = generateIdPreview(segments);
  return (
    <div>
      <h3 className="text-lg font-medium">ID Preview</h3>
      <p className="text-sm text-muted-foreground">
        This is an example of what your item IDs will look like.
      </p>
      <div className="mt-4 rounded-md border bg-accent p-4 font-mono text-center text-lg">
        {previewId}
      </div>
    </div>
  );
}
