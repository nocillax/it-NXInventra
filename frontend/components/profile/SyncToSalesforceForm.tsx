"use client";

import * as React from "react";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { useAuth } from "@/hooks/useAuth";
import { apiFetch } from "@/lib/apiClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";

const industries = [
  "Technology",
  "Healthcare",
  "Finance",
  "Manufacturing",
  "Retail",
  "Education",
  "Consulting",
  "Transportation",
  "Energy",
];

const countries = [
  "United States",
  "Canada",
  "United Kingdom",
  "Australia",
  "Germany",
  "France",
  "India",
  "Japan",
  "Brazil",
  "Mexico",
];

export function SyncToSalesforceForm() {
  const t = useTranslations("Profile");
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [formData, setFormData] = useState({
    companyName: "",
    industry: "",
    phone: "",
    street: "",
    city: "",
    zipCode: "",
    country: "",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.companyName.trim()) {
      toast.error(t("company_required_error"));
      return;
    }

    setIsLoading(true);
    try {
      console.log("Sending formData:", formData);
      await apiFetch("/user/sync-to-salesforce", {
        method: "POST",
        body: JSON.stringify(formData),
      });
      toast.success(t("sync_success"));
      // Reset form
      setFormData({
        companyName: "",
        industry: "",
        phone: "",
        street: "",
        city: "",
        zipCode: "",
        country: "",
      });
    } catch (error: any) {
      console.error("API Error:", error);
      toast.error(t("sync_failure"));
    } finally {
      setIsLoading(false);
    }
  };

  // Only show for current user (profile page is always current user's)
  if (!user) return null;

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>{t("sync_title")}</CardTitle>
        <CardDescription>{t("sync_description")}</CardDescription>
        <Button
          variant="default"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full"
        >
          {isCollapsed ? t("show_sync_form") : t("hide_sync_form")}
        </Button>
      </CardHeader>
      {!isCollapsed && (
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="companyName">{t("company_name_label")}</Label>
              <Input
                id="companyName"
                value={formData.companyName}
                onChange={(e) =>
                  handleInputChange("companyName", e.target.value)
                }
                placeholder={t("company_name_placeholder")}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="industry">{t("industry_label")}</Label>
              <Select
                onValueChange={(value) => handleInputChange("industry", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("select_industry_placeholder")} />
                </SelectTrigger>
                <SelectContent>
                  {industries.map((industry) => (
                    <SelectItem key={industry} value={industry}>
                      {industry}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">{t("phone_label")}</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                placeholder={t("phone_placeholder")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="street">{t("street_label")}</Label>
              <Input
                id="street"
                value={formData.street}
                onChange={(e) => handleInputChange("street", e.target.value)}
                placeholder={t("street_placeholder")}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">{t("city_label")}</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleInputChange("city", e.target.value)}
                  placeholder={t("city_placeholder")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="zipCode">{t("zip_code_label")}</Label>
                <Input
                  id="zipCode"
                  value={formData.zipCode}
                  onChange={(e) => handleInputChange("zipCode", e.target.value)}
                  placeholder={t("zip_code_placeholder")}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">{t("country_label")}</Label>
              <Select
                onValueChange={(value) => handleInputChange("country", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("select_country_placeholder")} />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((country) => (
                    <SelectItem key={country} value={country}>
                      {country}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? t("syncing_message") : t("sync_button")}
            </Button>
          </form>
        </CardContent>
      )}
    </Card>
  );
}
