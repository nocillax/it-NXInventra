import { useFormContext } from "react-hook-form";
import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCategories } from "@/hooks/useCategories";
import { Category } from "@/types/shared";

interface CategorySelectProps {
  label: string;
  placeholder: string;
}

export function CategorySelect({ label, placeholder }: CategorySelectProps) {
  const { setValue, watch } = useFormContext();
  const { categories, isLoading } = useCategories();
  const selectedCategory = watch("category");

  return (
    <FormItem>
      <FormLabel>{label}</FormLabel>
      <Select
        value={selectedCategory}
        onValueChange={(value) => setValue("category", value)}
      >
        <FormControl>
          <SelectTrigger>
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
        </FormControl>
        <SelectContent className="max-h-[200px]">
          {categories.map((category: Category) => (
            <SelectItem key={category.id} value={category.name}>
              {category.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <FormMessage />
    </FormItem>
  );
}
