"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  IconShare3,
} from "@tabler/icons-react";
import { Button } from "@heroui/button";
import AppShell from "@/components/layout/AppShell";
import BookCover from "@/components/ui/BookCover";
import EmptyState from "@/components/ui/EmptyState";
import ReviewCard from "@/components/ui/ReviewCard";
import ShelfStrip from "@/components/ui/ShelfStrip";
import StarRating from "@/components/ui/StarRating";
import TagChip from "@/components/ui/TagChip";
import ToastNotice from "@/components/ui/ToastNotice";
import BottomSheet from "@/components/ui/BottomSheet";
import { BookCardSkeleton, ReviewCardSkeleton } from "@/components/ui/Skeletons";
import {
  useAddBookToCollectionMutation,
  useCreateReviewMutation,
  useGetBookByIdQuery,
  useGetFilteredBooksQuery,
  useGetMeQuery,
  useGetMyCollectionsQuery,
  useGetRatingsQuery,
  useGetReviewsQuery,
  useSubmitRatingMutation,
  useUpdateReviewMutation,
} from "@/redux/apis/pagepalEndpoints";
import ReviewComposer from "@/components/forms/ReviewComposer";

export function BookDetailScreen({ bookId }: { bookId: string }) {
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("Saved successfully.");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  const reviewComposerRef = React.useRef<HTMLDivElement | null>(null);

  const { data: book, isLoading: bookLoading } = useGetBookByIdQuery(bookId);
  const { data: me } = useGetMeQuery();
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
  const [updateReview, { isLoading: updateReviewLoading }] = useUpdateReviewMutation();
  const [addBookToCollection, { isLoading: addToCollectionLoading }] = useAddBookToCollectionMutation();

  const reviews = reviewData?.items ?? [];
  const myReview = reviews.find((review) => review.userId === me?.id);
  const featuredReview = reviews[0];
  const listedReviews = reviews.slice(1, 5);
  const collections = myCollectionsData?.items ?? [];
  const ratingSummary = ratingsData ?? { average: 0, count: 0 };
  const similarBooks = (similarData?.items ?? []).filter((candidate) => candidate.id !== bookId);
  const isSavingReview = reviewLoading || updateReviewLoading;

  const fullDescription = book?.description ?? "";
  const hasLongDescription = fullDescription.length > 200;
  const descriptionText = descriptionExpanded || !hasLongDescription ? fullDescription : `${fullDescription.slice(0, 200)}...`;

  const handleReviewSubmit = async (values: { rating: number; text: string }) => {
    if (values.rating > 0) {
      await submitRating({ bookId, rating: values.rating }).unwrap().catch(() => undefined);
    }

    if (myReview?.id) {
      await updateReview({
        bookId,
        reviewId: myReview.id,
        review: values.text,
      }).unwrap();
      setToastMessage("Review updated.");
    } else {
      await createReview({ bookId, review: values.text }).unwrap();
      setToastMessage("Review saved.");
    }

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
            <Button
              color="primary"
              radius="full"
              className="h-11"
              onPress={() => {
                reviewComposerRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
              }}
            >
              {myReview ? "Edit your review" : "Write a review"}
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

          <div id="review-composer" ref={reviewComposerRef}>
            <ReviewComposer
              onSubmit={handleReviewSubmit}
              isSubmitting={isSavingReview}
              initialValues={myReview ? { text: myReview.text, rating: 0 } : undefined}
              heading={myReview ? "Edit your review" : "Write a review"}
              submitLabel={myReview ? "Update review" : "Save review"}
              resetAfterSubmit={!myReview}
            />
          </div>

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