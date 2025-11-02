// components/tag-input.tsx
import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { X } from "lucide-react";
import { useTags } from "@/hooks/useTags";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

interface TagInputProps {
  label: string;
  placeholder: string;
  addTagText: string;
}

export function TagInput({ label, placeholder, addTagText }: TagInputProps) {
  const { setValue, getValues, watch } = useFormContext();
  const [tagInput, setTagInput] = useState("");
  const { tags: tagSuggestions } = useTags(tagInput);
  const currentTags = watch("tags");

  const addTag = () => {
    if (tagInput.trim() && !currentTags.includes(tagInput.trim())) {
      setValue("tags", [...currentTags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setValue(
      "tags",
      currentTags.filter((tag: string) => tag !== tagToRemove)
    );
  };

  return (
    <FormItem>
      <FormLabel>{label}</FormLabel>
      <div className="space-y-2">
        {/* Tags input with inline autocomplete */}
        <div className="relative">
          <Input
            placeholder={placeholder}
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addTag();
              } else if (e.key === "Tab" && tagSuggestions[0]) {
                e.preventDefault();
                setTagInput(tagSuggestions[0]);
              }
            }}
            className="pr-20"
          />

          {/* Inline autocomplete suggestion */}
          {tagInput &&
            tagSuggestions[0] &&
            tagSuggestions[0].startsWith(tagInput) && (
              <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <span className="text-transparent">{tagInput}</span>
                <span className="text-muted-foreground">
                  {tagSuggestions[0].slice(tagInput.length)}
                </span>
              </div>
            )}

          <Button
            type="button"
            variant="outline"
            className="absolute right-1 top-1 h-7 px-2"
            onClick={addTag}
          >
            {addTagText}
          </Button>
        </div>

        {/* Keyboard hint */}
        {tagInput && tagSuggestions[0] && (
          <p className="text-xs text-muted-foreground">
            Press{" "}
            <kbd className="px-1 py-0.5 text-xs bg-muted rounded">Tab</kbd> to
            autocomplete or{" "}
            <kbd className="px-1 py-0.5 text-xs bg-muted rounded">Enter</kbd> to
            add
          </p>
        )}

        {/* Tags display */}
        {currentTags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {currentTags.map((tag: string) => (
              <Badge
                key={tag}
                variant="secondary"
                className="flex items-center gap-1"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="ml-1 hover:bg-muted rounded-sm"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>
      <FormMessage />
    </FormItem>
  );
}
