"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string | undefined) => void;
  placeholder?: string;
  height?: number;
  className?: string;
}

export function MarkdownEditor({
  value,
  onChange,
  placeholder,
  height = 100,
  className,
}: MarkdownEditorProps) {
  const [isEmpty, setIsEmpty] = useState(true);

  useEffect(() => {
    setIsEmpty(!value || value.trim().length === 0);
  }, [value]);

  const { theme } = useTheme();

  return (
    <div
      className={cn("relative w-full", className)}
      data-color-mode={theme === "dark" ? "dark" : "light"}
    >
      {/* Actual Markdown Editor */}
      <MDEditor
        value={value}
        onChange={onChange}
        height={height}
        preview="edit"
        hideToolbar={true}
      />

      {/* Simulated placeholder */}
      {isEmpty && placeholder && (
        <div className="absolute top-3 left-4 text-muted-foreground pointer-events-none select-none opacity-60">
          {placeholder}
        </div>
      )}
    </div>
  );
}
