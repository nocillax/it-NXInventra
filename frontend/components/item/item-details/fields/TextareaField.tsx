import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useTranslations } from "next-intl";

interface FieldProps {
  field: {
    id: number;
    title: string;
    type: string;
    description?: string | null;
    required?: boolean;
  };
  value: any;
  onChange: (value: any) => void;
  disabled?: boolean;
}

export function TextareaField({
  field,
  value,
  onChange,
  disabled,
}: FieldProps) {
  const t = useTranslations("ItemCreate");
  return (
    <div className="space-y-2">
      <Label htmlFor={`field-${field.id}`}>
        {field.title}
        {field.required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <Textarea
        id={`field-${field.id}`}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder={t("textarea-placeholder")}
        className="min-h-[100px]"
      />
    </div>
  );
}
