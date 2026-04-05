"use client";

import React, {  } from "react";
import Link from "next/link";
import {
  IconCircleCheck,
  IconCircleX,
  IconHourglass,
} from "@tabler/icons-react";
import { Button } from "@heroui/button";
import AppShell from "@/features/pagepal/layout/AppShell";
import EmptyState from "@/components/ui/EmptyState";
import {
  useGetAuthorApplicationQuery,
} from "@/redux/apis/pagepalEndpoints";

export function AuthorApplyStatusScreen() {
  const { data } = useGetAuthorApplicationQuery();
  const application = data?.[0];

  if (!application) {
    return (
      <AppShell zone="D" pageTitle="Application Status">
        <EmptyState title="No application found." subtitle="Submit an author application to see status." />
      </AppShell>
    );
  }

  return (
    <AppShell zone="D" pageTitle="Application Status">
      <section className="mx-auto w-full max-w-[360px] rounded-2xl border border-border bg-surface p-5 text-center">
        {application.status === "pending" ? <IconHourglass size={32} className="mx-auto text-text-muted" /> : null}
        {application.status === "approved" ? <IconCircleCheck size={32} className="mx-auto text-success" /> : null}
        {application.status === "rejected" ? <IconCircleX size={32} className="mx-auto text-error" /> : null}

        <h1 className="serif-display mt-3 text-[18px] text-text">
          {application.status === "pending"
            ? "Application under review"
            : application.status === "approved"
            ? "You're an author!"
            : "Application not approved"}
        </h1>

        <p className="mt-2 text-[13px] text-text-muted">
          {application.status === "pending"
            ? "We'll notify you once it's been reviewed."
            : application.status === "approved"
            ? "Start adding your books."
            : "You can apply again after updating your motivation."}
        </p>

        <p className="mono-meta mt-3">Submitted {new Date(application.submittedAt).toLocaleDateString()}</p>

        {application.status === "rejected" && application.reason ? (
          <div className="mt-3 border-l-2 border-border bg-surface-secondary p-3 text-left text-sm text-text-muted">
            {application.reason}
          </div>
        ) : null}

        {application.status === "approved" ? (
          <Button as={Link} href="/author/manage" className="mt-4" color="primary" radius="full">
            Go to My Books
          </Button>
        ) : null}

        {application.status === "rejected" ? (
          <Link href="/author/apply" className="mt-4 block text-sm text-primary">
            Apply again
          </Link>
        ) : null}
      </section>
    </AppShell>
  );
}