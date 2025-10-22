"use client";

import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { Access, Role, User } from "@/types/shared";
import { useModalStore } from "@/stores/useModalStore";
import { apiFetch } from "@/lib/apiClient";
import { useAccess } from "@/hooks/useAccess";
import { useTranslations } from "next-intl";

interface AccessListProps {
  accessList: Access[];
  users: User[];
  inventoryId: string;
  createdBy: string;
}

export function AccessList({
  accessList,
  users,
  inventoryId,
  createdBy,
}: AccessListProps) {
  const usersMap = new Map(users.map((user) => [user.id, user]));
  const { onOpen } = useModalStore();
  const { mutate } = useAccess(inventoryId);
  const ownerCount = accessList.filter((a) => a.role === "Owner").length;
  const t = useTranslations("AccessList");

  const handleRoleChange = async (accessId: string, role: Role) => {
    try {
      await apiFetch(`/access/${accessId}`, {
        method: "PUT",
        body: JSON.stringify({ role }),
      });
      toast.success(t("success_message"));
      mutate();
    } catch (error) {
      toast.error(t("failure_message"));
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("user")}</TableHead>
            <TableHead className="text-center">{t("role")}</TableHead>
            <TableHead className="w-[80px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {accessList.map((access) => {
            const user = usersMap.get(access.userId);
            const isOwner = access.userId === createdBy;
            const isLastOwner = isOwner && ownerCount === 1;
            return (
              <TableRow key={access.userId}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={user?.avatar} alt={user?.name} />
                      <AvatarFallback>
                        {user?.name?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{user?.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {user?.email}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <Select
                    value={access.role}
                    onValueChange={(value: Role) =>
                      handleRoleChange(access.id, value)
                    }
                    disabled={isLastOwner}
                  >
                    <SelectTrigger className="w-[120px] mx-auto">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Owner">{t("role_owner")}</SelectItem>
                      <SelectItem value="Writer">{t("role_writer")}</SelectItem>
                      <SelectItem value="Viewer">{t("role_viewer")}</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell className="text-center">
                  {!isOwner && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        onOpen("removeAccess", { access, inventoryId })
                      }
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
