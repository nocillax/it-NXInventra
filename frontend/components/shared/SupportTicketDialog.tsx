"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createSupportTicket } from "@/services/supportService";

export function SupportTicketDialog() {
  const { isAuthenticated } = useAuth();
  const t = useTranslations("Support");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState("");
  const [priority, setPriority] = useState("");
  const [inventoryTitle, setInventoryTitle] = useState("");

  if (!isAuthenticated) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!summary || !priority) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    try {
      await createSupportTicket({
        summary,
        priority: priority as "High" | "Average" | "Low",
        inventoryTitle: inventoryTitle || undefined,
        pageLink: window.location.href,
      });
      toast.success("Support ticket created successfully!");
      setOpen(false);
      setSummary("");
      setPriority("");
      setInventoryTitle("");
    } catch (error) {
      toast.error("Failed to create support ticket. Please try again.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          {t("createTicket")}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t("createSupportTicket")}</DialogTitle>
          <DialogDescription>{t("createTicketDescription")}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="summary">{t("summary")}</Label>
            <Textarea
              id="summary"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder={t("summaryPlaceholder")}
              required
            />
          </div>
          <div>
            <Label htmlFor="priority">{t("priority")}</Label>
            <Select value={priority} onValueChange={setPriority} required>
              <SelectTrigger>
                <SelectValue placeholder={t("selectPriority")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="High">{t("high")}</SelectItem>
                <SelectItem value="Average">{t("average")}</SelectItem>
                <SelectItem value="Low">{t("low")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="inventoryTitle">
              {t("inventoryTitle")} ({t("optional")})
            </Label>
            <Input
              id="inventoryTitle"
              value={inventoryTitle}
              onChange={(e) => setInventoryTitle(e.target.value)}
              placeholder={t("inventoryTitlePlaceholder")}
            />
          </div>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? t("submitting") : t("submit")}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
