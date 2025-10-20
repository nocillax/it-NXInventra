"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Contributor, User } from "@/types/shared";

interface TopContributorsCardProps {
  contributors: Contributor[];
  users: User[];
}

export function TopContributorsCard({
  contributors,
  users,
}: TopContributorsCardProps) {
  const usersMap = new Map(users.map((user) => [user.id, user]));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Contributors</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {contributors.map((contributor) => {
          const user = usersMap.get(contributor.userId);
          return (
            <div key={contributor.userId} className="flex items-center">
              <Avatar className="h-9 w-9">
                <AvatarImage src={user?.avatar} alt={user?.name} />
                <AvatarFallback>
                  {user?.name?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="ml-4 space-y-1">
                <p className="text-sm font-medium leading-none">{user?.name}</p>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
              <div className="ml-auto font-medium">
                {contributor.count} items
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
