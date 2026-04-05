"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  IconArrowLeft,
  IconPencil,
  IconShare3,
} from "@tabler/icons-react";
import { Button } from "@heroui/button";
import AppShell from "@/components/layout/AppShell";
import EmptyState from "@/components/ui/EmptyState";
import LoadMoreButton from "@/components/ui/LoadMoreButton";
import StarRating from "@/components/ui/StarRating";
import UserAvatar from "@/components/ui/UserAvatar";
import {
  useGetBookByIdQuery,
  useGetRatingsQuery,
  useGetReviewsQuery,
} from "@/redux/apis/pagepalEndpoints";
import { relativeDateLabel } from "@/utils/bookUtil";

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
            href={`/books/${bookId}#review-composer`}
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