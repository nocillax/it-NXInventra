import { useFormContext } from "react-hook-form";
import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface TextInputProps {
  name: string;
  label: string;
  placeholder: string;
  type?: "text" | "textarea";
}

export function TextInput({
  name,
  label,
  placeholder,
  type = "text",
}: TextInputProps) {
  const { register, watch } = useFormContext();
  const value = watch(name);

  return (
    <FormItem>
      <FormLabel>{label}</FormLabel>
      <FormControl>
        {type === "textarea" ? (
          <Textarea
            placeholder={placeholder}
            className="min-h-[100px]"
            {...register(name)}
          />
        ) : (
          <Input placeholder={placeholder} {...register(name)} />
        )}
      </FormControl>
      <FormMessage />
    </FormItem>
  );
}
