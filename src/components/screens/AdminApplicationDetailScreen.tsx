"use client";

import React, { useState } from "react";
import { Button } from "@heroui/button";
import AppShell from "@/components/layout/AppShell";
import RoleGate from "@/components/ui/RoleGate";
import EmptyState from "@/components/ui/EmptyState";
import ToastNotice from "@/components/ui/ToastNotice";
import UserAvatar from "@/components/ui/UserAvatar";
import BottomSheet from "@/components/ui/BottomSheet";
import {
  useGetAdminAuthorApplicationsQuery,
  useReviewAuthorApplicationMutation,
} from "@/redux/apis/pagepalEndpoints";
import RejectApplicationInlineForm from "@/components/forms/RejectApplicationInlineForm";
import { AuthorApplication } from "@/types/pagepal";

export function AdminApplicationDetailScreen({ applicationId }: { applicationId: string }) {
  const [approveSheetOpen, setApproveSheetOpen] = useState(false);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);
  const [reviewApplication, { isLoading }] = useReviewAuthorApplicationMutation();

  const { data } = useGetAdminAuthorApplicationsQuery({ status: undefined });
  const allApplications: AuthorApplication[] = data?.items ?? [];
  const application = allApplications.find((entry) => entry.id === applicationId);

  const handleApprove = async () => {
    if (!application) return;
    await reviewApplication({ id: application.id, status: "APPROVED" }).unwrap();
    setApproveSheetOpen(false);
    setToastOpen(true);
  };

  const handleReject = async (values: { reason: string }) => {
    if (!application) return;
    await reviewApplication({ id: application.id, status: "REJECTED", reason: values.reason }).unwrap();
    setShowRejectForm(false);
    setToastOpen(true);
  };

  return (
    <AppShell zone="E" pageTitle="Application Detail">
      <RoleGate allow={["ADMIN"]}>
        {!application ? (
          <EmptyState title="Application not found." />
        ) : (
          <section className="space-y-5 rounded-xl border border-border bg-surface p-4">
            <header className="flex items-center gap-4">
              <UserAvatar name={application.userName} size="xl" />
              <div>
                <h1 className="serif-display text-[22px] text-text">{application.userName}</h1>
                <p className="mono-meta">Applied {new Date(application.submittedAt).toLocaleDateString()}</p>
                <span className="catalog-chip mt-2 inline-flex">{application.status}</span>
              </div>
            </header>

            <section className="space-y-2">
              <p className="section-kicker">Their motivation</p>
              <div className="border-l-2 border-border pl-4">
                <p className="text-[14px] leading-7 text-text-muted">{application.motivation || "No additional information provided."}</p>
              </div>
            </section>

            {application.status === "pending" ? (
              <section className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  <Button color="success" onPress={() => setApproveSheetOpen(true)} isLoading={isLoading}>
                    Approve
                  </Button>
                  <Button variant="bordered" onPress={() => setShowRejectForm((prev) => !prev)}>
                    Reject
                  </Button>
                </div>

                {showRejectForm ? <RejectApplicationInlineForm onSubmit={handleReject} isSubmitting={isLoading} /> : null}
              </section>
            ) : (
              <section className="border-t border-divider pt-3">
                <p className="mono-meta">Reviewed on {new Date(application.reviewedAt ?? application.submittedAt).toLocaleDateString()}</p>
                {application.reason ? (
                  <div className="mt-2 border-l-2 border-border pl-4 text-sm text-text-muted">
                    {application.reason}
                  </div>
                ) : null}
              </section>
            )}
          </section>
        )}
      </RoleGate>

      <BottomSheet isOpen={approveSheetOpen} onOpenChange={setApproveSheetOpen} title="Approve this application?">
        <p className="text-sm text-text-muted">They will gain author access immediately after approval.</p>
        <div className="mt-3 flex gap-2">
          <Button color="success" onPress={handleApprove} isLoading={isLoading}>
            Approve
          </Button>
          <Button variant="light" onPress={() => setApproveSheetOpen(false)}>
            Cancel
          </Button>
        </div>
      </BottomSheet>

      <ToastNotice open={toastOpen} onClose={() => setToastOpen(false)} message="Application updated." />
    </AppShell>
  );
}