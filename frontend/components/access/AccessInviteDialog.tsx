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
import { useUsers } from "@/hooks/useUsers";
import { useAccess } from "@/hooks/useAccess";
import { Button } from "@/components/ui/button";
import { Role, User } from "@/types/shared";
import { apiFetch } from "@/lib/apiClient";
import { v4 as uuidv4 } from "uuid";

export function AccessInviteDialog() {
  const { isOpen, type, data, onClose } = useModalStore();
  const { inventoryId } = data;
  const { users } = useUsers();
  const { accessList, mutate: mutateAccess } = useAccess(inventoryId);

  const [selectedUser, setSelectedUser] = React.useState<User | null>(null);
  const [selectedRole, setSelectedRole] = React.useState<Role>("Viewer");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");

  const isModalOpen = isOpen && type === "addCollaborator";

  const existingUserIds = new Set(accessList?.map((a) => a.userId));
  const availableUsers =
    searchQuery.length > 0
      ? users
          ?.filter((user) => !existingUserIds.has(user.id))
          .filter(
            (user) =>
              user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              user.email.toLowerCase().includes(searchQuery.toLowerCase())
          )
          .slice(0, 5) // Limit to 5 results
      : [];

  const handleInvite = async () => {
    if (!selectedUser || !inventoryId) {
      toast.error("Please select a user and role.");
      return;
    }
    setIsSubmitting(true);
    try {
      await apiFetch("/access", {
        method: "POST",
        body: JSON.stringify({
          id: uuidv4(),
          inventoryId,
          userId: selectedUser.id,
          role: selectedRole,
        }),
      });
      toast.success(`${selectedUser.name} has been added.`);
      mutateAccess();
      onClose();
    } catch (error) {
      toast.error("Failed to add user.");
    } finally {
      setIsSubmitting(false);
      setSelectedUser(null);
    }
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Collaborator</DialogTitle>
          <DialogDescription>
            Search for a user to invite to this inventory.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Command>
            <CommandInput
              placeholder="Search for a user..."
              value={searchQuery}
              onValueChange={setSearchQuery}
            />
            <CommandList>
              <CommandEmpty>No users found.</CommandEmpty>
              <CommandGroup>
                {availableUsers?.map((user) => (
                  <CommandItem
                    key={user.id}
                    onSelect={() => setSelectedUser(user)}
                  >
                    {user.name} ({user.email})
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
          {selectedUser && (
            <p className="text-sm">
              Selected: <span className="font-medium">{selectedUser.name}</span>
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
              <SelectItem value="Owner">Owner</SelectItem>
              <SelectItem value="Editor">Editor</SelectItem>
              <SelectItem value="Viewer">Viewer</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button
            onClick={handleInvite}
            disabled={!selectedUser || isSubmitting}
          >
            {isSubmitting ? "Inviting..." : "Add"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
