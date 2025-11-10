import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

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

export function BooleanField({ field, value, onChange, disabled }: FieldProps) {
  return (
    <div className="flex items-center space-x-2">
      <Checkbox
        id={`field-${field.id}`}
        checked={!!value}
        onCheckedChange={(checked) => onChange(checked)}
        disabled={disabled}
      />
      <Label htmlFor={`field-${field.id}`} className="cursor-pointer">
        {field.title}
        {field.required && <span className="text-destructive ml-1">*</span>}
      </Label>
    </div>
  );
}
