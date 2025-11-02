// components/visibility-toggle.tsx
import { useFormContext } from "react-hook-form";
import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";

interface VisibilityToggleProps {
  label: string;
  description: string;
}

export function VisibilityToggle({
  label,
  description,
}: VisibilityToggleProps) {
  const { watch, setValue } = useFormContext();
  const isPublic = watch("public");

  return (
    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
      <div className="space-y-0.5">
        <FormLabel className="text-base">{label}</FormLabel>
        <div className="text-sm text-muted-foreground">{description}</div>
      </div>
      <FormControl>
        <Switch
          checked={isPublic}
          onCheckedChange={(checked) => setValue("public", checked)}
        />
      </FormControl>
      <FormMessage />
    </FormItem>
  );
}
