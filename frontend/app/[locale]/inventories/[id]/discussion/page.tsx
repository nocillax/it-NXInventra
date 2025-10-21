"use client";

import { useParams } from "next/navigation";
import { DiscussionTab } from "@/components/discussion/DiscussionTab";

export default function InventoryDiscussionPage() {
  const params = useParams();
  const inventoryId = params.id as string;

  if (!inventoryId) return null;

  return <DiscussionTab inventoryId={inventoryId} />;
}
