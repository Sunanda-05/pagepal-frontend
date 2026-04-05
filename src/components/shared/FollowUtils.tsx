"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@heroui/button";
import UserAvatar from "@/components/ui/UserAvatar";
import {
  useFollowUserMutation,
  useRemoveFollowerMutation,
  useUnfollowUserMutation,
} from "@/redux/apis/pagepalEndpoints";
import { PagePalUser } from "@/types/pagepal";

export function FollowListItem({ user, canRemoveFollower = false }: { user: PagePalUser; canRemoveFollower?: boolean }) {
  const [removeFollower, { isLoading: removingFollower }] = useRemoveFollowerMutation();

  const handleRemoveFollower = async () => {
    try {
      await removeFollower({ followerId: user.id }).unwrap();
    } catch {
      // Error handling is surfaced by existing app-level toasts/logging.
    }
  };

  return (
    <article className="rounded-2xl border border-border bg-surface p-3">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 flex items-center gap-3">
          <UserAvatar name={user.displayName} size="md" />
          <div className="min-w-0">
            <Link href={`/profile/${user.id}`} className="serif-display line-clamp-1 text-[15px] text-text hover:text-primary">
              {user.displayName}
            </Link>
            <p className="line-clamp-1 text-xs text-text-muted">@{user.username}</p>
            {user.followsYou ? <p className="mt-1 text-[11px] text-primary">Follows you</p> : null}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <FollowButton userId={user.id} isFollowing={Boolean(user.isFollowing)} type="user" />
          {canRemoveFollower ? (
            <Button
              size="sm"
              variant="bordered"
              className="border-border"
              isLoading={removingFollower}
              onPress={handleRemoveFollower}
            >
              Remove
            </Button>
          ) : null}
        </div>
      </div>
    </article>
  );
}

export function FollowButton({ userId, isFollowing = false, type = "user" }: { userId: string; isFollowing?: boolean; type?: "user" | "author" }) {
  const [followUser, { isLoading: followLoading }] = useFollowUserMutation();
  const [unfollowUser, { isLoading: unfollowLoading }] = useUnfollowUserMutation();
  const [optimisticFollowing, setOptimisticFollowing] = useState(isFollowing);

  const loading = followLoading || unfollowLoading;

  const handleToggle = async () => {
    const next = !optimisticFollowing;
    setOptimisticFollowing(next);

    try {
      if (next) {
        await followUser({ userId, type }).unwrap();
      } else {
        await unfollowUser({ userId, type }).unwrap();
      }
    } catch {
      setOptimisticFollowing(!next);
    }
  };

  return (
    <Button size="sm" color={optimisticFollowing ? "default" : "primary"} onPress={handleToggle} isLoading={loading}>
      {optimisticFollowing ? "Following" : "Follow"}
    </Button>
  );
}
