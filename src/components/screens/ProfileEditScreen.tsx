"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import EmptyState from "@/components/ui/EmptyState";
import ToastNotice from "@/components/ui/ToastNotice";
import {
  useGetMeQuery,
  usePatchMeMutation,
} from "@/redux/apis/pagepalEndpoints";
import ProfileEditForm from "@/components/forms/ProfileEditForm";
import { ProfileEditValues } from "@/schemas/pagepalForms";

export function ProfileEditScreen() {
  const [toastOpen, setToastOpen] = useState(false);
  const router = useRouter();
  const { data: me } = useGetMeQuery();
  const [patchMe, { isLoading }] = usePatchMeMutation();

  if (!me) {
    return (
      <AppShell zone="D" pageTitle="Edit Profile">
        <EmptyState title="Unable to edit profile right now." />
      </AppShell>
    );
  }

  const initialValues: ProfileEditValues = {
    name: me.displayName,
    bio: me.bio,
  };

  const handleSubmit = async (values: ProfileEditValues) => {
    await patchMe({
      name: values.name,
      bio: values.bio,
    }).unwrap();

    setToastOpen(true);
    window.setTimeout(() => {
      router.push("/profile/me");
    }, 400);
  };

  return (
    <AppShell zone="D" pageTitle="Edit Profile">
      <section className="space-y-4">
        <h1 className="serif-display text-2xl text-text">Edit My Profile</h1>
        <ProfileEditForm initialValues={initialValues} onSubmit={handleSubmit} isSubmitting={isLoading} />
      </section>
      <ToastNotice open={toastOpen} onClose={() => setToastOpen(false)} message="Profile updated." />
    </AppShell>
  );
}
