"use client";

import React, { useState } from "react";
import Link from "next/link";
import AppShell from "@/components/layout/AppShell";
import RoleGate from "@/components/ui/RoleGate";
import EmptyState from "@/components/ui/EmptyState";
import LoadMoreButton from "@/components/ui/LoadMoreButton";
import UserAvatar from "@/components/ui/UserAvatar";
import {
  useGetAdminAuthorApplicationsQuery,
} from "@/redux/apis/pagepalEndpoints";
import { AuthorApplication } from "@/types/pagepal";

export function AdminDeskScreen() {
  const [status, setStatus] = useState<"PENDING" | "APPROVED" | "REJECTED">("PENDING");
  const { data } = useGetAdminAuthorApplicationsQuery({ status });

  const applications: AuthorApplication[] = data?.items ?? [];

  const statusTone = (value: AuthorApplication["status"]) => {
    if (value === "approved") return "bg-[var(--color-success-subtle)] text-[var(--color-success-text)]";
    if (value === "rejected") return "bg-red-100 text-red-700";
    return "bg-amber-100 text-amber-700";
  };

  return (
    <AppShell zone="E" pageTitle="The Desk">
      <RoleGate allow={["ADMIN"]}>
        <section className="space-y-4">
          <header>
            <h1 className="serif-display text-[22px] text-text">The Desk</h1>
            <p className="text-[13px] text-text-muted">Author applications</p>
          </header>

          <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
            {(["PENDING", "APPROVED", "REJECTED"] as const).map((item) => (
              <button key={item} type="button" className={`pill-chip ${item === status ? "chip-active" : ""}`} onClick={() => setStatus(item)}>
                {item.toLowerCase()} ({applications.length})
              </button>
            ))}
          </div>

          {applications.length === 0 ? (
            <EmptyState title="No applications for this status." />
          ) : (
            <div className="space-y-3">
              {applications.map((application) => (
                <Link
                  key={application.id}
                  href={`/admin/applications/${application.id}`}
                  className="block rounded-xl border border-border bg-surface p-4"
                >
                  <div className="flex items-center gap-3">
                    <UserAvatar name={application.userName} size="md" />
                    <div className="min-w-0 flex-1">
                      <p className="text-[14px] font-semibold text-text">{application.userName}</p>
                      <p className="mono-meta">Applied {new Date(application.submittedAt).toLocaleDateString()}</p>
                    </div>
                    <span className={`rounded-full px-2 py-0.5 text-xs ${statusTone(application.status)}`}>
                      {application.status}
                    </span>
                  </div>
                  <p className="mt-2 line-clamp-2 text-[13px] italic text-text-muted">
                    {application.motivation || "No motivation text provided."}
                  </p>
                  <p className="mt-2 text-xs text-primary">Read full application</p>
                </Link>
              ))}
            </div>
          )}

          <LoadMoreButton onClick={() => undefined} label="Load more" isDisabled />
        </section>
      </RoleGate>
    </AppShell>
  );
}