"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useModalStore } from "@/stores/useModalStore";

import { useAccess } from "@/hooks/useAccess";
import { Button } from "@/components/ui/button";
import { Role, User } from "@/types/shared";
import { useTranslations } from "next-intl";
import { accessService } from "@/services/accessService";
import { useUserSearch } from "@/hooks/useUserSearch";

export function AccessInviteDialog() {
  const { isOpen, type, data, onClose } = useModalStore();
  const { inventoryId } = data;

  const { accessList, mutate: mutateAccess } = useAccess(inventoryId || "");
  const t = useTranslations("AccessInviteDialog");

  const [selectedUser, setSelectedUser] = React.useState<User | null>(null);
  const [selectedRole, setSelectedRole] = React.useState<Role>("Viewer");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");

  const isModalOpen = isOpen && type === "addCollaborator";

  const existingUserIds = new Set(accessList?.map((a) => a.userId));

  const { users: availableUsers, isLoading: isSearching } =
    useUserSearch(searchQuery);

  // Filter out users who already have access
  const filteredUsers = availableUsers?.filter(
    (user) => !existingUserIds.has(user.id)
  );

  const handleInvite = async () => {
    if (!selectedUser || !inventoryId) {
      toast.error(t("no_user_selected"));
      return;
    }
    setIsSubmitting(true);
    try {
      await accessService.addAccess(inventoryId, selectedUser.id, selectedRole);
      toast.success(t("success_message"));
      mutateAccess();
      onClose();
    } catch (error) {
      toast.error(t("failure_message"));
    } finally {
      setIsSubmitting(false);
      setSelectedUser(null);
    }
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Command>
            <CommandInput
              placeholder={t("search_placeholder")}
              value={searchQuery}
              onValueChange={setSearchQuery}
            />
            <CommandList>
              <CommandEmpty>{t("no_users_found")}</CommandEmpty>
              <CommandGroup>
                {filteredUsers?.map((user) => (
                  <CommandItem
                    key={user.id}
                    value={`${user.name} ${user.email}`} // ADD THIS LINE - it's required!
                    onSelect={() => setSelectedUser(user)}
                    className="cursor-pointer text-muted-foreground"
                  >
                    {user.name} ({user.email})
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
          {selectedUser && (
            <p className="text-sm font-medium text-muted-foreground">
              Selected:{" "}
              <span className="text-foreground">{selectedUser.name}</span>
            </p>
          )}
          <Select
            onValueChange={(value: Role) => setSelectedRole(value)}
            defaultValue="Viewer"
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Owner">{t("role_owner")}</SelectItem>
              <SelectItem value="Editor">{t("role_editor")}</SelectItem>
              <SelectItem value="Viewer">{t("role_viewer")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button
            onClick={handleInvite}
            disabled={!selectedUser || isSubmitting}
          >
            {isSubmitting ? t("adding_button") : t("add_button")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
