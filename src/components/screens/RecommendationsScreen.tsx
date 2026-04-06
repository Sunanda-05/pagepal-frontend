"use client";

import React from "react";
import AppShell from "@/components/layout/AppShell";
import BookCard from "@/components/ui/BookCard";
import BookCover from "@/components/ui/BookCover";
import EmptyState from "@/components/ui/EmptyState";
import LoadMoreButton from "@/components/ui/LoadMoreButton";
import { BookCardSkeleton } from "@/components/ui/Skeletons";
import { useGetRecommendationsQuery } from "@/redux/apis/pagepalEndpoints";

export function RecommendationsScreen() {
  const { data, isLoading } = useGetRecommendationsQuery();
  const books = data?.items ?? [];
  const reasonBooks = books.slice(0, 6);
  const maxScore = books.reduce((max, book) => {
    if (typeof book.recommendationScore !== "number") {
      return max;
    }
    return Math.max(max, book.recommendationScore);
  }, 0);

  const toMatchStrength = (score?: number): number | undefined => {
    if (typeof score !== "number" || maxScore <= 0) {
      return undefined;
    }

    return Math.max(1, Math.min(100, Math.round((score / maxScore) * 100)));
  };

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
              <span className="max-w-[180px] truncate text-xs text-text-muted">
                score {typeof book.recommendationScore === "number" ? book.recommendationScore.toFixed(2) : "0.00"}
              </span>
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
              {books.map((book) => {
                const strength = toMatchStrength(book.recommendationScore);
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