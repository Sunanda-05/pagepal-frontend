"use client";

import React from "react";
import Link from "next/link";
import AppShell from "@/features/pagepal/layout/AppShell";
import BookCard from "@/components/ui/BookCard";
import EmptyState from "@/components/ui/EmptyState";
import TagChip from "@/components/ui/TagChip";
import UserAvatar from "@/components/ui/UserAvatar";
import {
    useGetFilteredBooksQuery,
  useGetUserByIdQuery,
} from "@/redux/apis/pagepalEndpoints";
import { FollowButton } from "@/components/shared/FollowUtils";

export function AuthorProfileScreen({ authorId }: { authorId: string }) {
  const { data: author } = useGetUserByIdQuery(authorId);
  const { data: booksData } = useGetFilteredBooksQuery(
    {
      page: 1,
      limit: 12,
      authorName: author?.displayName,
    },
    { skip: !author?.displayName }
  );

  const books = booksData?.items ?? [];

  if (!author) {
    return (
      <AppShell zone="C" pageTitle="Author Profile">
        <EmptyState title="Author profile unavailable." />
      </AppShell>
    );
  }

  return (
    <AppShell zone="C" pageTitle="Author Profile">
      <section className="space-y-5">
        <header className="rounded-2xl border border-border bg-surface p-4">
          <div className="flex items-center gap-4">
            <UserAvatar name={author.displayName} size="xl" showReadingRing={Boolean(author.currentlyReadingBookId)} />
            <div>
              <h1 className="serif-display text-[22px] text-text">{author.displayName}</h1>
              <TagChip label="Author" zoneStyle="catalog" />
              <p className="mt-2 text-sm text-text-muted">{author.bio || "No bio available."}</p>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="serif-display text-[18px] text-text">{books.length}</p>
              <p className="text-[10px] uppercase tracking-[0.08em] text-text-muted">Published</p>
            </div>
            <div>
              <p className="serif-display text-[18px] text-text">{author.followersCount}</p>
              <p className="text-[10px] uppercase tracking-[0.08em] text-text-muted">Followers</p>
            </div>
            <div>
              <p className="serif-display text-[18px] text-text">{books.reduce((sum, book) => sum + book.reviewCount, 0)}</p>
              <p className="text-[10px] uppercase tracking-[0.08em] text-text-muted">Ratings</p>
            </div>
          </div>
          <div className="mt-3">
            <FollowButton userId={author.id} type="author" isFollowing={Boolean(author.isFollowing)} />
          </div>
        </header>

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="serif-display text-[18px] text-text">Books by {author.displayName}</h2>
            <Link href={`/discover?author=${encodeURIComponent(author.displayName)}`} className="text-sm text-primary">
              See all
            </Link>
          </div>
          <div className="shelf-scroll -mx-1 flex gap-3 overflow-x-auto px-1 pb-2">
            {books.map((book) => (
              <div key={book.id} className="w-[130px] shrink-0">
                <BookCard book={book} size="compact" />
              </div>
            ))}
          </div>
        </section>
      </section>
    </AppShell>
  );
}