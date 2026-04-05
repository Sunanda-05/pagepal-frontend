"use client";

import React, { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  IconAdjustments,
  IconArrowLeft,
  IconBook,
  IconCircleCheck,
  IconCircleX,
  IconFilter,
  IconHourglass,
  IconPencil,
  IconPlus,
  IconSearch,
  IconSettings,
  IconShare3,
} from "@tabler/icons-react";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Tab, Tabs } from "@heroui/tabs";
import AppShell from "@/features/pagepal/layout/AppShell";
import RoleGate from "@/components/ui/RoleGate";
import BookCard from "@/components/ui/BookCard";
import BookCover from "@/components/ui/BookCover";
import CollectionCard from "@/components/ui/CollectionCard";
import EmptyState from "@/components/ui/EmptyState";
import LoadMoreButton from "@/components/ui/LoadMoreButton";
import ReviewCard from "@/components/ui/ReviewCard";
import ShelfStrip from "@/components/ui/ShelfStrip";
import StarRating from "@/components/ui/StarRating";
import TagChip from "@/components/ui/TagChip";
import ToastNotice from "@/components/ui/ToastNotice";
import UserAvatar from "@/components/ui/UserAvatar";
import BottomSheet from "@/components/ui/BottomSheet";
import ReadingStatusChip from "@/components/ui/ReadingStatusChip";
import ProgressBar from "@/components/ui/ProgressBar";
import GenreSearchSelect from "@/components/ui/GenreSearchSelect";
import { BookCardSkeleton, FeedItemSkeleton, ReviewCardSkeleton } from "@/components/ui/Skeletons";
import {
  useAddBookToCollectionMutation,
  useCreateBookMutation,
  useCreateCollectionMutation,
  useCreateReviewMutation,
  useDeleteBookMutation,
  useDeleteCollectionMutation,
  useFollowUserMutation,
  useGetAdminAuthorApplicationsQuery,
  useGetAuthorApplicationQuery,
  useGetBookByIdQuery,
  useGetBooksByTagQuery,
  useGetCollectionByIdQuery,
  useGetFilteredBooksQuery,
  useGetMeQuery,
  useGetMyCollectionsQuery,
  useGetPublicCollectionsQuery,
  useGetRatingsQuery,
  useGetRecommendationsQuery,
  useGetReviewsQuery,
  useGetSharedCollectionsQuery,
  useGetTagsQuery,
  useGetUserByIdQuery,
  usePatchBookMutation,
  usePatchMeMutation,
  useRemoveBookFromCollectionMutation,
  useReviewAuthorApplicationMutation,
  useShareCollectionMutation,
  useSubmitAuthorApplicationMutation,
  useSubmitRatingMutation,
  useUnfollowUserMutation,
  useUpdateCollectionMutation,
} from "@/redux/apis/pagepalEndpoints";
import ReviewComposer from "@/features/pagepal/forms/ReviewComposer";
import BookEditorForm from "@/features/pagepal/forms/BookEditorForm";
import CollectionForm from "@/features/pagepal/forms/CollectionForm";
import AuthorApplicationForm from "@/features/pagepal/forms/AuthorApplicationForm";
import RejectApplicationInlineForm from "@/features/pagepal/forms/RejectApplicationInlineForm";
import ProfileEditForm from "@/features/pagepal/forms/ProfileEditForm";
import { applyTheme } from "@/utils/applyTheme";
import { themes } from "@/data/theme";
import useDebouncedValue from "@/hooks/useDebouncedValue";
import { AuthorApplication, Book, ReadingStatus } from "@/types/pagepal";
import { BookFormValues, CollectionFormValues, ProfileEditValues } from "@/schemas/pagepalForms";

function FollowButton({ userId, isFollowing = false, type = "user" }: { userId: string; isFollowing?: boolean; type?: "user" | "author" }) {
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

function BooksGrid({ books, isLoading }: { books: Book[]; isLoading?: boolean }) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        <BookCardSkeleton />
        <BookCardSkeleton />
        <BookCardSkeleton />
        <BookCardSkeleton />
      </div>
    );
  }

  if (books.length === 0) {
    return <EmptyState title="No books found." subtitle="Try changing filters or adding new books." />;
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {books.map((book) => (
          <BookCard key={book.id} book={book} size="compact" />
        ))}
      </div>
      <LoadMoreButton onClick={() => undefined} label="Load more books" isDisabled />
    </>
  );
}

function relativeDateLabel(date: string): string {
  const input = new Date(date).getTime();
  if (!Number.isFinite(input)) return "recently";

  const now = Date.now();
  const deltaMs = Math.max(0, now - input);
  const hour = 60 * 60 * 1000;
  const day = 24 * hour;

  if (deltaMs < hour) {
    const minutes = Math.max(1, Math.floor(deltaMs / (60 * 1000)));
    return `${minutes}m ago`;
  }

  if (deltaMs < day) {
    return `${Math.floor(deltaMs / hour)}h ago`;
  }

  if (deltaMs < day * 2) {
    return "yesterday";
  }

  return `${Math.floor(deltaMs / day)}d ago`;
}

function isShelfCollectionName(name: string): boolean {
  return name.trim().toLowerCase() === "shelf";
}

function DiscoverStackHero({
  books,
  onSave,
}: {
  books: Book[];
  onSave?: (book: Book) => void;
}) {
  const [index, setIndex] = useState(0);
  const [dragX, setDragX] = useState(0);
  const [animating, setAnimating] = useState(false);
  const pointerStartRef = useRef<number | null>(null);

  if (books.length === 0) {
    return <EmptyState title="No books to browse." subtitle="Try updating your filters." />;
  }

  const front = books[index % books.length];
  const middle = books[(index + 1) % books.length];
  const back = books[(index + 2) % books.length];

  const dragDistance = Math.abs(dragX);
  const cueOpacity = Math.min(1, dragDistance / 60);

  const advance = (direction: "left" | "right") => {
    if (animating) return;
    setAnimating(true);
    setDragX(direction === "right" ? window.innerWidth : -window.innerWidth);

    window.setTimeout(() => {
      if (direction === "right") {
        onSave?.(front);
      }
      setIndex((prev) => prev + 1);
      setDragX(0);
      setAnimating(false);
    }, 300);
  };

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (animating) return;
    pointerStartRef.current = event.clientX;
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (pointerStartRef.current === null || animating) return;
    setDragX(event.clientX - pointerStartRef.current);
  };

  const onPointerUp = () => {
    if (pointerStartRef.current === null || animating) return;
    const threshold = 80;
    const finalDrag = dragX;
    pointerStartRef.current = null;

    if (Math.abs(finalDrag) > threshold) {
      advance(finalDrag > 0 ? "right" : "left");
      return;
    }

    setDragX(0);
  };

  return (
    <section className="relative h-[240px] w-full select-none">
      <article aria-label={`Upcoming: ${back.title}`} className="absolute inset-x-4 top-4 rounded-2xl border border-border bg-surface" style={{ transform: "translateY(16px) scale(0.88)", height: "206px" }} />
      <article aria-label={`Upcoming: ${middle.title}`} className="absolute inset-x-4 top-4 rounded-2xl border border-border bg-surface" style={{ transform: "translateY(8px) scale(0.94)", height: "206px" }} />

      <article
        className="absolute inset-x-4 top-4 rounded-2xl border border-border bg-[var(--color-primary-subtle)] p-4"
        style={{
          height: "206px",
          transform: `translateX(${dragX}px) rotate(${dragX / 20}deg)`,
          transition: animating
            ? "transform 300ms ease-in"
            : pointerStartRef.current === null
            ? "transform 300ms cubic-bezier(0.34, 1.56, 0.64, 1)"
            : "none",
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      >
        <span className="pointer-events-none absolute left-3 top-3 text-xs text-error" style={{ opacity: dragX < 0 ? cueOpacity : 0 }}>
          Skip
        </span>
        <span className="pointer-events-none absolute right-3 top-3 text-xs text-success" style={{ opacity: dragX > 0 ? cueOpacity : 0 }}>
          Save
        </span>

        <div className="grid h-full grid-cols-[120px_1fr] gap-4">
          <BookCover title={front.title} seed={front.id} size="lg" />
          <div className="flex min-w-0 flex-col">
            <TagChip label={front.genre} zoneStyle="catalog" />
            <h3 className="serif-display mt-2 line-clamp-2 text-[18px] leading-6 text-text">{front.title}</h3>
            <p className="mt-1 truncate text-[13px] text-text-muted">{front.authorName}</p>
            <div className="mt-2">
              <StarRating value={front.avgRating} size="md" count={front.reviewCount} />
            </div>
            <Button className="mt-auto" color="primary" radius="sm" onPress={() => onSave?.(front)}>
              Want to read
            </Button>
            <Link href={`/books/${front.id}`} className="mt-2 text-xs text-primary">
              See details
            </Link>
          </div>
        </div>
      </article>
    </section>
  );
}

export function HomeScreen() {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("Book saved to shelf.");
  const { data: me } = useGetMeQuery();
  const { data: myCollectionsData } = useGetMyCollectionsQuery();
  const { data: recommendations, isLoading } = useGetRecommendationsQuery();
  const [createCollection, { isLoading: creatingShelf }] = useCreateCollectionMutation();
  const [addBookToCollection, { isLoading: savingToShelf }] = useAddBookToCollectionMutation();

  const books = recommendations?.items ?? [];
  const shelfCollection = (myCollectionsData?.items ?? []).find((collection) => isShelfCollectionName(collection.name));
  const activityItems = books.slice(0, 10).map((book, index) => {
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
        {books.length > 0 ? (
          <ShelfStrip
            books={books.slice(0, 10)}
            currentBookId={me?.currentlyReadingBookId}
            desktopGrid
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
        {books.length === 0 ? (
          <EmptyState title="No books available." subtitle="Try discovery to find books first." />
        ) : (
          <div className="space-y-2">
            {books.slice(0, 8).map((book) => (
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

export function PublicCollectionsScreen() {
  const { data, isLoading } = useGetPublicCollectionsQuery();
  const collections = data?.items ?? [];

  return (
    <AppShell zone="D" pageTitle="Public Collections">
      <section className="space-y-4">
        <header>
          <h2 className="serif-display text-[20px] text-text">Public collections</h2>
          <p className="text-[13px] text-text-muted">Explore reading lists curated by the community.</p>
        </header>
        {isLoading ? (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            <BookCardSkeleton />
            <BookCardSkeleton />
            <BookCardSkeleton />
          </div>
        ) : collections.length === 0 ? (
          <EmptyState title="No public collections yet." />
        ) : (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            {collections.map((collection) => (
              <CollectionCard key={collection.id} collection={collection} />
            ))}
          </div>
        )}
      </section>
    </AppShell>
  );
}

export function DiscoverScreen() {
  const [filterOpen, setFilterOpen] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("Saved to your shelf.");
  const [search, setSearch] = useState("");
  const [genre, setGenre] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [publishedYear, setPublishedYear] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const debouncedSearch = useDebouncedValue(search, 350);
  const debouncedAuthorName = useDebouncedValue(authorName, 350);
  const debouncedPublishedYear = useDebouncedValue(publishedYear, 350);

  const { data: tagsData } = useGetTagsQuery();
  const { data: myCollectionsData } = useGetMyCollectionsQuery();
  const [createCollection] = useCreateCollectionMutation();
  const [addBookToCollection, { isLoading: savingToShelf }] = useAddBookToCollectionMutation();

  const shelfCollection = (myCollectionsData?.items ?? []).find((collection) => isShelfCollectionName(collection.name));

  const { data: filteredData, isLoading: filterLoading } = useGetFilteredBooksQuery({
    page: 1,
    limit: 16,
    search: debouncedSearch || undefined,
    genre: genre || undefined,
    authorName: debouncedAuthorName || undefined,
    publishedYear: debouncedPublishedYear ? Number(debouncedPublishedYear) : undefined,
  });

  const { data: taggedData, isLoading: taggedLoading } = useGetBooksByTagQuery(
    { tagId: activeTag ?? "" },
    { skip: !activeTag }
  );

  const books = activeTag ? taggedData?.items ?? [] : filteredData?.items ?? [];
  const tags = tagsData ?? [];

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

  const handleSaveToShelf = async (book: Book) => {
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

    setToastMessage(success ? `\"${book.title}\" saved to Shelf.` : "Could not save this book to Shelf.");
    setToastOpen(true);
  };

  return (
    <AppShell zone="B" pageTitle="Discover" actionSlot={<IconFilter size={18} className="text-text-muted" />}>
      <section className="space-y-5">
        <div className="rounded-full border border-border bg-surface px-3 py-2">
          <div className="flex items-center gap-2">
            <IconSearch size={16} className="text-text-muted" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search books, authors, genres..."
              className="w-full bg-transparent text-sm text-text outline-none"
            />
            <button type="button" onClick={() => setFilterOpen((prev) => !prev)}>
              <IconAdjustments size={16} className="text-primary" />
            </button>
          </div>
        </div>

        {filterOpen ? (
          <section className="space-y-2 border-b border-border pb-3">
            <div className="grid grid-cols-2 gap-2">
              <GenreSearchSelect
                className="col-span-2"
                value={genre}
                onChange={setGenre}
                placeholder="Genre"
              />
              <Input
                value={authorName}
                onValueChange={setAuthorName}
                variant="bordered"
                radius="sm"
                size="sm"
                placeholder="Author"
              />
              <Input
                value={publishedYear}
                onValueChange={setPublishedYear}
                variant="bordered"
                radius="sm"
                size="sm"
                placeholder="Year"
              />
            </div>
            <p className="text-xs text-text-muted">Filters auto-apply as you type.</p>
            <button
              type="button"
              className="text-xs text-text-muted"
              onClick={() => {
                setSearch("");
                setGenre("");
                setAuthorName("");
                setPublishedYear("");
                setActiveTag(null);
              }}
            >
              Clear
            </button>
          </section>
        ) : null}

        <DiscoverStackHero
          books={books.slice(0, 8)}
          onSave={(book) => {
            if (savingToShelf) return;
            void handleSaveToShelf(book);
          }}
        />

        <div className="shelf-scroll -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
          <TagChip label="All" zoneStyle="catalog" isActive={activeTag === null} onClick={() => setActiveTag(null)} />
          {tags.map((tag) => (
            <TagChip
              key={tag.id}
              label={tag.name}
              zoneStyle="catalog"
              isActive={activeTag === tag.id}
              onClick={() => setActiveTag(activeTag === tag.id ? null : tag.id)}
            />
          ))}
        </div>

        <BooksGrid books={books} isLoading={activeTag ? taggedLoading : filterLoading} />
      </section>

      <ToastNotice open={toastOpen} onClose={() => setToastOpen(false)} message={toastMessage} />
    </AppShell>
  );
}

export function RecommendationsScreen() {
  const { data, isLoading } = useGetRecommendationsQuery();
  const books = data?.items ?? [];
  const reasonBooks = books.slice(0, 6);

  return (
    <AppShell zone="B" pageTitle="Recommendations">
      <section className="space-y-4">
        <header>
          <h2 className="serif-display text-[24px] text-text">For you</h2>
          <p className="text-[13px] text-text-muted">Based on your reading history</p>
        </header>

        <div className="shelf-scroll -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
          {reasonBooks.map((book) => (
            <div key={`reason-${book.id}`} className="flex items-center gap-2 rounded-full border border-border bg-surface px-2 py-1">
              <BookCover title={book.title} seed={book.id} size="xs" hideTitle />
              <span className="max-w-[180px] truncate text-xs text-text-muted">because you liked {book.title}</span>
            </div>
          ))}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            <BookCardSkeleton />
            <BookCardSkeleton />
            <BookCardSkeleton />
            <BookCardSkeleton />
          </div>
        ) : books.length === 0 ? (
          <EmptyState title="No recommendations yet." subtitle="Rate and review books to improve matching." />
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {books.map((book, index) => {
                const strength = Math.max(52, Math.min(98, Math.round(book.avgRating * 18 + (index % 4) * 6)));
                return <BookCard key={book.id} book={book} size="compact" matchStrength={strength} />;
              })}
            </div>
            <LoadMoreButton onClick={() => undefined} label="Load more" isDisabled />
          </>
        )}
      </section>
    </AppShell>
  );
}

export function TagBooksScreen({ tagId }: { tagId: string }) {
  const { data, isLoading } = useGetBooksByTagQuery({ tagId });
  const { data: tagsData } = useGetTagsQuery();
  const books = data?.items ?? [];
  const relatedTags = (tagsData ?? []).filter((tag) => tag.id !== tagId).slice(0, 10);
  const activeTagName = (tagsData ?? []).find((tag) => tag.id === tagId)?.name ?? tagId;

  return (
    <AppShell zone="B" pageTitle="Tag Browse">
      <section className="space-y-4">
        <header className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="serif-display text-[20px] text-text">{activeTagName}</h2>
            <TagChip label={activeTagName} zoneStyle="catalog" />
          </div>
          <p className="text-[13px] text-text-muted">{books.length} books tagged with {activeTagName}</p>
        </header>

        <div className="shelf-scroll -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
          {relatedTags.map((tag) => (
            <Link key={tag.id} href={`/tags/${tag.id}`}>
              <TagChip label={tag.name} zoneStyle="catalog" />
            </Link>
          ))}
        </div>

        <BooksGrid books={books} isLoading={isLoading} />
      </section>
    </AppShell>
  );
}

export function BookDetailScreen({ bookId }: { bookId: string }) {
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("Saved successfully.");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);

  const { data: book, isLoading: bookLoading } = useGetBookByIdQuery(bookId);
  const { data: reviewData, isLoading: reviewsLoading } = useGetReviewsQuery({ bookId });
  const { data: ratingsData } = useGetRatingsQuery({ bookId });
  const { data: myCollectionsData } = useGetMyCollectionsQuery();
  const { data: similarData } = useGetFilteredBooksQuery(
    {
      page: 1,
      limit: 12,
      genre: book?.genre,
    },
    { skip: !book?.genre }
  );

  const [submitRating, { isLoading: ratingLoading }] = useSubmitRatingMutation();
  const [createReview, { isLoading: reviewLoading }] = useCreateReviewMutation();
  const [addBookToCollection, { isLoading: addToCollectionLoading }] = useAddBookToCollectionMutation();

  const reviews = reviewData?.items ?? [];
  const featuredReview = reviews[0];
  const listedReviews = reviews.slice(1, 5);
  const collections = myCollectionsData?.items ?? [];
  const ratingSummary = ratingsData ?? { average: 0, count: 0 };
  const similarBooks = (similarData?.items ?? []).filter((candidate) => candidate.id !== bookId);

  const fullDescription = book?.description ?? "";
  const hasLongDescription = fullDescription.length > 200;
  const descriptionText = descriptionExpanded || !hasLongDescription ? fullDescription : `${fullDescription.slice(0, 200)}...`;

  const handleReviewSubmit = async (values: { rating: number; text: string }) => {
    if (values.rating > 0) {
      await submitRating({ bookId, rating: values.rating }).unwrap().catch(() => undefined);
    }

    await createReview({ bookId, review: values.text }).unwrap();
    setToastMessage("Review saved.");
    setToastOpen(true);
  };

  const handleRate = async (rating: number) => {
    await submitRating({ bookId, rating }).unwrap().catch(() => undefined);
    setToastMessage("Rating saved.");
    setToastOpen(true);
  };

  const handleAddToCollection = async (collectionId: string) => {
    await addBookToCollection({
      collectionId,
      bookId,
      readingStatus: "want_to_read",
    }).unwrap();

    setSheetOpen(false);
    setToastMessage("Saved to collection.");
    setToastOpen(true);
  };

  const handleShareBook = async () => {
    if (!book) return;

    const url = window.location.href;

    try {
      if (navigator.share) {
        await navigator.share({
          title: book.title,
          text: `${book.title} by ${book.authorName}`,
          url,
        });
        setToastMessage("Shared successfully.");
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
        setToastMessage("Link copied to clipboard.");
      } else {
        setToastMessage("Web share is not supported on this browser.");
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }
      setToastMessage("Could not share this book right now.");
    }

    setToastOpen(true);
  };

  if (bookLoading) {
    return (
      <AppShell zone="C" pageTitle="Book">
        <div className="space-y-3">
          <BookCardSkeleton />
          <ReviewCardSkeleton />
        </div>
      </AppShell>
    );
  }

  if (!book) {
    return (
      <AppShell zone="C" pageTitle="Book">
        <EmptyState title="Book not found." subtitle="This title may have been removed or is unavailable." />
      </AppShell>
    );
  }

  return (
    <AppShell
      zone="C"
      pageTitle="Book"
      actionSlot={
        <button type="button" onClick={handleShareBook} className="text-text-muted" aria-label="Share book">
          <IconShare3 size={18} className="text-text-muted" />
        </button>
      }
    >
      <section className="space-y-6">
        <section className="overflow-hidden rounded-b-[32px] px-4 pb-6 pt-5 text-center" style={{ background: "color-mix(in srgb, var(--color-primary) 36%, #0d1016)" }}>
          <div className="mx-auto w-fit">
            <BookCover title={book.title} seed={book.id} size="xl" />
          </div>

          <h1 className="serif-display mt-4 text-[24px] leading-8 text-white">{book.title}</h1>
          <p className="mt-1 text-[14px] text-white/70">{book.authorName}</p>

          <div className="mt-2 flex flex-wrap justify-center gap-2">
            <TagChip label={book.genre} zoneStyle="catalog" />
            {book.tags.slice(0, 2).map((tag) => (
              <TagChip key={tag} label={tag} zoneStyle="catalog" />
            ))}
          </div>

          <div className="mt-3 flex justify-center">
            <StarRating value={ratingSummary.average} size="lg" count={ratingSummary.count} />
          </div>

          <div className="mt-4 grid gap-3">
            <Button color="primary" radius="full" className="h-11" onPress={() => undefined}>
              {reviews.length > 0 ? "Edit your review" : "Write a review"}
            </Button>
            <Button color="default" radius="full" variant="bordered" className="h-11 border-white text-white" onPress={() => setSheetOpen(true)}>
              Add to collection
            </Button>
          </div>
        </section>

        <section className="space-y-2">
          <h2 className="serif-display text-base text-text">Rate this book</h2>
          <StarRating value={Math.round(ratingSummary.average)} onChange={handleRate} size="md" />
          <p className="text-xs text-text-muted">Your rating: {Math.round(ratingSummary.average)}/5</p>
          {ratingLoading ? <p className="text-xs text-text-muted">Saving rating...</p> : null}
        </section>

        <section className="space-y-3">
          <h2 className="serif-display text-base text-text">About this book</h2>
          <p className="text-sm leading-7 text-text">{descriptionText || "No description available."}</p>
          {hasLongDescription ? (
            <button type="button" className="text-xs text-primary" onClick={() => setDescriptionExpanded((prev) => !prev)}>
              {descriptionExpanded ? "Show less" : "Read more"}
            </button>
          ) : null}
        </section>

        <section className="space-y-2">
          <p className="section-kicker">Tags</p>
          <div className="flex flex-wrap gap-2">
            {book.tags.length > 0 ? (
              book.tags.map((tag) => (
                <Link key={tag} href={`/tags/${encodeURIComponent(tag)}`}>
                  <TagChip label={tag} zoneStyle="catalog" />
                </Link>
              ))
            ) : (
              <p className="mono-meta">No tags attached.</p>
            )}
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="serif-display text-[18px] text-text">Reviews ({reviews.length})</h2>

          {featuredReview ? <ReviewCard review={featuredReview} styleType="pull-quote" /> : null}

          <ReviewComposer onSubmit={handleReviewSubmit} isSubmitting={reviewLoading} />

          {reviewsLoading ? (
            <ReviewCardSkeleton />
          ) : listedReviews.length === 0 ? (
            featuredReview ? null : <EmptyState title="No reviews yet. Be the first." subtitle="Share what stood out to you in this book." />
          ) : (
            <div className="space-y-3">
              {listedReviews.map((review) => (
                <ReviewCard key={review.id} review={review} book={book} />
              ))}
            </div>
          )}

          <Link href={`/books/${book.id}/reviews`} className="text-sm text-primary">
            See all {reviews.length} reviews
          </Link>
        </section>

        <section className="space-y-3">
          <h2 className="serif-display text-base text-text">More like this</h2>
          {similarBooks.length === 0 ? (
            <EmptyState title="No similar books found yet." />
          ) : (
            <ShelfStrip books={similarBooks.slice(0, 8)} />
          )}
        </section>
      </section>

      <BottomSheet isOpen={sheetOpen} onOpenChange={setSheetOpen} title="Add to collection">
        {collections.length === 0 ? (
          <EmptyState title="No collections found." subtitle="Create a collection first." />
        ) : (
          <div className="space-y-2">
            {collections.map((collection) => (
              <button
                key={collection.id}
                type="button"
                className="w-full rounded-lg border border-border px-3 py-2 text-left text-sm text-text"
                onClick={() => handleAddToCollection(collection.id)}
                disabled={addToCollectionLoading}
              >
                {collection.name}
              </button>
            ))}
          </div>
        )}
      </BottomSheet>

      <ToastNotice open={toastOpen} onClose={() => setToastOpen(false)} message={toastMessage} />
    </AppShell>
  );
}

export function BookReviewsScreen({ bookId }: { bookId: string }) {
  const [sort, setSort] = useState<"most-helpful" | "most-recent">("most-helpful");
  const { data: book } = useGetBookByIdQuery(bookId);
  const { data } = useGetReviewsQuery({ bookId });
  const { data: ratingsData } = useGetRatingsQuery({ bookId });
  const reviews = data?.items ?? [];

  const sortedReviews = [...reviews].sort((a, b) => {
    if (sort === "most-recent") {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    return b.rating - a.rating;
  });

  const ratingSummary = ratingsData ?? { average: 0, count: 0 };

  return (
    <AppShell zone="C" pageTitle="Reviews" actionSlot={<IconShare3 size={18} className="text-text-muted" />}>
      <section className="space-y-4 pb-24">
        <header className="text-center">
          <div className="mx-auto flex max-w-sm items-center justify-between">
            <Link href={`/books/${bookId}`} className="text-text-muted">
              <IconArrowLeft size={18} />
            </Link>
            <h2 className="serif-display text-[18px] text-text">Reviews</h2>
            <IconShare3 size={16} className="text-text-muted" />
          </div>
          <p className="mt-2 text-[13px] text-text-muted">{book?.title ?? "Book"}</p>
          <div className="mt-1 flex justify-center">
            <StarRating value={ratingSummary.average} size="md" count={ratingSummary.count} />
          </div>
        </header>

        <div className="flex justify-end gap-2">
          <button type="button" className={`pill-chip ${sort === "most-helpful" ? "chip-active" : ""}`} onClick={() => setSort("most-helpful")}>
            Most helpful
          </button>
          <button type="button" className={`pill-chip ${sort === "most-recent" ? "chip-active" : ""}`} onClick={() => setSort("most-recent")}>
            Most recent
          </button>
        </div>

        {sortedReviews.length === 0 ? (
          <EmptyState title="No reviews yet. Be the first." />
        ) : (
          <>
            <div className="space-y-3">
              {sortedReviews.map((review) => (
                <article key={review.id} className="border-b border-divider py-4">
                  <header className="flex items-start gap-3">
                    <UserAvatar name={review.userName} size="md" />
                    <div className="min-w-0 flex-1">
                      <p className="text-[14px] font-semibold text-text">{review.userName}</p>
                      <p className="mono-meta">{relativeDateLabel(review.createdAt)}</p>
                    </div>
                    <StarRating value={review.rating} size="sm" />
                  </header>
                  <p className="mt-3 text-[14px] leading-7 text-text-muted">{review.text}</p>
                </article>
              ))}
            </div>
            <LoadMoreButton onClick={() => undefined} label="Load more reviews" isDisabled />
          </>
        )}

        <div className="pointer-events-none fixed inset-x-0 bottom-6 z-30 flex justify-center px-4">
          <Button
            as={Link}
            href={`/books/${bookId}`}
            className="pointer-events-auto h-11 rounded-full px-5"
            color="primary"
            startContent={<IconPencil size={16} />}
          >
            {sortedReviews.length > 0 ? "Edit your review" : "Write a review"}
          </Button>
        </div>
      </section>
    </AppShell>
  );
}

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

export function AuthorManageScreen() {
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deleteBook, { isLoading }] = useDeleteBookMutation();
  const { data: me } = useGetMeQuery();
  const { data } = useGetFilteredBooksQuery(
    {
      page: 1,
      limit: 24,
      authorName: me?.displayName,
    },
    { skip: !me?.displayName }
  );

  const books = data?.items ?? [];

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteBook({ id: deleteTarget }).unwrap();
    setDeleteTarget(null);
  };

  return (
    <AppShell zone="C" pageTitle="My Books" actionSlot={<Link href="/author/manage/new"><IconPlus size={18} className="text-text-muted" /></Link>}>
      <RoleGate allow={["AUTHOR", "ADMIN"]}>
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="serif-display text-[20px] text-text">My books</h2>
              <p className="text-[13px] text-text-muted">You&apos;ve published {books.length} books</p>
            </div>
            <Button as={Link} href="/author/manage/new" size="sm" color="primary">
              New book
            </Button>
          </div>

          {books.length === 0 ? (
            <EmptyState title="No books found for this author." />
          ) : (
            <div className="space-y-0">
              {books.map((book) => (
                <article key={book.id} className="flex items-center gap-3 border-b border-divider py-3">
                  <BookCover title={book.title} seed={book.id} size="sm" hideTitle />
                  <div className="min-w-0 flex-1">
                    <p className="serif-display truncate text-[15px] text-text">{book.title}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <TagChip label={book.genre} zoneStyle="catalog" />
                      <StarRating value={book.avgRating} size="sm" count={book.reviewCount} />
                    </div>
                  </div>
                  <Button as={Link} href={`/author/manage/${book.id}/edit`} size="sm" variant="light">
                    Edit
                  </Button>
                  <Button size="sm" color="danger" variant="light" onPress={() => setDeleteTarget(book.id)}>
                    Delete
                  </Button>
                </article>
              ))}
            </div>
          )}
        </section>

        <BottomSheet isOpen={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)} title="Delete this book?">
          <p className="text-sm text-text-muted">This will remove all reviews and ratings for this title.</p>
          <Button className="mt-3" color="danger" onPress={handleDelete} isLoading={isLoading}>
            Delete permanently
          </Button>
        </BottomSheet>
      </RoleGate>
    </AppShell>
  );
}

export function AuthorManageBookFormScreen({ bookId }: { bookId?: string }) {
  const [toastOpen, setToastOpen] = useState(false);
  const { data: currentBook } = useGetBookByIdQuery(bookId ?? "", { skip: !bookId });
  const [createBook, { isLoading: creating }] = useCreateBookMutation();
  const [patchBook, { isLoading: updating }] = usePatchBookMutation();

  const initialValues = currentBook
    ? {
        title: currentBook.title,
        description: currentBook.description,
        genre: currentBook.genre,
        publishedYear: currentBook.year,
        isbn: currentBook.isbn,
      }
    : undefined;

  const handleSubmit = async (values: BookFormValues) => {
    const { coverColor, ...payload } = values;
    void coverColor;

    if (bookId) {
      await patchBook({ id: bookId, ...payload }).unwrap();
    } else {
      await createBook(payload).unwrap();
    }

    setToastOpen(true);
  };

  return (
    <AppShell zone="C" pageTitle={bookId ? "Edit Book" : "New Book"}>
      <RoleGate allow={["AUTHOR", "ADMIN"]}>
        <section className="space-y-4">
          <h1 className="serif-display text-2xl text-text">{bookId ? "Edit Book" : "Create New Book"}</h1>
          <BookEditorForm initialValues={initialValues} onSubmit={handleSubmit} isSubmitting={creating || updating} />
        </section>
      </RoleGate>
      <ToastNotice open={toastOpen} onClose={() => setToastOpen(false)} message="Book saved." />
    </AppShell>
  );
}

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
              <p className="serif-display text-[18px] text-text">{me.followingCount}</p>
              <p className="text-[10px] uppercase tracking-[0.08em] text-text-muted">Following</p>
            </div>
            <div>
              <p className="serif-display text-[18px] text-text">{me.followersCount}</p>
              <p className="text-[10px] uppercase tracking-[0.08em] text-text-muted">Followers</p>
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
              <p className="serif-display text-[18px] text-text">{user.followingCount}</p>
              <p className="text-[10px] uppercase tracking-[0.08em] text-text-muted">Following</p>
            </div>
            <div>
              <p className="serif-display text-[18px] text-text">{user.followersCount}</p>
              <p className="text-[10px] uppercase tracking-[0.08em] text-text-muted">Followers</p>
            </div>
          </div>
        </header>

        <EmptyState title="Public shelves are not exposed by backend yet." subtitle="Shared books and collections will appear here." />
      </section>
    </AppShell>
  );
}

export function ProfileEditScreen() {
  const [toastOpen, setToastOpen] = useState(false);
  const router = useRouter();
  const { data: me } = useGetMeQuery();
  const [patchMe, { isLoading }] = usePatchMeMutation();

  if (!me) {
    return (
      <AppShell zone="D" pageTitle="Edit Profile">
        <EmptyState title="Unable to edit profile right now." />
      </AppShell>
    );
  }

  const initialValues: ProfileEditValues = {
    name: me.displayName,
    bio: me.bio,
  };

  const handleSubmit = async (values: ProfileEditValues) => {
    await patchMe({
      name: values.name,
      bio: values.bio,
    }).unwrap();

    setToastOpen(true);
    window.setTimeout(() => {
      router.push("/profile/me");
    }, 400);
  };

  return (
    <AppShell zone="D" pageTitle="Edit Profile">
      <section className="space-y-4">
        <h1 className="serif-display text-2xl text-text">Edit My Profile</h1>
        <ProfileEditForm initialValues={initialValues} onSubmit={handleSubmit} isSubmitting={isLoading} />
      </section>
      <ToastNotice open={toastOpen} onClose={() => setToastOpen(false)} message="Profile updated." />
    </AppShell>
  );
}

function CollectionsBaseScreen({
  title,
  source,
}: {
  title: string;
  source: "me" | "public" | "shared";
}) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);

  const meQuery = useGetMyCollectionsQuery(undefined, { skip: source !== "me" });
  const publicQuery = useGetPublicCollectionsQuery(undefined, { skip: source !== "public" });
  const sharedQuery = useGetSharedCollectionsQuery(undefined, { skip: source !== "shared" });

  const [createCollection, { isLoading: creating }] = useCreateCollectionMutation();

  const sourceData =
    source === "me"
      ? meQuery.data?.items
      : source === "shared"
      ? sharedQuery.data?.items
      : publicQuery.data?.items;

  const collections = sourceData ?? [];
  const canCreate = source === "me";

  const handleCreate = async (values: CollectionFormValues) => {
    await createCollection(values).unwrap();
    setSheetOpen(false);
    setToastOpen(true);
  };

  return (
    <AppShell
      zone={source === "public" ? "A" : "D"}
      pageTitle={title}
      actionSlot={canCreate ? <button type="button" onClick={() => setSheetOpen(true)}><IconPlus size={18} className="text-text-muted" /></button> : null}
    >
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="serif-display text-2xl text-text">{title}</h1>
          {canCreate ? (
            <Button size="sm" color="primary" onPress={() => setSheetOpen(true)}>
              New collection
            </Button>
          ) : null}
        </div>

        {collections.length === 0 ? (
          <EmptyState title={source === "shared" ? "No shared collections yet." : "No collections yet. Start one."} subtitle={source === "me" ? "Create your first collection to organize books." : "Collections will appear here when available."} />
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
              {canCreate ? (
                <button
                  type="button"
                  onClick={() => setSheetOpen(true)}
                  className="flex min-h-40 flex-col items-center justify-center rounded-xl border border-dashed border-border text-text-muted"
                >
                  <IconPlus size={18} />
                  <span className="mt-2 text-sm">New collection</span>
                </button>
              ) : null}
              {collections.map((collection) => (
                <CollectionCard key={collection.id} collection={collection} />
              ))}
            </div>
            <LoadMoreButton onClick={() => undefined} label="Load more collections" isDisabled />
          </>
        )}
      </section>

      {canCreate ? (
        <BottomSheet isOpen={sheetOpen} onOpenChange={setSheetOpen} title="Create collection">
          <CollectionForm submitLabel="Create collection" onSubmit={handleCreate} isSubmitting={creating} />
        </BottomSheet>
      ) : null}

      <ToastNotice open={toastOpen} onClose={() => setToastOpen(false)} message="Collection created." />
    </AppShell>
  );
}

export function CollectionsMeScreen() {
  return <CollectionsBaseScreen source="me" title="My Collections" />;
}

export function CollectionsSharedScreen() {
  return <CollectionsBaseScreen source="shared" title="Shared Collections" />;
}

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

export function CollectionCreateEditScreen({ collectionId }: { collectionId?: string }) {
  const [toastOpen, setToastOpen] = useState(false);
  const { data: current } = useGetCollectionByIdQuery(collectionId ?? "", { skip: !collectionId });
  const [createCollection, { isLoading: creating }] = useCreateCollectionMutation();
  const [updateCollection, { isLoading: updating }] = useUpdateCollectionMutation();
  const isShelfCollection = isShelfCollectionName(current?.name ?? "");

  const initialValues = current
    ? {
        name: current.name,
        description: current.description,
        isPublic: current.visibility === "public",
      }
    : undefined;

  const handleSubmit = async (values: CollectionFormValues) => {
    const payload = isShelfCollection ? { ...values, name: current?.name ?? "Shelf" } : values;

    if (collectionId) {
      await updateCollection({ id: collectionId, ...payload }).unwrap();
    } else {
      await createCollection(payload).unwrap();
    }

    setToastOpen(true);
  };

  return (
    <AppShell zone="D" pageTitle={collectionId ? "Edit Collection" : "New Collection"}>
      <section className="space-y-4">
        <h1 className="serif-display text-2xl text-text">{collectionId ? "Edit Collection" : "Create Collection"}</h1>
        <div className="rounded-2xl border border-border bg-surface p-4">
          <CollectionForm
            initialValues={initialValues}
            submitLabel={collectionId ? "Save changes" : "Create collection"}
            onSubmit={handleSubmit}
            isSubmitting={creating || updating}
            disableName={isShelfCollection}
          />
        </div>
      </section>
      <ToastNotice open={toastOpen} onClose={() => setToastOpen(false)} message="Collection saved." />
    </AppShell>
  );
}

export function AuthorApplyScreen() {
  const [toastOpen, setToastOpen] = useState(false);
  const [submitAuthorApplication, { isLoading }] = useSubmitAuthorApplicationMutation();

  const handleSubmit = async (values: { bio: string; writingHistory?: string }) => {
    const payload = values.writingHistory?.trim()
      ? `${values.bio}\n\nWhat I've written:\n${values.writingHistory}`
      : values.bio;

    await submitAuthorApplication({ bio: payload }).unwrap();
    setToastOpen(true);
  };

  return (
    <AppShell zone="D" pageTitle="Author Apply">
      <RoleGate allow={["USER"]} fallbackTitle="Author applications are available for user accounts.">
        <section className="mx-auto w-full max-w-[480px] space-y-4 pt-6">
          <div className="text-center">
            <IconBook size={32} className="mx-auto text-primary" />
            <h1 className="serif-display mt-3 text-[22px] text-text">Become an author</h1>
            <p className="mt-1 text-[13px] text-text-muted">Share your books with the PagePal community.</p>
            <div className="mx-auto mt-3 h-px w-10 bg-border" />
          </div>
          <AuthorApplicationForm onSubmit={handleSubmit} isSubmitting={isLoading} />
        </section>
      </RoleGate>
      <ToastNotice open={toastOpen} onClose={() => setToastOpen(false)} message="Application submitted." />
    </AppShell>
  );
}

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

export function FriendsScreen() {
  const [tab, setTab] = useState<"following" | "followers">("following");

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
        </header>

        <section className="space-y-2">
          <p className="section-kicker">Friends reading now</p>
          <div className="shelf-scroll flex gap-3 overflow-x-auto pb-1">
            <EmptyState title="No active reads from your network yet." subtitle="Readers currently in-progress will show up here." />
          </div>
        </section>

        <section>
          <EmptyState title={tab === "following" ? "Find readers to follow." : "No followers yet."} subtitle="Follow from profile pages and your list will appear here." />
        </section>
      </section>
    </AppShell>
  );
}

export function SettingsScreen() {
  const [toastOpen, setToastOpen] = useState(false);
  const [activeThemeId, setActiveThemeId] = useState<string>("warm-light");
  const [washColor, setWashColor] = useState<string | null>(null);
  const { data: me } = useGetMeQuery();

  const themeEntries = useMemo(() => Object.values(themes), []);

  const handleApplyTheme = async (themeId: string) => {
    const theme = themes[themeId];
    if (!theme) return;

    await applyTheme(theme);
    setWashColor(theme.colors["--color-primary"]);
    window.setTimeout(() => setWashColor(null), 300);
    setActiveThemeId(themeId);
    setToastOpen(true);
  };

  return (
    <AppShell zone="D" pageTitle="Settings">
      <section className="space-y-5">
        <section className="space-y-2">
          <h1 className="serif-display text-[22px] text-text">Appearance</h1>
          <p className="text-[13px] text-text-muted">Choose your palette. Applies instantly across the app.</p>

          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {themeEntries.slice(0, 8).map((theme) => {
              const isActive = theme.id === activeThemeId;
              return (
                <button key={theme.id} type="button" onClick={() => handleApplyTheme(theme.id)} className="space-y-1 text-center">
                  <span
                    className={`relative block h-12 w-full overflow-hidden rounded-[10px] border ${isActive ? "ring-2 ring-primary" : ""}`}
                    style={{ borderColor: "var(--color-border)" }}
                  >
                    <span
                      className="absolute inset-0"
                      style={{
                        background: `linear-gradient(135deg, ${theme.colors["--color-primary"]} 0 49%, ${theme.colors["--color-bg"]} 51% 100%)`,
                      }}
                    />
                  </span>
                  <span className="block font-mono text-[10px] text-text-muted">{theme.name}</span>
                </button>
              );
            })}
          </div>
        </section>

        <div className="h-px w-full bg-divider" />

        <section className="space-y-2">
          <h2 className="serif-display text-base text-text">Account</h2>
          <div className="space-y-2">
            <div className="flex items-center justify-between border-b border-divider py-2 text-sm">
              <span className="text-text-muted">Email address</span>
              <span>{me?.username ? `${me.username}@example.com` : "Not available"}</span>
            </div>
            <div className="flex items-center justify-between border-b border-divider py-2 text-sm">
              <span className="text-text-muted">Password</span>
              <button type="button" className="text-primary">Change</button>
            </div>
            <div className="flex items-center justify-between border-b border-divider py-2 text-sm">
              <span className="text-text-muted">Role</span>
              <TagChip label={me?.role ?? "USER"} zoneStyle="catalog" />
            </div>
            {me?.role === "USER" ? (
              <div className="flex items-center justify-between border-b border-divider py-2 text-sm">
                <span className="text-text-muted">Author status</span>
                <Link href="/author/apply" className="text-primary">
                  Apply to become an author
                </Link>
              </div>
            ) : null}
          </div>

          <button type="button" className="pt-2 text-sm text-error">
            Delete account
          </button>
        </section>
      </section>

      {washColor ? (
        <div
          className="pointer-events-none fixed inset-0 z-[90]"
          style={{
            backgroundColor: washColor,
            animation: "toast-enter 300ms ease-out",
            opacity: 0.15,
          }}
        />
      ) : null}

      <ToastNotice open={toastOpen} onClose={() => setToastOpen(false)} message="Palette changed." />
    </AppShell>
  );
}

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

export function AdminApplicationDetailScreen({ applicationId }: { applicationId: string }) {
  const [approveSheetOpen, setApproveSheetOpen] = useState(false);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);
  const [reviewApplication, { isLoading }] = useReviewAuthorApplicationMutation();

  const { data } = useGetAdminAuthorApplicationsQuery({ status: undefined });
  const allApplications: AuthorApplication[] = data?.items ?? [];
  const application = allApplications.find((entry) => entry.id === applicationId);

  const handleApprove = async () => {
    if (!application) return;
    await reviewApplication({ id: application.id, status: "APPROVED" }).unwrap();
    setApproveSheetOpen(false);
    setToastOpen(true);
  };

  const handleReject = async (values: { reason: string }) => {
    if (!application) return;
    await reviewApplication({ id: application.id, status: "REJECTED", reason: values.reason }).unwrap();
    setShowRejectForm(false);
    setToastOpen(true);
  };

  return (
    <AppShell zone="E" pageTitle="Application Detail">
      <RoleGate allow={["ADMIN"]}>
        {!application ? (
          <EmptyState title="Application not found." />
        ) : (
          <section className="space-y-5 rounded-xl border border-border bg-surface p-4">
            <header className="flex items-center gap-4">
              <UserAvatar name={application.userName} size="xl" />
              <div>
                <h1 className="serif-display text-[22px] text-text">{application.userName}</h1>
                <p className="mono-meta">Applied {new Date(application.submittedAt).toLocaleDateString()}</p>
                <span className="catalog-chip mt-2 inline-flex">{application.status}</span>
              </div>
            </header>

            <section className="space-y-2">
              <p className="section-kicker">Their motivation</p>
              <div className="border-l-2 border-border pl-4">
                <p className="text-[14px] leading-7 text-text-muted">{application.motivation || "No additional information provided."}</p>
              </div>
            </section>

            {application.status === "pending" ? (
              <section className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  <Button color="success" onPress={() => setApproveSheetOpen(true)} isLoading={isLoading}>
                    Approve
                  </Button>
                  <Button variant="bordered" onPress={() => setShowRejectForm((prev) => !prev)}>
                    Reject
                  </Button>
                </div>

                {showRejectForm ? <RejectApplicationInlineForm onSubmit={handleReject} isSubmitting={isLoading} /> : null}
              </section>
            ) : (
              <section className="border-t border-divider pt-3">
                <p className="mono-meta">Reviewed on {new Date(application.submittedAt).toLocaleDateString()}</p>
                {application.reason ? (
                  <div className="mt-2 border-l-2 border-border pl-4 text-sm text-text-muted">
                    {application.reason}
                  </div>
                ) : null}
              </section>
            )}
          </section>
        )}
      </RoleGate>

      <BottomSheet isOpen={approveSheetOpen} onOpenChange={setApproveSheetOpen} title="Approve this application?">
        <p className="text-sm text-text-muted">They will gain author access immediately after approval.</p>
        <div className="mt-3 flex gap-2">
          <Button color="success" onPress={handleApprove} isLoading={isLoading}>
            Approve
          </Button>
          <Button variant="light" onPress={() => setApproveSheetOpen(false)}>
            Cancel
          </Button>
        </div>
      </BottomSheet>

      <ToastNotice open={toastOpen} onClose={() => setToastOpen(false)} message="Application updated." />
    </AppShell>
  );
}

export function LoginScreen() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-4 py-10">
      <section className="rounded-2xl border border-border bg-surface p-5">
        <h1 className="serif-display text-2xl text-text">Welcome back</h1>
        <p className="mt-1 text-sm text-text-muted">Sign in to continue your reading conversations.</p>
        <form className="mt-5 space-y-3">
          <input className="w-full rounded-xl border border-border bg-surface-secondary px-3 py-2 text-sm outline-none" placeholder="Email" />
          <input className="w-full rounded-xl border border-border bg-surface-secondary px-3 py-2 text-sm outline-none" placeholder="Password" type="password" />
          <Button color="primary" className="w-full">
            Sign in
          </Button>
        </form>
        <Link href="/forgot-password" className="mt-3 block text-sm text-primary">
          Forgot password?
        </Link>
        <Link href="/register" className="mt-1 block text-sm text-text-muted">
          Need an account? Register
        </Link>
      </section>
    </main>
  );
}

export function RegisterScreen() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-4 py-10">
      <section className="rounded-2xl border border-border bg-surface p-5">
        <h1 className="serif-display text-2xl text-text">Create account</h1>
        <p className="mt-1 text-sm text-text-muted">Join PagePal and start sharing your shelf.</p>
        <form className="mt-5 space-y-3">
          <input className="w-full rounded-xl border border-border bg-surface-secondary px-3 py-2 text-sm outline-none" placeholder="Email" />
          <input className="w-full rounded-xl border border-border bg-surface-secondary px-3 py-2 text-sm outline-none" placeholder="Username" />
          <input className="w-full rounded-xl border border-border bg-surface-secondary px-3 py-2 text-sm outline-none" placeholder="Password" type="password" />
          <Button color="primary" className="w-full">
            Create account
          </Button>
        </form>
        <Link href="/login" className="mt-3 block text-sm text-text-muted">
          Already have an account? Sign in
        </Link>
      </section>
    </main>
  );
}

export function ForgotPasswordScreen() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-4 py-10">
      <section className="rounded-2xl border border-border bg-surface p-5">
        <h1 className="serif-display text-2xl text-text">Forgot password</h1>
        <p className="mt-1 text-sm text-text-muted">Enter your email and we will send a reset link.</p>
        <form className="mt-5 space-y-3">
          <input className="w-full rounded-xl border border-border bg-surface-secondary px-3 py-2 text-sm outline-none" placeholder="Email" />
          <Button color="primary" className="w-full">
            Send reset link
          </Button>
        </form>
        <Link href="/login" className="mt-3 block text-sm text-text-muted">
          Back to login
        </Link>
      </section>
    </main>
  );
}
