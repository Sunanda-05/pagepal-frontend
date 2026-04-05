"use client";

import React, { useState } from "react";
import Link from "next/link";
import { IconPlus, IconShare3 } from "@tabler/icons-react";
import { Button } from "@heroui/button";
import AppShell from "@/components/layout/AppShell";
import BookCover from "@/components/ui/BookCover";
import EmptyState from "@/components/ui/EmptyState";
import LoadMoreButton from "@/components/ui/LoadMoreButton";
import TagChip from "@/components/ui/TagChip";
import ToastNotice from "@/components/ui/ToastNotice";
import UserAvatar from "@/components/ui/UserAvatar";
import BottomSheet from "@/components/ui/BottomSheet";
import ReadingStatusChip from "@/components/ui/ReadingStatusChip";
import UserSearchPicker from "@/components/shared/UserSearchPicker";
import {
  useAddBookToCollectionMutation,
  useDeleteCollectionMutation,
  useGetCollectionByIdQuery,
  useGetMeQuery,
  useGetRecommendationsQuery,
  useRemoveBookFromCollectionMutation,
  useShareCollectionMutation,
} from "@/redux/apis/pagepalEndpoints";
import { PagePalUser, ReadingStatus } from "@/types/pagepal";
import { isShelfCollectionName } from "@/utils/bookUtil";

export function CollectionDetailScreen({
  collectionId,
}: {
  collectionId: string;
}) {
  const [shareSheetOpen, setShareSheetOpen] = useState(false);
  const [addSheetOpen, setAddSheetOpen] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("Collection updated.");
  const [showAllBooks, setShowAllBooks] = useState(false);
  const [selectedShareUser, setSelectedShareUser] =
    useState<PagePalUser | null>(null);

  const { data: collection } = useGetCollectionByIdQuery(collectionId);
  const { data: me } = useGetMeQuery();
  const { data: recommendations } = useGetRecommendationsQuery();

  const [removeBook, { isLoading: removing }] =
    useRemoveBookFromCollectionMutation();
  const [addBook, { isLoading: adding }] = useAddBookToCollectionMutation();
  const [shareCollection, { isLoading: sharing }] =
    useShareCollectionMutation();
  const [deleteCollection, { isLoading: deleting }] =
    useDeleteCollectionMutation();

  const candidateBooks = recommendations?.items ?? [];
  const isOwner = me?.id === collection?.ownerId;
  const bookLookup = new Map(candidateBooks.map((book) => [book.id, book]));

  const handleStatusChange = async (bookId: string, status: ReadingStatus) => {
    await addBook({ collectionId, bookId, readingStatus: status }).unwrap();
    setToastMessage("Reading status updated.");
    setToastOpen(true);
  };

  const handleRemoveBook = async (bookId: string) => {
    await removeBook({ collectionId, bookId }).unwrap();
    setToastMessage("Book removed from collection.");
    setToastOpen(true);
  };

  const handleAddBook = async (bookId: string) => {
    await addBook({
      collectionId,
      bookId,
      readingStatus: "want_to_read",
    }).unwrap();
    setAddSheetOpen(false);
    setToastMessage("Book added to collection.");
    setToastOpen(true);
  };

  const handleShare = async () => {
    if (!selectedShareUser?.id) return;

    await shareCollection({
      collectionId,
      userId: selectedShareUser.id,
    }).unwrap();
    setToastMessage(`Collection shared with ${selectedShareUser.displayName}.`);
    setSelectedShareUser(null);
    setShareSheetOpen(false);
    setToastOpen(true);
  };

  const handleDeleteCollection = async () => {
    await deleteCollection({ id: collectionId }).unwrap();
    setToastMessage("Collection deleted.");
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
  const visibleBooks = showAllBooks
    ? collection.books
    : collection.books.slice(0, 8);
  const hasHeaderActions = isOwner;
  const headerGridClass = hasHeaderActions
    ? "md:grid md:grid-cols-[140px_minmax(0,1fr)_minmax(160px,auto)] md:items-stretch md:gap-4"
    : "md:grid md:grid-cols-[140px_minmax(0,1fr)] md:items-stretch md:gap-4";

  return (
    <AppShell
      zone="D"
      pageTitle="Collection"
      actionSlot={<IconShare3 size={18} className="text-text-muted" />}
    >
      <section className="space-y-5">
        <header className="rounded-2xl border border-border bg-surface p-4">
          <div className={headerGridClass}>
            <div className="mx-auto grid w-[140px] grid-cols-2 gap-1 overflow-hidden rounded-2xl border border-border p-2 md:mx-0">
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
              {Array.from({
                length: Math.max(0, 4 - collection.books.length),
              }).map((_, index) => (
                <div
                  key={`empty-${index}`}
                  className="aspect-[40/55] rounded-md border border-dashed border-border bg-primary/10"
                />
              ))}
              {collection.books.length === 0 ? (
                <div className="col-span-2 flex aspect-square items-center justify-center rounded-md border border-dashed border-border">
                  <div className="empty-shape " />
                </div>
              ) : null}
            </div>

            <div className="space-y-2 text-center md:text-left">
              <h1 className="serif-display text-[22px] text-text md:text-[24px]">
                {collection.name}
              </h1>
              <div className="flex flex-col items-center gap-2 md:flex-row md:items-center md:gap-3">
                <div className="flex items-center gap-2 text-[13px] text-text-muted">
                  <UserAvatar name={collection.ownerName} size="xs" />
                  <span>by {collection.ownerName}</span>
                </div>
                <TagChip
                  label={
                    collection.visibility === "public"
                      ? "Public"
                      : collection.visibility === "shared"
                        ? "Shared"
                        : "Private"
                  }
                  zoneStyle="pill"
                />
              </div>

              <p className="text-[13px] text-text-muted">
                {collection.description || "No description."}
              </p>

              <div className="flex items-center justify-center gap-2 text-xs md:justify-start">
                <span className="mono-meta">
                  {collection.books.length} books
                </span>
              </div>
            </div>

            {isOwner && !isShelfCollection ? (
              <div className="grid grid-cols-1 gap-2 md:flex md:h-full md:min-w-[160px] md:flex-col md:justify-between md:gap-3">
                <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="bordered"
                  onPress={() => setShareSheetOpen(true)}
                  className="w-full"
                >
                  Share
                </Button>
                <Button
                  as={Link}
                  href={`/collections/${collection.id}/edit`}
                  size="sm"
                  variant="bordered"
                  className="w-full"
                >
                  Edit
                </Button>

                </div>
                <Button
                  size="sm"
                  variant="light"
                  color="danger"
                  onPress={handleDeleteCollection}
                  isLoading={deleting}
                  className="w-full"
                >
                  Delete
                </Button>
              </div>
            ) : null}

            {isOwner && isShelfCollection ? (
              <div className="flex items-center justify-center md:items-start md:justify-end">
                <p className="max-w-[220px] text-center text-xs text-text-muted md:text-right">
                  Shelf is a system collection and cannot be renamed.
                </p>
              </div>
            ) : null}
          </div>
        </header>

        {collection.books.length === 0 ? (
          <EmptyState
            title="No books in this collection yet."
            subtitle="Add a book to begin curating this list."
          />
        ) : (
          <section className="space-y-0">
            {visibleBooks.map(
              (entry: { bookId: string; readingStatus: ReadingStatus }) => (
                <article
                  key={entry.bookId}
                  className="flex min-h-16 items-center gap-3 border-b border-divider py-3"
                >
                  <BookCover
                    title={bookLookup.get(entry.bookId)?.title ?? entry.bookId}
                    seed={entry.bookId}
                    size="xs"
                    hideTitle
                  />
                  <div className="min-w-0 flex-1">
                    <p className="serif-display truncate text-[14px] text-text">
                      {bookLookup.get(entry.bookId)?.title ??
                        `Book ${entry.bookId}`}
                    </p>
                    <p className="truncate text-[12px] text-text-muted">
                      {bookLookup.get(entry.bookId)?.authorName ??
                        "Unknown author"}
                    </p>
                  </div>
                  <ReadingStatusChip
                    value={entry.readingStatus}
                    onChange={(next) => handleStatusChange(entry.bookId, next)}
                  />
                  {isOwner ? (
                    <Button
                      size="sm"
                      variant="light"
                      color="danger"
                      isLoading={removing}
                      onPress={() => handleRemoveBook(entry.bookId)}
                    >
                      x
                    </Button>
                  ) : null}
                </article>
              ),
            )}

            {hasMoreBooks ? (
              <div className="pt-3">
                <LoadMoreButton
                  onClick={() => setShowAllBooks((prev) => !prev)}
                  label={
                    showAllBooks
                      ? "Show fewer"
                      : `Show all books (${collection.books.length})`
                  }
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

      <BottomSheet
        isOpen={addSheetOpen}
        onOpenChange={setAddSheetOpen}
        title="Add book"
      >
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

      <BottomSheet
        isOpen={shareSheetOpen}
        onOpenChange={setShareSheetOpen}
        title="Share collection"
      >
        <UserSearchPicker
          selectedUser={selectedShareUser}
          onSelectUser={setSelectedShareUser}
          placeholder="Search by name, username, or email"
          excludedUserIds={me?.id ? [me.id] : []}
        />

        {selectedShareUser ? (
          <p className="mt-2 text-xs text-text-muted">
            Sharing with @{selectedShareUser.username}
          </p>
        ) : null}

        <Button
          className="mt-3"
          color="primary"
          onPress={handleShare}
          isLoading={sharing}
          isDisabled={!selectedShareUser || sharing}
        >
          Share now
        </Button>
      </BottomSheet>

      <ToastNotice
        open={toastOpen}
        onClose={() => setToastOpen(false)}
        message={toastMessage}
      />
    </AppShell>
  );
}
