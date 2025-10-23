import { useTranslations } from "next-intl";
import { Frown } from "lucide-react";
import { StatusPage } from "@/components/shared/StatusPage";

export default function NotFound() {
  const t = useTranslations("NotFound");

  return (
    <StatusPage
      icon={<Frown className="h-16 w-16 text-muted-foreground" />}
      title={`404 - ${t("title")}`}
      description={t("description")}
    />
  );
}
