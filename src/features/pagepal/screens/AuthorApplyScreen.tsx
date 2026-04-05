"use client";

import React, { useState } from "react";
import {
  IconBook,
} from "@tabler/icons-react";
import AppShell from "@/features/pagepal/layout/AppShell";
import RoleGate from "@/components/ui/RoleGate";
import ToastNotice from "@/components/ui/ToastNotice";
import {
  useSubmitAuthorApplicationMutation,
} from "@/redux/apis/pagepalEndpoints";
import AuthorApplicationForm from "@/features/pagepal/forms/AuthorApplicationForm";

export function AuthorApplyScreen() {
  const [toastOpen, setToastOpen] = useState(false);
  const [submitAuthorApplication, { isLoading }] = useSubmitAuthorApplicationMutation();

  const handleSubmit = async (values: { bio: string; writingHistory?: string }) => {
    const payload = values.writingHistory?.trim()
      ? `${values.bio}\n\nWhat I've written:\n${values.writingHistory}`
      : values.bio;

    await submitAuthorApplication({ bio: payload }).unwrap();
    setToastOpen(true);
  };

  return (
    <AppShell zone="D" pageTitle="Author Apply">
      <RoleGate allow={["USER"]} fallbackTitle="Author applications are available for user accounts.">
        <section className="mx-auto w-full max-w-[480px] space-y-4 pt-6">
          <div className="text-center">
            <IconBook size={32} className="mx-auto text-primary" />
            <h1 className="serif-display mt-3 text-[22px] text-text">Become an author</h1>
            <p className="mt-1 text-[13px] text-text-muted">Share your books with the PagePal community.</p>
            <div className="mx-auto mt-3 h-px w-10 bg-border" />
          </div>
          <AuthorApplicationForm onSubmit={handleSubmit} isSubmitting={isLoading} />
        </section>
      </RoleGate>
      <ToastNotice open={toastOpen} onClose={() => setToastOpen(false)} message="Application submitted." />
    </AppShell>
  );
}