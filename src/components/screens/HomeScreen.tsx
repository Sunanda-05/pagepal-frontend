"use client";

import React, { useState } from "react";
import Link from "next/link";
import AppShell from "@/components/layout/AppShell";
import BookCover from "@/components/ui/BookCover";
import EmptyState from "@/components/ui/EmptyState";
import LoadMoreButton from "@/components/ui/LoadMoreButton";
import ShelfStrip from "@/components/ui/ShelfStrip";
import StarRating from "@/components/ui/StarRating";
import TagChip from "@/components/ui/TagChip";
import ToastNotice from "@/components/ui/ToastNotice";
import UserAvatar from "@/components/ui/UserAvatar";
import BottomSheet from "@/components/ui/BottomSheet";
import { FeedItemSkeleton } from "@/components/ui/Skeletons";
import {
  useAddBookToCollectionMutation,
  useCreateCollectionMutation,
  useGetMeQuery,
  useGetMyCollectionsQuery,
  useGetRecommendationsQuery,
} from "@/redux/apis/pagepalEndpoints";
import { Book } from "@/types/pagepal";
import { isShelfCollectionName, relativeDateLabel } from "@/utils/bookUtil";

export function HomeScreen() {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("Book saved to shelf.");
  const { data: me } = useGetMeQuery();
  const { data: myCollectionsData } = useGetMyCollectionsQuery();
  const { data: recommendations, isLoading } = useGetRecommendationsQuery();
  const [createCollection, { isLoading: creatingShelf }] = useCreateCollectionMutation();
  const [addBookToCollection, { isLoading: savingToShelf }] = useAddBookToCollectionMutation();

  const recommendationBooks = recommendations?.items ?? [];
  const shelfCollection = (myCollectionsData?.items ?? []).find((collection) => isShelfCollectionName(collection.name));
  const recommendationLookup = new Map(recommendationBooks.map((book) => [book.id, book]));

  const shelfBooks: Book[] = (shelfCollection?.books ?? []).map((entry) => {
    const matchedBook = recommendationLookup.get(entry.bookId);

    if (matchedBook) {
      return matchedBook;
    }

    return {
      id: entry.bookId,
      title: `Book ${entry.bookId.slice(0, 8)}`,
      authorId: "",
      authorName: "Unknown author",
      description: "",
      genre: "Unknown",
      year: new Date().getFullYear(),
      isbn: "",
      avgRating: 0,
      reviewCount: 0,
      coverTone: "primary",
      tags: [],
    };
  });

  const activityItems = recommendationBooks.slice(0, 10).map((book, index) => {
    const actionType = index % 3 === 0 ? "reviewed" : index % 3 === 1 ? "rated" : "added";
    const occurredAt = new Date(Date.now() - (index + 1) * 60 * 60 * 1000).toISOString();
    const actor = ["Priya", "Dev", "Ananya", "Karan", "Ishita"][index % 5];
    return {
      id: `${book.id}-${index}`,
      actionType,
      actor,
      occurredAt,
      book,
    };
  });

  const ensureShelfCollection = async () => {
    if (shelfCollection?.id) {
      return shelfCollection.id;
    }

    const created = await createCollection({
      name: "Shelf",
      description: "Your default reading shelf.",
      isPublic: false,
    })
      .unwrap()
      .catch(() => null);

    return created?.id ?? null;
  };

  const addBookToShelf = async (book: Book) => {
    const shelfId = await ensureShelfCollection();

    if (!shelfId) {
      setToastMessage("Unable to find your Shelf collection.");
      setToastOpen(true);
      return;
    }

    const success = await addBookToCollection({
      collectionId: shelfId,
      bookId: book.id,
      readingStatus: "want_to_read",
    })
      .unwrap()
      .then(() => true)
      .catch(() => false);

    setSheetOpen(false);
    setToastMessage(success ? `\"${book.title}\" saved to Shelf.` : "Could not save this book to Shelf.");
    setToastOpen(true);
  };

  return (
    <AppShell
      zone="A"
      pageTitle="PagePal"
      actionSlot={
        <Link href="/profile/me">
          <UserAvatar name={me?.displayName ?? "Guest"} size="sm" />
        </Link>
      }
    >
      <section className="space-y-5">
        {shelfBooks.length > 0 ? (
          <ShelfStrip
            books={shelfBooks.slice(0, 10)}
            currentBookId={me?.currentlyReadingBookId}
            onAddBook={() => setSheetOpen(true)}
          />
        ) : isLoading ? (
          <div className="space-y-1">
            <FeedItemSkeleton />
            <FeedItemSkeleton />
          </div>
        ) : (
          <EmptyState title="Your shelf is looking bare." subtitle="Add your first book to get started." ctaLabel="Add your first book" onCtaClick={() => setSheetOpen(true)} />
        )}

        <div className="h-px w-full bg-border" />

        <section className="space-y-1">
          <p className="section-kicker">Friends&apos; activity</p>
          {activityItems.length === 0 ? (
            <div className="py-4">
              <EmptyState title="Follow someone to see their activity." subtitle="Your feed will appear here once friends start reading." />
            </div>
          ) : (
            activityItems.map((item) => (
              <article key={item.id} className="border-b border-divider py-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-start gap-3">
                    <Link href="/profile/me" className="active:scale-95">
                      <UserAvatar name={item.actor} size="sm" />
                    </Link>
                    <div className="min-w-0">
                      <p className="text-[13px] text-text">
                        <span className="font-semibold">{item.actor}</span>{" "}
                        <span className="text-text-muted">
                          {item.actionType === "reviewed" ? "reviewed" : item.actionType === "rated" ? "rated" : "added to shelf"}
                        </span>
                      </p>
                      <Link href={`/books/${item.book.id}`} className="mt-2 flex min-w-0 items-start gap-2">
                        <BookCover title={item.book.title} seed={item.book.id} size="xs" hideTitle />
                        <div className="min-w-0">
                          <p className="truncate serif-display text-[14px] text-text">{item.book.title}</p>
                          <p className="truncate text-xs text-text-muted">{item.book.authorName}</p>
                          {item.actionType !== "added" ? (
                            <div className="mt-1">
                              <StarRating value={item.book.avgRating} size="sm" count={item.book.reviewCount} />
                            </div>
                          ) : (
                            <div className="mt-1">
                              <TagChip label={item.book.genre} zoneStyle="pill" />
                            </div>
                          )}
                        </div>
                      </Link>
                    </div>
                  </div>

                  <span className="mono-meta">{relativeDateLabel(item.occurredAt)}</span>
                </div>
              </article>
            ))
          )}
        </section>

        <LoadMoreButton onClick={() => undefined} label="Load more" isDisabled />
      </section>

      <BottomSheet isOpen={sheetOpen} onOpenChange={setSheetOpen} title="Add book to shelf">
        {recommendationBooks.length === 0 ? (
          <EmptyState title="No books available." subtitle="Try discovery to find books first." />
        ) : (
          <div className="space-y-2">
            {recommendationBooks.slice(0, 8).map((book) => (
              <button
                key={book.id}
                type="button"
                className="flex w-full items-center gap-3 rounded-lg border border-border p-2 text-left"
                onClick={() => addBookToShelf(book)}
                disabled={savingToShelf || creatingShelf}
              >
                <BookCover title={book.title} seed={book.id} size="xs" hideTitle />
                <div className="min-w-0">
                  <p className="truncate text-sm text-text">{book.title}</p>
                  <p className="truncate text-xs text-text-muted">{book.authorName}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </BottomSheet>

      <ToastNotice open={toastOpen} onClose={() => setToastOpen(false)} message={toastMessage} />
    </AppShell>
  );
}