"use client";

import React from "react";
import { IconChevronLeft, IconChevronRight, IconPlus } from "@tabler/icons-react";
import { Book } from "@/types/pagepal";
import BookCover from "@/components/ui/BookCover";
import ProgressBar from "@/components/ui/ProgressBar";

interface ShelfStripProps {
  books: Book[];
  currentBookId?: string;
  onAddBook?: () => void;
  desktopGrid?: boolean;
  progressByBookId?: Record<string, number>;
}

export default function ShelfStrip({
  books,
  currentBookId,
  onAddBook,
  desktopGrid = false,
  progressByBookId,
}: ShelfStripProps) {
  const containerId = React.useId();

  const orderedBooks = [...books].sort((a, b) => {
    if (a.id === currentBookId) return -1;
    if (b.id === currentBookId) return 1;
    return 0;
  });

  const scrollBy = (direction: "left" | "right") => {
    const element = document.getElementById(containerId);
    if (!element) return;

    element.scrollBy({
      left: direction === "right" ? 220 : -220,
      behavior: "smooth",
    });
  };

  return (
    <section className="space-y-3">
      <header className="flex items-center justify-between">
        <p className="section-kicker">Your shelf</p>
        <span className="mono-meta">{orderedBooks.length} books</span>
      </header>

      <div className="group relative">
        <div
          id={containerId}
          className={`shelf-scroll -mx-1 flex gap-3 overflow-x-auto px-1 pb-2 ${desktopGrid ? "lg:grid lg:grid-cols-3 lg:overflow-visible" : ""}`}
        >
          {orderedBooks.map((book) => {
            const isCurrent = book.id === currentBookId;
            const progress = Math.max(0, Math.min(100, progressByBookId?.[book.id] ?? (isCurrent ? 42 : 0)));

            return (
              <article key={book.id} className="book-hoverable relative w-[92px] shrink-0">
                {isCurrent ? (
                  <span className="absolute -top-2 left-0 z-10 rounded-full bg-[var(--color-primary-subtle)] px-2 py-0.5 font-mono text-[9px] text-[var(--color-primary-text)]">
                    reading
                  </span>
                ) : null}

                <BookCover title={book.title} seed={book.id} size="sm" className="mx-auto" />
                {isCurrent ? <ProgressBar value={progress} className="mt-2" /> : null}

                <p className="mt-2 line-clamp-2 text-[11px] leading-4 text-text">{book.title}</p>
                <p className="book-title-secondary mt-1 truncate text-[10px] text-text-muted">{book.authorName}</p>
              </article>
            );
          })}

          <button
            type="button"
            className="flex h-[112px] w-[82px] shrink-0 flex-col items-center justify-center rounded-md border border-dashed border-border text-text-muted"
            onClick={onAddBook}
          >
            <IconPlus size={20} />
            <span className="mt-1 text-[10px]">Add book</span>
          </button>
        </div>

        <button
          type="button"
          className="absolute left-[-8px] top-[40%] hidden h-8 w-8 items-center justify-center rounded-full border border-border bg-surface text-text-muted opacity-0 transition-opacity group-hover:opacity-100 lg:flex"
          onClick={() => scrollBy("left")}
          aria-label="Scroll shelf left"
        >
          <IconChevronLeft size={16} />
        </button>

        <button
          type="button"
          className="absolute right-[-8px] top-[40%] hidden h-8 w-8 items-center justify-center rounded-full border border-border bg-surface text-text-muted opacity-0 transition-opacity group-hover:opacity-100 lg:flex"
          onClick={() => scrollBy("right")}
          aria-label="Scroll shelf right"
        >
          <IconChevronRight size={16} />
        </button>
      </div>
    </section>
  );
}
