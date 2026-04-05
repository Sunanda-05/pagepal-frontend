"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  IconPlus,
  IconShare3,
} from "@tabler/icons-react";
import { Button } from "@heroui/button";
import AppShell from "@/features/pagepal/layout/AppShell";
import BookCover from "@/components/ui/BookCover";
import EmptyState from "@/components/ui/EmptyState";
import LoadMoreButton from "@/components/ui/LoadMoreButton";
import TagChip from "@/components/ui/TagChip";
import ToastNotice from "@/components/ui/ToastNotice";
import UserAvatar from "@/components/ui/UserAvatar";
import BottomSheet from "@/components/ui/BottomSheet";
import ReadingStatusChip from "@/components/ui/ReadingStatusChip";
import {
  useAddBookToCollectionMutation,
  useDeleteCollectionMutation,
  useGetCollectionByIdQuery,
  useGetMeQuery,
  useGetRecommendationsQuery,
  useRemoveBookFromCollectionMutation,
  useShareCollectionMutation,
} from "@/redux/apis/pagepalEndpoints";
import { ReadingStatus } from "@/types/pagepal";
import { isShelfCollectionName } from "@/utils/bookUtil";

export function CollectionDetailScreen({ collectionId }: { collectionId: string }) {
  const [shareSheetOpen, setShareSheetOpen] = useState(false);
  const [addSheetOpen, setAddSheetOpen] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);
  const [showAllBooks, setShowAllBooks] = useState(false);
  const [shareUserId, setShareUserId] = useState("");

  const { data: collection } = useGetCollectionByIdQuery(collectionId);
  const { data: me } = useGetMeQuery();
  const { data: recommendations } = useGetRecommendationsQuery();

  const [removeBook, { isLoading: removing }] = useRemoveBookFromCollectionMutation();
  const [addBook, { isLoading: adding }] = useAddBookToCollectionMutation();
  const [shareCollection, { isLoading: sharing }] = useShareCollectionMutation();
  const [deleteCollection, { isLoading: deleting }] = useDeleteCollectionMutation();

  const candidateBooks = recommendations?.items ?? [];
  const isOwner = me?.id === collection?.ownerId;
  const bookLookup = new Map(candidateBooks.map((book) => [book.id, book]));

  const handleStatusChange = async (bookId: string, status: ReadingStatus) => {
    await addBook({ collectionId, bookId, readingStatus: status }).unwrap();
    setToastOpen(true);
  };

  const handleRemoveBook = async (bookId: string) => {
    await removeBook({ collectionId, bookId }).unwrap();
    setToastOpen(true);
  };

  const handleAddBook = async (bookId: string) => {
    await addBook({ collectionId, bookId, readingStatus: "want_to_read" }).unwrap();
    setAddSheetOpen(false);
    setToastOpen(true);
  };

  const handleShare = async () => {
    if (!shareUserId.trim()) return;
    await shareCollection({ collectionId, userId: shareUserId.trim() }).unwrap();
    setShareUserId("");
    setShareSheetOpen(false);
    setToastOpen(true);
  };

  const handleDeleteCollection = async () => {
    await deleteCollection({ id: collectionId }).unwrap();
    setToastOpen(true);
  };

  if (!collection) {
    return (
      <AppShell zone="D" pageTitle="Collection">
        <EmptyState title="Collection not found." />
      </AppShell>
    );
  }

  const isShelfCollection = isShelfCollectionName(collection.name);
  const hasMoreBooks = collection.books.length > 8;
  const visibleBooks = showAllBooks ? collection.books : collection.books.slice(0, 8);

  return (
    <AppShell zone="D" pageTitle="Collection" actionSlot={<IconShare3 size={18} className="text-text-muted" />}>
      <section className="space-y-5">
        <header className="space-y-3 rounded-2xl border border-border bg-surface p-4">
          <div className="grid w-[140px] grid-cols-2 gap-1 overflow-hidden rounded-2xl border border-border p-2">
            {collection.books.slice(0, 4).map((entry) => {
              const matchedBook = bookLookup.get(entry.bookId);
              return (
                <BookCover
                  key={`mosaic-${entry.bookId}`}
                  title={matchedBook?.title ?? entry.bookId}
                  seed={entry.bookId}
                  size="xs"
                  hideTitle
                  className="h-full w-full"
                />
              );
            })}
            {Array.from({ length: Math.max(0, 4 - collection.books.length) }).map((_, index) => (
              <div key={`empty-${index}`} className="aspect-[40/55] rounded-md border border-dashed border-border bg-primary/10" />
            ))}
            {collection.books.length === 0 ? (
              <div className="col-span-2 flex aspect-square items-center justify-center rounded-md border border-dashed border-border">
                <div className="empty-shape scale-75" />
              </div>
            ) : null}
          </div>

          <h1 className="serif-display text-[22px] text-text">{collection.name}</h1>
          <div className="flex items-center gap-2 text-[13px] text-text-muted">
            <UserAvatar name={collection.ownerName} size="xs" />
            <span>by {collection.ownerName}</span>
          </div>
          <p className="text-[13px] text-text-muted">{collection.description || "No description."}</p>

          <div className="flex items-center gap-2 text-xs">
            <span className="mono-meta">{collection.books.length} books</span>
            <TagChip label={collection.visibility === "public" ? "Public" : collection.visibility === "shared" ? "Shared" : "Private"} zoneStyle="pill" />
          </div>

          {isOwner && !isShelfCollection ? (
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="bordered" onPress={() => setShareSheetOpen(true)}>
                Share
              </Button>
              <Button as={Link} href={`/collections/${collection.id}/edit`} size="sm" variant="bordered">
                Edit
              </Button>
              <Button size="sm" variant="light" color="danger" onPress={handleDeleteCollection} isLoading={deleting}>
                Delete
              </Button>
            </div>
          ) : null}

          {isOwner && isShelfCollection ? (
            <p className="text-xs text-text-muted">Shelf is a system collection and cannot be renamed.</p>
          ) : null}
        </header>

        {collection.books.length === 0 ? (
          <EmptyState title="No books in this collection yet." subtitle="Add a book to begin curating this list." />
        ) : (
          <section className="space-y-0">
            {visibleBooks.map((entry: { bookId: string; readingStatus: ReadingStatus }) => (
              <article key={entry.bookId} className="flex min-h-16 items-center gap-3 border-b border-divider py-3">
                <BookCover title={bookLookup.get(entry.bookId)?.title ?? entry.bookId} seed={entry.bookId} size="xs" hideTitle />
                <div className="min-w-0 flex-1">
                  <p className="serif-display truncate text-[14px] text-text">{bookLookup.get(entry.bookId)?.title ?? `Book ${entry.bookId}`}</p>
                  <p className="truncate text-[12px] text-text-muted">{bookLookup.get(entry.bookId)?.authorName ?? "Unknown author"}</p>
                </div>
                <ReadingStatusChip value={entry.readingStatus} onChange={(next) => handleStatusChange(entry.bookId, next)} />
                {isOwner ? (
                  <Button size="sm" variant="light" color="danger" isLoading={removing} onPress={() => handleRemoveBook(entry.bookId)}>
                    x
                  </Button>
                ) : null}
              </article>
            ))}

            {hasMoreBooks ? (
              <div className="pt-3">
                <LoadMoreButton
                  onClick={() => setShowAllBooks((prev) => !prev)}
                  label={showAllBooks ? "Show fewer" : `Show all books (${collection.books.length})`}
                />
              </div>
            ) : null}

            {isOwner ? (
              <button
                type="button"
                className="mt-3 flex h-12 w-full items-center justify-center rounded-xl border border-dashed border-border text-sm text-text-muted"
                onClick={() => setAddSheetOpen(true)}
              >
                <IconPlus size={16} className="mr-2" />
                Add a book
              </button>
            ) : null}
          </section>
        )}
      </section>

      <BottomSheet isOpen={addSheetOpen} onOpenChange={setAddSheetOpen} title="Add book">
        {candidateBooks.length === 0 ? (
          <EmptyState title="No candidate books available." />
        ) : (
          <div className="space-y-2">
            {candidateBooks.slice(0, 8).map((book) => (
              <button
                key={book.id}
                type="button"
                className="w-full rounded-lg border border-border px-3 py-2 text-left text-sm text-text"
                onClick={() => handleAddBook(book.id)}
                disabled={adding}
              >
                {book.title}
              </button>
            ))}
          </div>
        )}
      </BottomSheet>

      <BottomSheet isOpen={shareSheetOpen} onOpenChange={setShareSheetOpen} title="Share collection">
        <input
          value={shareUserId}
          onChange={(event) => setShareUserId(event.target.value)}
          className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text outline-none"
          placeholder="Enter user id"
        />
        <Button className="mt-3" color="primary" onPress={handleShare} isLoading={sharing}>
          Share now
        </Button>
      </BottomSheet>

      <ToastNotice open={toastOpen} onClose={() => setToastOpen(false)} message="Collection updated." />
    </AppShell>
  );
}