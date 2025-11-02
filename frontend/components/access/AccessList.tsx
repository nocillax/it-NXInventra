"use client";

import { toast } from "sonner";
import * as React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { Access, Role } from "@/types/shared";
import { useModalStore } from "@/stores/useModalStore";
import { accessService } from "@/services/accessService";
import { useAccess } from "@/hooks/useAccess";
import { useTranslations } from "next-intl";

interface AccessListProps {
  accessList: Access[];
  inventoryId: string;
}

export function AccessList({ accessList, inventoryId }: AccessListProps) {
  const { onOpen } = useModalStore();
  const { mutate } = useAccess(inventoryId);
  const ownerCount = accessList.filter((a) => a.role === "Owner").length;
  const t = useTranslations("AccessList");

  const handleRoleChange = async (userId: string, role: Role) => {
    try {
      await accessService.updateRole(inventoryId, userId, role);
      toast.success(t("success_message"));
      mutate();
    } catch (error) {
      toast.error(t("failure_message"));
    }
  };

  return (
    <>
      {/* Desktop View: Table */}
      <div className="hidden rounded-md border sm:block">
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
              const isOwner = access.role === "Owner";
              const isLastOwner = isOwner && ownerCount === 1;
              return (
                <TableRow key={access.userId}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>
                          {access.userName?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{access.userName}</p>
                        <p className="text-sm text-muted-foreground">
                          {access.userEmail}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Select
                      value={access.role}
                      onValueChange={(value: Role) =>
                        handleRoleChange(access.userId, value)
                      }
                      disabled={isLastOwner}
                    >
                      <SelectTrigger className="w-[120px] mx-auto">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Owner">{t("role_owner")}</SelectItem>
                        <SelectItem value="Editor">
                          {t("role_editor")}
                        </SelectItem>
                        <SelectItem value="Viewer">
                          {t("role_viewer")}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-center">
                    {!isOwner && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          onOpen("removeAccess", {
                            userId: access.userId,
                            inventoryId,
                          })
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

      {/* Mobile View: List of Cards */}
      <div className="grid gap-4 sm:hidden">
        {accessList.map((access) => {
          const isOwner = access.role === "Owner";
          const isLastOwner = isOwner && ownerCount === 1;

          return (
            <div
              key={access.userId}
              className="flex flex-col gap-4 rounded-lg border bg-card p-4 text-card-foreground"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>
                      {access.userName?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{access.userName}</p>
                    <p className="text-sm text-muted-foreground">
                      {access.userEmail}
                    </p>
                  </div>
                </div>
                {!isOwner && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      onOpen("removeAccess", {
                        userId: access.userId,
                        inventoryId,
                      })
                    }
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                )}
              </div>
              <div>
                <Select
                  value={access.role}
                  onValueChange={(value: Role) =>
                    handleRoleChange(access.userId, value)
                  }
                  disabled={isLastOwner}
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
            </div>
          );
        })}
      </div>
    </>
  );
}
