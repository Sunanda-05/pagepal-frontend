"use client";

import React, {  } from "react";
import BookCard from "@/components/ui/BookCard";
import EmptyState from "@/components/ui/EmptyState";
import LoadMoreButton from "@/components/ui/LoadMoreButton";
import { BookCardSkeleton } from "@/components/ui/Skeletons";
import { Book } from "@/types/pagepal";


export function BooksGrid({ books, isLoading }: { books: Book[]; isLoading?: boolean }) {
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