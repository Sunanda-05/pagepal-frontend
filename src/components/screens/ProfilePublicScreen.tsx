"use client";

import React, {  } from "react";
import Link from "next/link";
import AppShell from "@/components/layout/AppShell";
import EmptyState from "@/components/ui/EmptyState";
import TagChip from "@/components/ui/TagChip";
import UserAvatar from "@/components/ui/UserAvatar";
import {
  useGetUserByIdQuery,
} from "@/redux/apis/pagepalEndpoints";
import { FollowButton } from "@/components/shared/FollowUtils";

export function ProfilePublicScreen({ userId }: { userId: string }) {
  const { data: user } = useGetUserByIdQuery(userId);

  if (!user) {
    return (
      <AppShell zone="D" pageTitle="Profile">
        <EmptyState title="User not found." />
      </AppShell>
    );
  }

  return (
    <AppShell zone="D" pageTitle="Profile">
      <section className="space-y-5">
        <header className="relative rounded-2xl border border-border bg-surface p-4 text-center">
          <div className="absolute right-3 top-3">
            <FollowButton userId={user.id} isFollowing={Boolean(user.isFollowing)} />
          </div>
          <div className="mx-auto w-fit">
            <UserAvatar name={user.displayName} size="xl" showReadingRing={Boolean(user.currentlyReadingBookId)} />
          </div>
          <h1 className="serif-display mt-3 text-[20px] text-text">{user.displayName}</h1>
          {user.role === "AUTHOR" ? (
            <div className="mt-2">
              <TagChip label="Author" zoneStyle="catalog" />
            </div>
          ) : null}
          <p className="mt-2 text-[13px] text-text-muted">{user.bio || "No bio available."}</p>

          <div className="mt-4 grid grid-cols-4 gap-2">
            <div>
              <p className="serif-display text-[18px] text-text">{user.booksRead}</p>
              <p className="text-[10px] uppercase tracking-[0.08em] text-text-muted">Books</p>
            </div>
            <div>
              <p className="serif-display text-[18px] text-text">{user.reviewsWritten}</p>
              <p className="text-[10px] uppercase tracking-[0.08em] text-text-muted">Reviews</p>
            </div>
            <div>
              <Link href={`/friends?tab=following&userId=${user.id}`} className="block">
                <p className="serif-display text-[18px] text-text">{user.followingCount}</p>
                <p className="text-[10px] uppercase tracking-[0.08em] text-text-muted">Following</p>
              </Link>
            </div>
            <div>
              <Link href={`/friends?tab=followers&userId=${user.id}`} className="block">
                <p className="serif-display text-[18px] text-text">{user.followersCount}</p>
                <p className="text-[10px] uppercase tracking-[0.08em] text-text-muted">Followers</p>
              </Link>
            </div>
          </div>
        </header>

        <EmptyState title="Public shelves are not exposed by backend yet." subtitle="Shared books and collections will appear here." />
      </section>
    </AppShell>
  );
}
