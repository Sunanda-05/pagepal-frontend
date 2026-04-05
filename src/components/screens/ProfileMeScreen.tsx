"use client";

import React, {  } from "react";
import Link from "next/link";
import {
  IconSettings,
} from "@tabler/icons-react";
import { Tab, Tabs } from "@heroui/tabs";
import AppShell from "@/components/layout/AppShell";
import BookCover from "@/components/ui/BookCover";
import CollectionCard from "@/components/ui/CollectionCard";
import EmptyState from "@/components/ui/EmptyState";
import ShelfStrip from "@/components/ui/ShelfStrip";
import UserAvatar from "@/components/ui/UserAvatar";
import ProgressBar from "@/components/ui/ProgressBar";
import {
  useGetMeQuery,
  useGetMyCollectionsQuery,
  useGetRecommendationsQuery,
} from "@/redux/apis/pagepalEndpoints";

export function ProfileMeScreen() {
  const { data: me } = useGetMeQuery();
  const { data: recommendations } = useGetRecommendationsQuery();
  const { data: myCollectionsData } = useGetMyCollectionsQuery();

  const books = recommendations?.items ?? [];
  const collections = myCollectionsData?.items ?? [];
  const currentBook = books.find((book) => book.id === me?.currentlyReadingBookId) ?? books[0];

  if (!me) {
    return (
      <AppShell zone="D" pageTitle="My Profile">
        <EmptyState title="Profile not available." subtitle="Sign in to view profile details." />
      </AppShell>
    );
  }

  return (
    <AppShell zone="D" pageTitle="My Profile" actionSlot={<Link href="/profile/me/edit"><IconSettings size={18} className="text-text-muted" /></Link>}>
      <section className="space-y-5">
        <header className="relative rounded-2xl border border-border bg-surface p-4 text-center">
          <Link href="/profile/me/edit" className="absolute right-3 top-3 rounded-full border border-border px-3 py-1 text-xs text-text-muted">
            Edit profile
          </Link>
          <div className="mx-auto w-fit">
            <UserAvatar name={me.displayName} size="xl" showReadingRing={Boolean(currentBook)} />
          </div>
          <h1 className="serif-display mt-3 text-[20px] text-text">{me.displayName}</h1>
          <p className="mt-1 line-clamp-2 text-[13px] text-text-muted">{me.bio || "No bio added yet."}</p>

          <div className="mt-4 grid grid-cols-4 gap-2">
            <div>
              <p className="serif-display text-[18px] text-text">{me.booksRead}</p>
              <p className="text-[10px] uppercase tracking-[0.08em] text-text-muted">Books read</p>
            </div>
            <div>
              <p className="serif-display text-[18px] text-text">{me.reviewsWritten}</p>
              <p className="text-[10px] uppercase tracking-[0.08em] text-text-muted">Reviews</p>
            </div>
            <div>
              <Link href={`/friends?tab=following&userId=${me.id}`} className="block">
                <p className="serif-display text-[18px] text-text">{me.followingCount}</p>
                <p className="text-[10px] uppercase tracking-[0.08em] text-text-muted">Following</p>
              </Link>
            </div>
            <div>
              <Link href={`/friends?tab=followers&userId=${me.id}`} className="block">
                <p className="serif-display text-[18px] text-text">{me.followersCount}</p>
                <p className="text-[10px] uppercase tracking-[0.08em] text-text-muted">Followers</p>
              </Link>
            </div>
          </div>
        </header>

        <article className="rounded-2xl border border-border p-4" style={{ backgroundColor: "#f6ede3" }}>
          <p className="section-kicker text-accent">Currently reading</p>
          {currentBook ? (
            <div className="mt-3 flex items-start gap-3">
              <BookCover title={currentBook.title} seed={currentBook.id} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="serif-display line-clamp-2 text-[15px] text-text">{currentBook.title}</p>
                <p className="text-xs text-text-muted">{currentBook.authorName}</p>
                <ProgressBar value={67} className="mt-3" />
                <p className="mono-meta mt-1">67% · Chapter 18 of 27</p>
              </div>
            </div>
          ) : (
            <EmptyState title="Set a current read" subtitle="Pick a book to track progress." />
          )}
        </article>

        <Tabs aria-label="Profile content" variant="underlined" color="primary">
          <Tab key="shelf" title="Shelf">
            <div className="pt-3">
              {books.length > 0 ? (
                <ShelfStrip books={books.slice(0, 12)} currentBookId={me.currentlyReadingBookId} />
              ) : (
                <EmptyState title="No shelf books yet." />
              )}
            </div>
          </Tab>
          <Tab key="reviews" title="Reviews">
            <div className="space-y-3 pt-3">
              <EmptyState title="No review feed endpoint available for profile yet." />
            </div>
          </Tab>
          <Tab key="collections" title="Collections">
            <div className="pt-3">
              {collections.length === 0 ? (
                <EmptyState title="No collections yet." />
              ) : (
                <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                  {collections.map((collection) => (
                    <CollectionCard key={collection.id} collection={collection} />
                  ))}
                </div>
              )}
            </div>
          </Tab>
        </Tabs>
      </section>
    </AppShell>
  );
}