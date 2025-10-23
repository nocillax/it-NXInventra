"use client";

import { ProfileForm } from "@/components/profile/ProfileForm";
import { PageContainer } from "@/components/shared/PageContainer";

export default function ProfilePage() {
  return (
    <PageContainer className="py-10">
      <ProfileForm />
    </PageContainer>
  );
}
