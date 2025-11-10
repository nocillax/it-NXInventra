import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

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

export function NumberField({ field, value, onChange, disabled }: FieldProps) {
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
        disabled={disabled}
        placeholder={`Enter ${field.title.toLowerCase()}`}
      />
    </div>
  );
}
