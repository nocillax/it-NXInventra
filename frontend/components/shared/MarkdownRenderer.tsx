// components/MarkdownRenderer.tsx
"use client";

import { useTheme } from "next-themes";
import dynamic from "next/dynamic";

const MarkdownPreview = dynamic(() => import("@uiw/react-markdown-preview"), {
  ssr: false,
});

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export default function MarkdownRenderer({
  content,
  className,
}: MarkdownRendererProps) {
  const { theme } = useTheme();

  return (
    <div className={className}>
      <MarkdownPreview
        source={content}
        data-color-mode={theme === "light" ? "light" : "dark"}
        style={{
          backgroundColor: "transparent",
          color: theme === "light" ? "#1e1e1e" : "#eaeaea", // pick your Catppuccin tones here
        }}
      />
    </div>
  );
}
