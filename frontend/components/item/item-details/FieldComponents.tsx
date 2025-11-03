// components/item/item-details/FieldComponents.tsx
"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { MarkdownEditor } from "@/components/ui/markdown-editor";
import ReactMarkdown from "react-markdown";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info } from "lucide-react";
import MarkdownRenderer from "@/components/shared/MarkdownRenderer";

interface BaseFieldProps {
  field: {
    id: number;
    title: string;
    type: "text" | "number" | "boolean" | "textarea" | "link";
    description?: string | null;
    required?: boolean;
  };
  value: any;
  onChange: (value: any) => void;
  isEditing: boolean;
}

export function TextField({
  field,
  value,
  onChange,
  isEditing,
}: BaseFieldProps) {
  if (!isEditing) {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="font-medium">{field.title}</span>
          {field.description && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 border border-blue-300 cursor-help">
                    <Info className="h-3 w-3 text-blue-600" />
                  </div>
                </TooltipTrigger>
                <TooltipContent className="max-w-sm p-3">
                  <MarkdownRenderer content={field.description} />
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        <div className="p-4 bg-muted rounded-lg">
          <span>{value || "Empty"}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={`field-${field.id}`}>
        {field.title}
        {field.required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <Input
        id={`field-${field.id}`}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={`Enter ${field.title.toLowerCase()}`}
      />
    </div>
  );
}

export function NumberField({
  field,
  value,
  onChange,
  isEditing,
}: BaseFieldProps) {
  if (!isEditing) {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="font-medium">{field.title}</span>
          {field.description && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 border border-blue-300 cursor-help">
                    <Info className="h-3 w-3 text-blue-600" />
                  </div>
                </TooltipTrigger>
                <TooltipContent className="max-w-sm p-3">
                  <ReactMarkdown>{field.description}</ReactMarkdown>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        <div className="p-4 bg-muted rounded-lg">
          <span>{value ?? "Empty"}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={`field-${field.id}`}>
        {field.title}
        {field.required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <Input
        id={`field-${field.id}`}
        type="number"
        value={value || ""}
        onChange={(e) => onChange(e.target.value ? Number(e.target.value) : "")}
        placeholder={`Enter ${field.title.toLowerCase()}`}
      />
    </div>
  );
}

export function BooleanField({
  field,
  value,
  onChange,
  isEditing,
}: BaseFieldProps) {
  if (!isEditing) {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="font-medium">{field.title}</span>
          {field.description && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 border border-blue-300 cursor-help">
                    <Info className="h-3 w-3 text-blue-600" />
                  </div>
                </TooltipTrigger>
                <TooltipContent className="max-w-sm p-3">
                  <ReactMarkdown>{field.description}</ReactMarkdown>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        <div className="p-4 bg-muted rounded-lg">
          <span>{value ? "Yes" : "No"}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      <Label htmlFor={`field-${field.id}`} className="cursor-pointer">
        {field.title}
      </Label>
      <Checkbox
        id={`field-${field.id}`}
        checked={!!value}
        onCheckedChange={(checked) => onChange(checked)}
      />
    </div>
  );
}

export function TextareaField({
  field,
  value,
  onChange,
  isEditing,
}: BaseFieldProps) {
  if (!isEditing) {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="font-medium">{field.title}</span>
          {field.description && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 border border-blue-300 cursor-help">
                    <Info className="h-3 w-3 text-blue-600" />
                  </div>
                </TooltipTrigger>
                <TooltipContent className="max-w-sm p-3">
                  <ReactMarkdown>{field.description}</ReactMarkdown>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        <div className="p-4 bg-muted rounded-lg">
          {value ? <MarkdownRenderer content={value} /> : <span>Empty</span>}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={`field-${field.id}`}>
        {field.title}
        {field.required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <MarkdownEditor
        value={value || ""}
        onChange={onChange}
        className="min-h-[100px]"
      />
    </div>
  );
}

export function LinkField({
  field,
  value,
  onChange,
  isEditing,
}: BaseFieldProps) {
  if (!isEditing) {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="font-medium">{field.title}</span>
          {field.description && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 border border-blue-300 cursor-help">
                    <Info className="h-3 w-3 text-blue-600" />
                  </div>
                </TooltipTrigger>
                <TooltipContent className="max-w-sm p-3">
                  <ReactMarkdown>{field.description}</ReactMarkdown>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        <div className="p-4 bg-muted rounded-lg">
          {value ? (
            <a
              href={value}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              {value}
            </a>
          ) : (
            <span>Empty</span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={`field-${field.id}`}>
        {field.title}
        {field.required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <Input
        id={`field-${field.id}`}
        type="url"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder="https://example.com"
      />
    </div>
  );
}
