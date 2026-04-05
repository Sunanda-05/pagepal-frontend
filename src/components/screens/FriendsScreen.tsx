"use client";

import React, { useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  IconSearch,
} from "@tabler/icons-react";
import { Input } from "@heroui/input";
import AppShell from "@/components/layout/AppShell";
import EmptyState from "@/components/ui/EmptyState";
import LoadMoreButton from "@/components/ui/LoadMoreButton";
import { FeedItemSkeleton } from "@/components/ui/Skeletons";
import {
  useGetMeQuery,
  useGetFollowSuggestionsQuery,
  useGetUserFollowersQuery,
  useGetUserFollowingQuery,
} from "@/redux/apis/pagepalEndpoints";
import useDebouncedValue from "@/hooks/useDebouncedValue";
import { PagePalUser } from "@/types/pagepal";
import { FollowListItem } from "@/components/shared/FollowUtils";
import UserSearchPicker from "@/components/shared/UserSearchPicker";

export function FriendsScreen() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") === "followers" ? "followers" : "following";
  const [tab, setTab] = useState<"following" | "followers">(initialTab);
  const [searchText, setSearchText] = useState("");
  const debouncedSearch = useDebouncedValue(searchText, 300);
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<PagePalUser[]>([]);
  const [selectedSearchUser, setSelectedSearchUser] = useState<PagePalUser | null>(null);
  const [dismissedSuggestionIds, setDismissedSuggestionIds] = useState<string[]>([]);

  const { data: me } = useGetMeQuery();
  const queryUserId = searchParams.get("userId");
  const targetUserId = queryUserId || me?.id || "";

  const followersQuery = useGetUserFollowersQuery(
    {
      userId: targetUserId,
      page,
      limit: 20,
      search: debouncedSearch,
    },
    {
      skip: !targetUserId || tab !== "followers",
    }
  );

  const followingQuery = useGetUserFollowingQuery(
    {
      userId: targetUserId,
      page,
      limit: 20,
      search: debouncedSearch,
    },
    {
      skip: !targetUserId || tab !== "following",
    }
  );

  const activeResponse = tab === "followers" ? followersQuery.data : followingQuery.data;
  const activeLoading = tab === "followers" ? followersQuery.isLoading : followingQuery.isLoading;
  const activeFetching = tab === "followers" ? followersQuery.isFetching : followingQuery.isFetching;
  const activeError = tab === "followers" ? followersQuery.isError : followingQuery.isError;

  const isOwnList = Boolean(me?.id && targetUserId === me.id);
  const suggestionsQuery = useGetFollowSuggestionsQuery(
    { limit: 8 },
    { skip: !isOwnList }
  );

  const suggestions = React.useMemo(() => {
    const blockedIds = new Set(dismissedSuggestionIds);

    return (suggestionsQuery.data ?? []).filter(
      (user) =>
        user.id !== me?.id &&
        !Boolean(user.isFollowing) &&
        !blockedIds.has(user.id)
    );
  }, [dismissedSuggestionIds, me?.id, suggestionsQuery.data]);

  React.useEffect(() => {
    setPage(1);
    setItems([]);
  }, [tab, targetUserId, debouncedSearch]);

  React.useEffect(() => {
    const incoming = activeResponse?.data ?? [];

    setItems((prev) => {
      if (page === 1) {
        return incoming;
      }

      const merged = [...prev];
      for (const nextUser of incoming) {
        if (!merged.some((existingUser) => existingUser.id === nextUser.id)) {
          merged.push(nextUser);
        }
      }
      return merged;
    });
  }, [activeResponse, page]);

  const handleSuggestionFollowChange = (userId: string, isFollowing: boolean) => {
    if (!isFollowing) {
      return;
    }

    setDismissedSuggestionIds((prev) =>
      prev.includes(userId) ? prev : [...prev, userId]
    );
  };

  const totalPages = activeResponse?.meta?.totalPages ?? 1;
  const canLoadMore = page < totalPages;

  return (
    <AppShell zone="D" pageTitle="Friends">
      <section className="space-y-4">
        <header>
          <h1 className="serif-display text-[18px] text-text">Friends</h1>
          <div className="mt-2 flex gap-2">
            <button type="button" className={`pill-chip ${tab === "following" ? "chip-active" : ""}`} onClick={() => setTab("following")}>
              Following
            </button>
            <button type="button" className={`pill-chip ${tab === "followers" ? "chip-active" : ""}`} onClick={() => setTab("followers")}>
              Followers
            </button>
          </div>
          <div className="mt-3">
            <Input
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              placeholder={`Search ${tab}`}
              startContent={<IconSearch size={16} className="text-text-muted" />}
            />
          </div>
        </header>

        {activeError ? (
          <EmptyState title="Unable to load this list." subtitle="Please try again in a moment." />
        ) : activeLoading && items.length === 0 ? (
          <div className="space-y-2">
            <FeedItemSkeleton />
            <FeedItemSkeleton />
            <FeedItemSkeleton />
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            title={tab === "following" ? "Not following anyone yet." : "No followers yet."}
            subtitle="Follow users from profile pages and they will appear here."
          />
        ) : (
          <section className="space-y-2">
            {items.map((user) => (
              <FollowListItem
                key={`${tab}-${user.id}`}
                user={user}
                canRemoveFollower={tab === "followers" && isOwnList}
              />
            ))}

            {canLoadMore ? (
              <LoadMoreButton
                onClick={() => setPage((currentPage) => currentPage + 1)}
                label="Load more"
                isLoading={activeFetching}
              />
            ) : null}
          </section>
        )}

        {isOwnList ? (
          <section className="space-y-3">
            <section className="space-y-3 rounded-2xl border border-border bg-surface p-3">
              <p className="section-kicker">Find users</p>
              <UserSearchPicker
                selectedUser={selectedSearchUser}
                onSelectUser={setSelectedSearchUser}
                placeholder="Search by name, username, or email"
                excludedUserIds={me?.id ? [me.id] : []}
              />

              {selectedSearchUser ? (
                <FollowListItem key={`search-${selectedSearchUser.id}`} user={selectedSearchUser} />
              ) : null}
            </section>

            <section className="space-y-2">
              <p className="section-kicker">Suggested for you</p>

              {suggestionsQuery.isLoading ? (
                <div className="space-y-2">
                  <FeedItemSkeleton />
                  <FeedItemSkeleton />
                </div>
              ) : suggestions.length === 0 ? (
                <p className="text-xs text-text-muted">No suggestions right now. Check back later.</p>
              ) : (
                <div className="space-y-2">
                  {suggestions.map((user) => (
                    <FollowListItem
                      key={`suggestion-${user.id}`}
                      user={user}
                      onFollowChange={(isFollowing) =>
                        handleSuggestionFollowChange(user.id, isFollowing)
                      }
                    />
                  ))}
                </div>
              )}
            </section>
          </section>
        ) : null}
      </section>
    </AppShell>
  );
}
